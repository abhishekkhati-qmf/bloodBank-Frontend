import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from "../../services/API";
import Spinner from '../../components/shared/Spinner';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import moment from 'moment';

const DonorsList = () => {
  const { user } = useSelector((state) => state.auth);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all donors
  const getDonors = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/inventory/get-donors');
      
      if (data?.success) {
        setDonors(data.donors || []);
      } else {
        console.log('API response:', data);
        setDonors([]);
      }
    } catch (error) {
      console.log('Error fetching donors:', error);
      toast.error("Error fetching donors");
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'organisation') {
      getDonors();
    }
  }, [user]);

  // Filter donors based on search
  const filteredDonors = donors.filter(donor => 
    donor.name?.toLowerCase().includes(search.toLowerCase()) ||
    donor.email?.toLowerCase().includes(search.toLowerCase()) ||
    donor.bloodGroup?.toLowerCase().includes(search.toLowerCase()) ||
    donor.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mt-4">
        <div className="row mb-4">
          <div className="col-12">
            <h3>Donors Directory</h3>
            <p className="text-muted">
              View all registered donors and their information for blood donation coordination.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fa-solid fa-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search donors by name, email, blood group, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">All Donors ({filteredDonors.length})</h5>
            </div>
            <div className="card-body">
              {filteredDonors.length === 0 ? (
                <p className="text-muted text-center">No donors found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr className="table-active">
                        <th>Name</th>
                        <th>Blood Group</th>
                        <th>Contact</th>
                        <th>Location</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Donation Info</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDonors.map((donor) => (
                        <tr key={donor._id}>
                          <td>
                            <strong>{donor.name || 'N/A'}</strong>
                            <div className="text-muted small">{donor.email}</div>
                          </td>
                          <td>
                            <span className="badge bg-danger">{donor.bloodGroup || 'N/A'}</span>
                          </td>
                          <td>
                            <div>{donor.phone || 'N/A'}</div>
                            <div className="text-muted small">{donor.email}</div>
                          </td>
                          <td>
                            <div>{donor.city || 'N/A'}</div>
                            <div className="text-muted small">{donor.address || 'N/A'}</div>
                          </td>
                          <td>{donor.age || 'N/A'}</td>
                          <td>
                            <span className="badge bg-info">
                              {donor.gender ? donor.gender.charAt(0).toUpperCase() + donor.gender.slice(1) : 'N/A'}
                            </span>
                          </td>
                          <td>
                            {donor.donationInfo ? (
                              <div className="small">
                                <div><strong>Total:</strong> {donor.donationInfo.totalDonations} donations</div>
                                <div><strong>Quantity:</strong> {donor.donationInfo.totalQuantity} ml</div>
                                {donor.donationInfo.lastDonationDate && (
                                  <div><strong>Last:</strong> {moment(donor.donationInfo.lastDonationDate).format('DD/MM/YYYY')}</div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted">No donations</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${donor.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                              {donor.status === 'active' ? 'Active' : 'Blocked'}
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
        )}
      </div>
    </Layout>
  );
};

export default DonorsList;
