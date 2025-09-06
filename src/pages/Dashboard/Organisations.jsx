import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from "../../services/API";
import moment from 'moment';
import Spinner from '../../components/shared/Spinner';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const Organisations = () => {
  const { user } = useSelector((state) => state.auth);
  const [organisations, setOrganisations] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [search, setSearch] = useState('');
  const [bloodRequestForm, setBloodRequestForm] = useState({
    bloodGroup: '',
    quantity: '',
    organisationId: null
  });

  // Fetch organisations with blood inventory
  const getOrganisations = async () => {
    try {
      setLoading(true);
      let endpoint = '/donation-requests/organisations';
      
      // Use different endpoint for hospitals
      if (user?.role === 'hospital') {
        endpoint = '/inventory/all-organisations';
      }
      
      const { data } = await API.get(endpoint);
      
      if (data?.success) {
        setOrganisations(data.organisations || []);
      } else {
        console.log('API response:', data);
        setOrganisations([]);
      }
    } catch (error) {
      console.log('Error fetching organisations:', error);
      toast.error("Error fetching organisations");
      setOrganisations([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch donation requests for the donor (limit to last 6)
  const getDonationRequests = async () => {
    if (user?.role === 'donor') {
      try {
        const { data } = await API.get('/api/donation-requests/donor');
        if (data?.success) {
          const allRequests = data.donationRequests || [];
          // Limit to last 6 requests
          setDonationRequests(allRequests.slice(0, 6));
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching donation requests");
      }
    } else if (user?.role === 'hospital') {
      try {
        const { data } = await API.get('/api/requests/hospital');
        if (data?.success) {
          const allRequests = data.requests || [];
          // Limit to last 6 requests
          setDonationRequests(allRequests.slice(0, 6));
        }
      } catch (error) {
        console.log(error);
        toast.error("Error fetching blood requests");
      }
    }
  };

  useEffect(() => {
    getOrganisations();
    getDonationRequests();
  }, []);

  // Handle donation request (for donors) or blood request (for hospitals)
  const handleRequest = async (organisationId) => {
    if (user?.role === 'donor') {
      try {
        const { data } = await API.post('/api/donation-requests/create', {
          organisationId,
          bloodGroup: user.bloodGroup
        });
        
        if (data?.success) {
          toast.success("Donation request sent successfully!");
          getDonationRequests(); // Refresh the list
        }
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Error sending donation request");
      }
    } else if (user?.role === 'hospital') {
      // For hospitals, show modal form instead of prompts
      setBloodRequestForm({
        bloodGroup: '',
        quantity: '',
        organisationId: organisationId
      });
      setShowRequestModal(true);
    }
  };

  // Handle blood request form submission for hospitals
  const handleBloodRequestSubmit = async () => {
    if (!bloodRequestForm.bloodGroup || !bloodRequestForm.quantity) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data } = await API.post('/api/requests', {
        organisationId: bloodRequestForm.organisationId,
        bloodGroup: bloodRequestForm.bloodGroup,
        quantity: parseInt(bloodRequestForm.quantity)
      });
      
      if (data?.success) {
        if (data?.autoRejected) {
          toast.error("Request rejected: No stock available.");
        } else {
          toast.success("Blood request sent successfully!");
        }
        setShowRequestModal(false);
        getDonationRequests(); // Refresh the list
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Error sending blood request");
    }
  };

  // Get blood group color
  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      'A+': 'bg-danger',
      'A-': 'bg-danger',
      'B+': 'bg-warning',
      'B-': 'bg-warning',
      'AB+': 'bg-info',
      'AB-': 'bg-info',
      'O+': 'bg-success',
      'O-': 'bg-success'
    };
    return colors[bloodGroup] || 'bg-secondary';
  };

  // Format blood quantity
  const formatBloodQuantity = (quantity) => {
    if (!quantity || quantity === 0) return '0 ml';
    if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)} L`;
    }
    return `${quantity} ml`;
  };

  return (
    <Layout>
      <div className="container mt-4">
        {/* Requests Status */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  {user?.role === 'donor' ? 'Your Donation Requests Status' : 'Your Blood Requests Status'}
                </h5>
              </div>
              <div className="card-body">
                {donationRequests.length === 0 ? (
                  <p className="text-muted text-center">
                    {user?.role === 'donor' ? 'No donation requests found.' : 'No blood requests found.'}
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr className="table-active">
                          <th>{user?.role === 'donor' ? 'Organisation' : 'Organisation'}</th>
                          <th>Blood Group</th>
                          <th>Request Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donationRequests.map((request) => (
                          <tr key={request._id}>
                            <td>{request.organisation?.organisationName || 'N/A'}</td>
                            <td>
                              <span className="badge bg-danger">{request.bloodGroup}</span>
                            </td>
                            <td>{moment(request.requestDate || request.createdAt).format('DD/MM/YYYY')}</td>
                            <td>
                              <span className={`badge ${
                                request.status === 'pending' ? 'bg-warning' : 
                                request.status === 'approved' ? 'bg-success' : 
                                request.status === 'rejected' ? 'bg-danger' : 
                                request.status === 'completed' ? 'bg-info' : 
                                request.status === 'fulfilled' ? 'bg-success' :
                                'bg-secondary'
                              }`}>
                                {request.status === 'completed' ? 'Completed' : 
                                 request.status === 'fulfilled' ? 'Fulfilled' :
                                 request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <h3>Browse Organisations</h3>
            <p className="text-muted">
              View all blood bank organisations, check their blood inventory, and send donation requests.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner size={80} />
          </div>
        ) : user?.role === 'hospital' ? (
          // Hospital view - show table format like image2
          <div className="card">
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Browse All Organisations</h5>
                <div className="d-flex align-items-center">
                  <input 
                    className="form-control me-2" 
                    placeholder="Search by organisation name, address, or email" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ width: '300px' }}
                  />
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr className="table-active">
                      <th>Organisation Name</th>
                      <th>Address</th>
                      <th>Contact</th>
                      <th>Available Blood Types</th>
                      <th>Website</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organisations.filter(org => {
                      const q = search.toLowerCase();
                      return !q || [org.organisationName, org.address, org.email].some(v=>String(v||'').toLowerCase().includes(q));
                    }).map(org => (
                      <tr key={org._id}>
                        <td><strong>{org.organisationName || org.email}</strong></td>
                        <td>{org.address || '-'}</td>
                        <td>{org.phone || org.email || '-'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {Object.entries(org.availability || org.bloodInventory || {}).map(([bloodType, quantity]) => (
                              <span key={bloodType} className="badge bg-success">
                                {bloodType}: {formatBloodQuantity(quantity)}
                              </span>
                            ))}
                            {(!org.availability && !org.bloodInventory || Object.keys(org.availability || org.bloodInventory || {}).length === 0) && (
                              <span className="text-muted">No data available</span>
                            )}
                          </div>
                        </td>
                        <td>
                          {org.website ? (
                            <a href={org.website.startsWith('http') ? org.website : `https://${org.website}`} 
                               target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary">
                              Website
                            </a>
                          ) : '-'}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-primary me-2" 
                            onClick={() => handleRequest(org._id)}
                          >
                            Send Request
                          </button>
                          <a 
                            className="btn btn-sm btn-outline-secondary" 
                            href={`mailto:${org.email}`}
                          >
                            Contact
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Donor view - show card format
          <div className="row">
            {organisations.map((org) => (
              <div key={org._id} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">{org.organisationName}</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <p className="mb-1">
                        <strong>Contact:</strong> {org.phone || org.email}
                      </p>
                      <p className="mb-1">
                        <strong>Address:</strong> {org.address}, {org.city}
                      </p>
                      {org.website && (
                        <p className="mb-1">
                          <strong>Website:</strong> 
                          <a href={org.website} target="_blank" rel="noopener noreferrer" className="ms-1">
                            {org.website}
                          </a>
                        </p>
                      )}
                    </div>

                    <div className="mb-3">
                      <h6 className="text-muted">Blood Inventory:</h6>
                      <div className="row">
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <div key={bg} className="col-6 mb-2">
                            <div className="d-flex align-items-center">
                              <span className={`badge ${getBloodGroupColor(bg)} me-2`}>
                                {bg}
                              </span>
                              <small className="text-muted">
                                {formatBloodQuantity(org.bloodInventory?.[bg] || 0)}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="d-grid">
                      <button
                        className="btn btn-success"
                        onClick={() => handleRequest(org._id)}
                      >
                        <i className="fa-solid fa-heart me-2"></i>
                        Send Donation Request
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && organisations.length === 0 && (
          <div className="text-center py-5">
            <p className="text-muted">No organisations found.</p>
          </div>
        )}

        {/* Blood Request Modal for Hospitals */}
        {showRequestModal && user?.role === 'hospital' && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Send Blood Request</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowRequestModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Blood Group</label>
                    <select 
                      className="form-select" 
                      value={bloodRequestForm.bloodGroup}
                      onChange={(e) => setBloodRequestForm({
                        ...bloodRequestForm,
                        bloodGroup: e.target.value
                      })}
                    >
                      <option value="">Select Blood Group</option>
                      {['O+','O-','AB+','AB-','A+','A-','B+','B-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity (ml)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="Enter quantity in ml"
                      value={bloodRequestForm.quantity}
                      onChange={(e) => setBloodRequestForm({
                        ...bloodRequestForm,
                        quantity: e.target.value
                      })}
                      min="1"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowRequestModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleBloodRequestSubmit}
                  >
                    Send Request
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

export default Organisations;
