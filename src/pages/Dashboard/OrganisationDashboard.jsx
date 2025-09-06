import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from "../../services/API";
import moment from 'moment';
import Spinner from '../../components/shared/Spinner';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const OrganisationDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  // Fetch donation requests for the organisation
  const getDonationRequests = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/api/donation-requests/organisation');
      
      if (data?.success) {
        setDonationRequests(data.donationRequests || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching donation requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDonationRequests();
  }, []);

  // Handle donation request response
  const handleRequestResponse = async (requestId, status) => {
    try {
      const { data } = await API.put(`/api/donation-requests/${requestId}/status`, {
        status,
        responseNotes: responseNotes || ''
      });
      
      if (data?.success) {
        toast.success(`Request ${status} successfully`);
        setShowResponseModal(false);
        setSelectedRequest(null);
        setResponseNotes('');
        getDonationRequests(); // Refresh the list
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error updating request");
    }
  };

  // Handle direct status updates for approve/reject
  const handleDirectStatusUpdate = async (requestId, status) => {
    try {
      const { data } = await API.put(`/api/donation-requests/${requestId}/status`, {
        status,
        responseNotes: ''
      });
      
      if (data?.success) {
        toast.success(`Request ${status} successfully!`);
        getDonationRequests(); // Refresh the list
      } else {
        toast.error(data?.message || 'Failed to update status');
      }
    } catch (error) {
      console.log('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  // Open response modal only for completed (needs notes)
  const openResponseModal = (request, status) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'approved': return 'bg-success';
      case 'rejected': return 'bg-danger';
      case 'completed': return 'bg-info';
      case 'cancelled': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  // Get status display text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-12">
            <h3>Donation Requests Management</h3>
            <p className="text-muted">
              Manage blood donation requests from donors. Approve, reject, or mark as completed.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Donation Requests</h5>
            </div>
            <div className="card-body">
              {donationRequests.length === 0 ? (
                <p className="text-muted text-center">No donation requests found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Donor Name</th>
                        <th>Blood Group</th>
                        <th>Contact</th>
                        <th>City</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donationRequests.map((request) => (
                        <tr key={request._id}>
                          <td>
                            <strong>{request.donor?.name || 'N/A'}</strong>
                            <div className="text-muted small">{request.donor?.email}</div>
                          </td>
                          <td>
                            <span className="badge bg-danger">{request.bloodGroup}</span>
                          </td>
                          <td>
                            <div>{request.donor?.phone || 'N/A'}</div>
                            <div className="text-muted small">{request.donor?.email}</div>
                          </td>
                          <td>{request.donor?.city || 'N/A'}</td>
                          <td>{moment(request.requestDate).format('DD/MM/YYYY')}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeColor(request.status)}`}>
                              {getStatusText(request.status)}
                            </span>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleDirectStatusUpdate(request._id, 'approved')}
                                >
                                  <i className="fa-solid fa-check me-1"></i>
                                  Approve
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDirectStatusUpdate(request._id, 'rejected')}
                                >
                                  <i className="fa-solid fa-times me-1"></i>
                                  Reject
                                </button>
                              </div>
                            )}
                            {request.status === 'approved' && (
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => handleDirectStatusUpdate(request._id, 'completed')}
                              >
                                <i className="fa-solid fa-check-double me-1"></i>
                                Mark Completed
                              </button>
                            )}
                            {request.status === 'completed' && (
                              <span className="text-success">
                                <i className="fa-solid fa-check-circle me-1"></i>
                                Completed
                              </span>
                            )}
                            {request.status === 'rejected' && (
                              <span className="text-danger">
                                <i className="fa-solid fa-times-circle me-1"></i>
                                Rejected
                              </span>
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

        {/* Response Modal */}
        {showResponseModal && selectedRequest && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {selectedRequest.status === 'approved' ? 'Approve' : 
                     selectedRequest.status === 'rejected' ? 'Reject' : 
                     'Mark as Completed'} Donation Request
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowResponseModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Response Notes (Optional):</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={responseNotes}
                      onChange={(e) => setResponseNotes(e.target.value)}
                      placeholder="Add any notes or instructions for the donor..."
                    ></textarea>
                  </div>
                  <div className="alert alert-info">
                    <strong>Donor:</strong> {selectedRequest.donor?.name}<br/>
                    <strong>Blood Group:</strong> {selectedRequest.bloodGroup}<br/>
                    <strong>Contact:</strong> {selectedRequest.donor?.phone || selectedRequest.donor?.email}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowResponseModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      selectedRequest.status === 'approved' ? 'btn-success' : 
                      selectedRequest.status === 'rejected' ? 'btn-danger' : 
                      'btn-info'
                    }`}
                    onClick={() => handleRequestResponse(selectedRequest._id, selectedRequest.status)}
                  >
                    {selectedRequest.status === 'approved' ? 'Approve' : 
                     selectedRequest.status === 'rejected' ? 'Reject' : 
                     'Mark as Completed'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Backdrop */}
        {showResponseModal && (
          <div className="modal-backdrop fade show"></div>
        )}
      </div>
    </Layout>
  );
};

export default OrganisationDashboard;
