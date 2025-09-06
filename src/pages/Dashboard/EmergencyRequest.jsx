import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import Spinner from '../../components/shared/Spinner';
import { useSelector } from 'react-redux';
import moment from 'moment';

const EmergencyRequest = () => {
  const { user } = useSelector((state) => state.auth);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [temp, setTemp] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    bloodGroup: '',
    quantity: '',
    urgency: 'high',
    reason: '',
    location: '',
    city: '',
    contactPerson: '',
    contactPhone: '',
  });

  // Fetch emergency requests
  const getEmergencyRequests = async () => {
    try {
      setTemp(true);
      const { data } = await API.get('/api/emergency/organisation');
      if (data?.success) {
        setEmergencyRequests(data.emergencyRequests || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTemp(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'organisation') {
      getEmergencyRequests();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      bloodGroup: '',
      quantity: '',
      urgency: 'high',
      reason: '',
      location: '',
      city: '',
      contactPerson: '',
      contactPhone: '',
    });
    setShowCreateForm(false);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data } = await API.post('/api/emergency/create', formData);
      if (data?.success) {
        alert('Emergency request created and broadcasted successfully!');
        getEmergencyRequests();
        resetForm();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to create emergency request');
      console.log(error);
    }
  };

  // Delete emergency request
  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this emergency request? This action cannot be undone.')) {
      return;
    }

    try {
      const { data } = await API.delete(`/emergency/${requestId}`);
      if (data?.success) {
        alert('Emergency request deleted successfully!');
        getEmergencyRequests();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete emergency request');
      console.log(error);
    }
  };

  // Mark emergency request as fulfilled
  const handleMarkFulfilled = async (requestId) => {
    if (!window.confirm('Mark this emergency request as fulfilled? This will send follow-up notifications to all notified donors.')) {
      return;
    }

    try {
      const { data } = await API.put(`/emergency/${requestId}/fulfill`, {
        notes: 'Emergency request fulfilled by organisation'
      });
      if (data?.success) {
        alert('Emergency request marked as fulfilled! Follow-up notifications sent to donors.');
        getEmergencyRequests();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to mark emergency request as fulfilled');
      console.log(error);
    }
  };

  if (user?.role !== 'organisation') {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="alert alert-warning">
            This page is only accessible to organisations.
          </div>
        </div>
      </Layout>
    );
  }

  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyOptions = [
    { value: 'high', label: 'High', color: 'warning' },
    { value: 'critical', label: 'Critical', color: 'danger' },
    { value: 'emergency', label: 'Emergency', color: 'dark' }
  ];

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Emergency Blood Requests</h3>
          <button 
            className="btn btn-danger"
            onClick={() => setShowCreateForm(true)}
          >
            <i className="fa-solid fa-exclamation-triangle me-2"></i>
            Create Emergency Request
          </button>
        </div>

        {/* Create Emergency Request Form */}
        {showCreateForm && (
          <div className="card mb-4 border-danger">
            <div className="card-header bg-danger text-white">
              <h5 className="mb-0">
                <i className="fa-solid fa-exclamation-triangle me-2"></i>
                Create Emergency Blood Request
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Blood Group Needed *</label>
                    <select
                      className="form-select"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroupOptions.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Quantity Required (ml) *</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Urgency Level *</label>
                    <select
                      className="form-select"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      required
                    >
                      {urgencyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Location *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Hospital Name, Address"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contact Person *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contact Phone *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Reason for Emergency *</label>
                  <textarea
                    className="form-control"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe the emergency situation and why blood is urgently needed..."
                    required
                  />
                </div>

                <div className="alert alert-warning">
                  <i className="fa-solid fa-exclamation-triangle me-2"></i>
                  <strong>Important:</strong> This emergency request will automatically broadcast to all eligible donors in your city with the required blood group. Please ensure all information is accurate.
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-danger">
                    <i className="fa-solid fa-exclamation-triangle me-2"></i>
                    Create Emergency Request
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Emergency Requests List */}
        {temp ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Your Emergency Requests</h5>
            </div>
            <div className="card-body">
              {emergencyRequests.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No emergency requests created yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
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
                            <span className="badge bg-danger fs-6">{request.bloodGroup}</span>
                          </td>
                          <td>{request.quantity} ml</td>
                          <td>
                            <span className={`badge bg-${urgencyOptions.find(u => u.value === request.urgency)?.color || 'secondary'}`}>
                              {request.urgency.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div>{request.location}</div>
                            <small className="text-muted">{request.city}</small>
                          </td>
                          <td>
                            <span className={`badge ${
                              request.status === 'active' ? 'bg-success' :
                              request.status === 'fulfilled' ? 'bg-info' :
                              request.status === 'cancelled' ? 'bg-warning' :
                              request.status === 'blocked' ? 'bg-danger' :
                              'bg-secondary'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
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
                            <div className="btn-group" role="group">
                              {request.status === 'active' && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleMarkFulfilled(request._id)}
                                  title="Mark as Fulfilled"
                                >
                                  <i className="fa-solid fa-check"></i>
                                </button>
                              )}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteRequest(request._id)}
                                title="Delete Request"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
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
      </div>
    </Layout>
  );
};

export default EmergencyRequest;
