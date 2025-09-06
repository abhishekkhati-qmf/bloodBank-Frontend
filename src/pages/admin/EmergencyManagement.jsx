import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import Spinner from '../../components/shared/Spinner';
import { useSelector } from 'react-redux';
import moment from 'moment';

const EmergencyManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [temp, setTemp] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionData, setActionData] = useState({
    status: '',
    adminNotes: ''
  });

  // Fetch emergency requests and stats
  const getEmergencyData = async () => {
    try {
      setTemp(true);
      const [requestsRes, statsRes] = await Promise.all([
        API.get('/api/emergency/all'),
        API.get('/api/emergency/stats')
      ]);
      
      if (requestsRes?.data?.success) {
        setEmergencyRequests(requestsRes.data.emergencyRequests || []);
      }
      
      if (statsRes?.data?.success) {
        setStats(statsRes.data.stats || {});
      }
    } catch (error) {
      toast.error("Error fetching emergency data");
    } finally {
      setTemp(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      getEmergencyData();
    }
  }, [user]);

  // Handle action modal
  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionData({ status: action, adminNotes: '' });
    setShowActionModal(true);
  };

  // Submit action
  const submitAction = async () => {
    try {
      const { data } = await API.put(`/emergency/${selectedRequest._id}/status`, actionData);
      if (data?.success) {
        alert(`Emergency request ${actionData.status} successfully`);
        setShowActionModal(false);
        getEmergencyData();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update request status');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="alert alert-warning">
            This page is only accessible to administrators.
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'success', icon: 'fa-play' },
      fulfilled: { color: 'info', icon: 'fa-check' },
      cancelled: { color: 'warning', icon: 'fa-ban' },
      blocked: { color: 'danger', icon: 'fa-lock' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', icon: 'fa-question' };
    
    return (
      <span className={`badge bg-${config.color}`}>
        <i className={`fa-solid ${config.icon} me-1`}></i>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      high: { color: 'warning', icon: 'fa-exclamation' },
      critical: { color: 'danger', icon: 'fa-exclamation-triangle' },
      emergency: { color: 'dark', icon: 'fa-radiation' }
    };
    
    const config = urgencyConfig[urgency] || { color: 'secondary', icon: 'fa-info' };
    
    return (
      <span className={`badge bg-${config.color}`}>
        <i className={`fa-solid ${config.icon} me-1`}></i>
        {urgency.toUpperCase()}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-4">Emergency Blood Request Management</h3>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h4>{stats.total || 0}</h4>
                <p className="mb-0">Total Requests</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h4>{stats.active || 0}</h4>
                <p className="mb-0">Active Requests</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h4>{stats.fulfilled || 0}</h4>
                <p className="mb-0">Fulfilled</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h4>{stats.cancelled || 0}</h4>
                <p className="mb-0">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Requests Table */}
        {temp ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">All Emergency Requests</h5>
            </div>
            <div className="card-body">
              {emergencyRequests.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No emergency requests found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Organisation</th>
                        <th>Blood Group</th>
                        <th>Quantity</th>
                        <th>Urgency</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Eligible Donors</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emergencyRequests.map(request => (
                        <tr key={request._id}>
                          <td>
                            <div>
                              <strong>{request.organisation?.organisationName || 'Unknown'}</strong>
                              <br />
                              <small className="text-muted">{request.organisation?.email}</small>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-danger fs-6">{request.bloodGroup}</span>
                          </td>
                          <td>{request.quantity} ml</td>
                          <td>{getUrgencyBadge(request.urgency)}</td>
                          <td>
                            <div>{request.location}</div>
                            <small className="text-muted">{request.city}</small>
                          </td>
                          <td>{getStatusBadge(request.status)}</td>
                          <td>
                            <div>{moment(request.createdAt).format('DD/MM/YYYY')}</div>
                            <small className="text-muted">{moment(request.createdAt).format('hh:mm A')}</small>
                          </td>
                          <td>
                            <span className="badge bg-info">
                              {request.eligibleDonors?.length || 0} donors
                            </span>
                            {request.broadcastSent && (
                              <div className="text-success small">
                                <i className="fa-solid fa-check me-1"></i>
                                Broadcast sent
                              </div>
                            )}
                          </td>
                          <td>
                            {request.status === 'active' && (
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() => handleAction(request, 'cancelled')}
                                  title="Cancel Request"
                                >
                                  <i className="fa-solid fa-ban"></i>
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleAction(request, 'blocked')}
                                  title="Block Request"
                                >
                                  <i className="fa-solid fa-lock"></i>
                                </button>
                              </div>
                            )}
                            {request.status !== 'active' && (
                              <span className="text-muted small">No actions available</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {actionData.status === 'cancelled' ? 'Cancel' : 'Block'} Emergency Request
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowActionModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    <strong>Warning:</strong> This action will {actionData.status === 'cancelled' ? 'cancel' : 'block'} the emergency request and prevent further notifications to donors.
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Admin Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Reason for this action..."
                      value={actionData.adminNotes}
                      onChange={(e) => setActionData(prev => ({ ...prev, adminNotes: e.target.value }))}
                    />
                  </div>

                  <div className="mb-3">
                    <strong>Request Details:</strong>
                    <div className="mt-2">
                      <p><strong>Blood Group:</strong> {selectedRequest?.bloodGroup}</p>
                      <p><strong>Quantity:</strong> {selectedRequest?.quantity} ml</p>
                      <p><strong>Urgency:</strong> {selectedRequest?.urgency}</p>
                      <p><strong>Reason:</strong> {selectedRequest?.reason}</p>
                      <p><strong>Location:</strong> {selectedRequest?.location}, {selectedRequest?.city}</p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className={`btn btn-${actionData.status === 'cancelled' ? 'warning' : 'danger'}`}
                    onClick={submitAction}
                  >
                    {actionData.status === 'cancelled' ? 'Cancel' : 'Block'} Request
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowActionModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EmergencyManagement;
