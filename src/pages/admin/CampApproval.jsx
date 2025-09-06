import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import Spinner from '../../components/shared/Spinner';
import { useSelector } from 'react-redux';
import moment from 'moment';

const CampApproval = () => {
  const { user } = useSelector((state) => state.auth);
  const [camps, setCamps] = useState([]);
  const [temp, setTemp] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState({});

  // Fetch pending camps
  const getPendingCamps = async () => {
    try {
      setTemp(true);
      const { data } = await API.get('/api/camps/pending');
      if (data?.success) {
        setCamps(data.camps || []);
      }
    } catch (error) {
      toast.error("Error fetching pending camps");
    } finally {
      setTemp(false);
    }
  };

  // Fetch camp statistics
  const getCampStats = async () => {
    try {
      const { data } = await API.get('/api/camps/stats');
      if (data?.success) {
        setStats(data.stats || {});
      }
    } catch (error) {
      toast.error("Error fetching camp statistics");
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      getPendingCamps();
      getCampStats();
    }
  }, [user]);

  // Handle camp approval/rejection
  const handleStatusUpdate = async (campId, status) => {
    try {
      const { data } = await API.put(`/api/camps/${campId}/status`, {
        status,
        adminNotes: adminNotes.trim() || undefined
      });
      
      if (data?.success) {
        alert(`Camp ${status} successfully!`);
        setShowModal(false);
        setSelectedCamp(null);
        setAdminNotes('');
        getPendingCamps();
        getCampStats();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to update camp status');
    }
  };

  // Open modal for camp review
  const openReviewModal = (camp) => {
    setSelectedCamp(camp);
    setAdminNotes('');
    setShowModal(true);
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

  return (
    <Layout>
      <div className="container mt-4">
        <h3 className="mb-4">Blood Donation Camp Approval</h3>

        {/* Statistics Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{stats.total || 0}</h4>
                <small>Total Camps</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{stats.pending || 0}</h4>
                <small>Pending Approval</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{stats.approved || 0}</h4>
                <small>Approved</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{stats.upcoming || 0}</h4>
                <small>Upcoming</small>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Camps List */}
        {temp ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Pending Camps for Approval</h5>
            </div>
            <div className="card-body">
              {camps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No pending camps for approval.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Camp Details</th>
                        <th>Organisation</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Blood Groups</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {camps.map(camp => (
                        <tr key={camp._id}>
                          <td>
                            <div>
                              <strong>{camp.name}</strong>
                              {camp.description && (
                                <div className="text-muted small mt-1">
                                  {camp.description.substring(0, 80)}...
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{camp.organisation?.organisationName || 'N/A'}</strong>
                              <div className="text-muted small">
                                {camp.organisation?.email || 'N/A'}
                              </div>
                              <div className="text-muted small">
                                {camp.organisation?.phone || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>{moment(camp.date).format('DD/MM/YYYY')}</div>
                            <small className="text-muted">
                              {camp.startTime} - {camp.endTime}
                            </small>
                          </td>
                          <td>
                            <div>{camp.location}</div>
                            <small className="text-muted">{camp.city}</small>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {camp.bloodGroups.map(bg => (
                                <span key={bg} className="badge bg-danger">{bg}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openReviewModal(camp)}
                            >
                              Review & Approve
                            </button>
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

        {/* Review Modal */}
        {showModal && selectedCamp && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Review Camp: {selectedCamp.name}</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Camp Information</h6>
                      <p><strong>Name:</strong> {selectedCamp.name}</p>
                      <p><strong>Description:</strong> {selectedCamp.description}</p>
                      <p><strong>Date:</strong> {moment(selectedCamp.date).format('DD/MM/YYYY')}</p>
                      <p><strong>Time:</strong> {selectedCamp.startTime} - {selectedCamp.endTime}</p>
                      <p><strong>Location:</strong> {selectedCamp.location}, {selectedCamp.city}</p>
                    </div>
                    <div className="col-md-6">
                      <h6>Organisation Details</h6>
                      <p><strong>Name:</strong> {selectedCamp.organisation?.organisationName || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedCamp.organisation?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedCamp.organisation?.phone || 'N/A'}</p>
                      
                      <h6 className="mt-3">Camp Details</h6>
                      <p><strong>Contact Person:</strong> {selectedCamp.contactPerson}</p>
                      <p><strong>Contact Phone:</strong> {selectedCamp.contactPhone}</p>
                      <p><strong>Contact Email:</strong> {selectedCamp.contactEmail}</p>
                      <p><strong>Expected Donors:</strong> {selectedCamp.expectedDonors || 'Not specified'}</p>
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-12">
                      <h6>Blood Groups Needed</h6>
                      <div className="d-flex flex-wrap gap-2 mb-3">
                        {selectedCamp.bloodGroups.map(bg => (
                          <span key={bg} className="badge bg-danger fs-6">{bg}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedCamp.facilities && selectedCamp.facilities.length > 0 && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <h6>Facilities</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedCamp.facilities.map((facility, index) => (
                            <span key={index} className="badge bg-info">{facility}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCamp.requirements && selectedCamp.requirements.length > 0 && (
                    <div className="row mt-3">
                      <div className="col-12">
                        <h6>Requirements</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedCamp.requirements.map((req, index) => (
                            <span key={index} className="badge bg-warning">{req}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <label className="form-label">Admin Notes (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Add any notes or feedback for the organisation..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => handleStatusUpdate(selectedCamp._id, 'approved')}
                  >
                    <i className="fa-solid fa-check me-2"></i>
                    Approve Camp
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleStatusUpdate(selectedCamp._id, 'rejected')}
                  >
                    <i className="fa-solid fa-times me-2"></i>
                    Reject Camp
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
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

export default CampApproval;
