import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import Spinner from '../../components/shared/Spinner';
import { useSelector } from 'react-redux';
import moment from 'moment';

const CampManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [camps, setCamps] = useState([]);
  const [temp, setTemp] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCamp, setEditingCamp] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    city: '',
    bloodGroups: [],
    expectedDonors: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    facilities: [],
    requirements: []
  });

  // Fetch camps
  const getCamps = async () => {
    try {
      setTemp(true);
      const { data } = await API.get('/api/camps/organisation');
      if (data?.success) {
        setCamps(data.camps || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTemp(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'organisation') {
      getCamps();
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

  // Handle blood group selection
  const handleBloodGroupChange = (bloodGroup) => {
    setFormData(prev => ({
      ...prev,
      bloodGroups: prev.bloodGroups.includes(bloodGroup)
        ? prev.bloodGroups.filter(bg => bg !== bloodGroup)
        : [...prev.bloodGroups, bloodGroup]
    }));
  };

  // Handle facilities and requirements
  const handleArrayInput = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      city: '',
      bloodGroups: [],
      expectedDonors: '',
      contactPerson: '',
      contactPhone: '',
      contactEmail: '',
      facilities: [],
      requirements: []
    });
    setEditingCamp(null);
    setShowCreateForm(false);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCamp) {
        // Update existing camp
        const { data } = await API.put(`/api/camps/${editingCamp._id}`, formData);
        if (data?.success) {
          alert('Camp updated successfully!');
          getCamps();
          resetForm();
        }
      } else {
        // Create new camp
        const { data } = await API.post('/api/camps/create', formData);
        if (data?.success) {
          alert('Camp created successfully!');
          getCamps();
          resetForm();
        }
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to save camp');
      console.log(error);
    }
  };

  // Delete camp
  const handleDelete = async (campId) => {
    if (!window.confirm('Are you sure you want to delete this camp?')) return;
    
    try {
      const { data } = await API.delete(`/api/camps/${campId}`);
      if (data?.success) {
        alert('Camp deleted successfully!');
        getCamps();
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to delete camp');
      console.log(error);
    }
  };

  // Mark camp as completed
  const handleMarkCompleted = async (campId) => {
    if (!window.confirm('Are you sure you want to mark this camp as completed? This action cannot be undone.')) return;
    
    try {
      const { data } = await API.put(`/api/camps/${campId}`, {
        status: 'completed'
      });
      
      if (data?.success) {
        alert('Camp marked as completed successfully!');
        getCamps();
      } else {
        alert(data?.message || 'Failed to mark camp as completed');
      }
    } catch (error) {
      alert(error?.response?.data?.message || 'Error marking camp as completed');
      console.log(error);
    }
  };

  // Edit camp
  const handleEdit = (camp) => {
    setEditingCamp(camp);
    setFormData({
      name: camp.name,
      description: camp.description,
      date: moment(camp.date).format('YYYY-MM-DD'),
      startTime: camp.startTime,
      endTime: camp.endTime,
      location: camp.location,
      city: camp.city,
      bloodGroups: camp.bloodGroups || [],
      expectedDonors: camp.expectedDonors || '',
      contactPerson: camp.contactPerson,
      contactPhone: camp.contactPhone,
      contactEmail: camp.contactEmail,
      facilities: camp.facilities || [],
      requirements: camp.requirements || []
    });
    setShowCreateForm(true);
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

  return (
    <Layout>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3>Blood Donation Camp Management</h3>
          <button 
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
          >
            <i className="fa-solid fa-plus me-2"></i>
            Create New Camp
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                {editingCamp ? 'Edit Camp' : 'Create New Camp'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Camp Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={moment().format('YYYY-MM-DD')}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Start Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">End Time *</label>
                    <input
                      type="time"
                      className="form-control"
                      name="endTime"
                      value={formData.endTime}
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
                      placeholder="e.g., Central Park"
                      required
                    />
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

                <div className="mb-3">
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Blood Groups Needed *</label>
                  <div className="d-flex flex-wrap gap-2">
                    {bloodGroupOptions.map(bg => (
                      <div key={bg} className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={bg}
                          checked={formData.bloodGroups.includes(bg)}
                          onChange={() => handleBloodGroupChange(bg)}
                        />
                        <label className="form-check-label" htmlFor={bg}>
                          {bg}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Expected Donors</label>
                    <input
                      type="number"
                      className="form-control"
                      name="expectedDonors"
                      value={formData.expectedDonors}
                      onChange={handleInputChange}
                      min="0"
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
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Contact Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Facilities</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add facility (e.g., Parking, Refreshments)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayInput('facilities', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleArrayInput('facilities', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {formData.facilities.length > 0 && (
                    <div className="mt-2">
                      {formData.facilities.map((facility, index) => (
                        <span key={index} className="badge bg-info me-2 mb-1">
                          {facility}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            onClick={() => removeArrayItem('facilities', index)}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Requirements</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add requirement (e.g., ID proof, Age 18+)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleArrayInput('requirements', e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        handleArrayInput('requirements', input.value);
                        input.value = '';
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {formData.requirements.length > 0 && (
                    <div className="mt-2">
                      {formData.requirements.map((req, index) => (
                        <span key={index} className="badge bg-warning me-2 mb-1">
                          {req}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-2"
                            onClick={() => removeArrayItem('requirements', index)}
                          />
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">
                    {editingCamp ? 'Update Camp' : 'Create Camp'}
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

        {/* Camps List */}
        {temp ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Your Blood Donation Camps</h5>
            </div>
            <div className="card-body">
              {camps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No camps created yet.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(true)}
                  >
                    Create Your First Camp
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Camp Name</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Blood Groups</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {camps.map(camp => (
                        <tr key={camp._id}>
                          <td>
                            <strong>{camp.name}</strong>
                            {camp.description && (
                              <div className="text-muted small">
                                {camp.description.substring(0, 50)}...
                              </div>
                            )}
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
                            <span className={`badge ${
                              camp.status === 'approved' ? 'bg-success' :
                              camp.status === 'rejected' ? 'bg-danger' :
                              camp.status === 'pending' ? 'bg-warning' :
                              camp.status === 'completed' ? 'bg-info' :
                              'bg-secondary'
                            }`}>
                              {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
                            </span>
                            {camp.adminNotes && (
                              <div className="text-muted small mt-1">
                                {camp.adminNotes}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {camp.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEdit(camp)}
                                  >
                                    <i className="fa-solid fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(camp._id)}
                                  >
                                    <i className="fa-solid fa-trash"></i>
                                  </button>
                                </>
                              )}
                              {camp.status === 'approved' && (
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleMarkCompleted(camp._id)}
                                >
                                  <i className="fa-solid fa-check-double me-1"></i>
                                  Mark Completed
                                </button>
                              )}
                              <button className="btn btn-sm btn-outline-info">
                                <i className="fa-solid fa-eye"></i>
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

export default CampManagement;
