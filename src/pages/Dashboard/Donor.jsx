import React, { useEffect, useState } from 'react'
import Layout from '../../components/shared/Layout/Layout'
import API from "../../services/API";
import moment from 'moment';
import Spinner from '../../components/shared/Spinner';
import Modal from '../../components/shared/modal/Modal';
import { useSelector } from 'react-redux';

const Donor = () => {
  const { user } = useSelector((state) => state.auth);
  const [donorData, setDonorData] = useState(null);
  const [organisations, setOrganisations] = useState([]);
  const [donationHistory, setDonationHistory] = useState([]);
  const [recentOrganisations, setRecentOrganisations] = useState([]);
  const [donationRequests, setDonationRequests] = useState([]);

  const [temp, setTemp] = useState(false);

  // Fetch donor data
  const getDonorData = async () => {
    try {
      setTemp(true);
      
      // Get donor's donation history
      const historyRes = await API.post("/inventory/get-inventory-hospital", {
        filters: {
          inventoryType: "in",
          donor: user?._id,
        },
      });
      
      if (historyRes?.data?.success) {
        setDonationHistory(historyRes.data.inventory || []);
      }

      // Get all organisations for blood requests
      const orgsRes = await API.get("/inventory/all-organisations");
      if (orgsRes?.data?.success) {
        setOrganisations(orgsRes.data.organisations || []);
      }

      // Get recent organisations the donor has donated to
      try {
        const recentOrgsRes = await API.get('/donation-requests/recent-organisations');
        if (recentOrgsRes?.data?.success) {
          setRecentOrganisations(recentOrgsRes.data.recentOrganisations || []);
        }
      } catch (error) {
        console.log('Error fetching recent organisations:', error);
        setRecentOrganisations([]);
      }





      // Get donation requests for donors (limit to last 6)
      try {
        const requestsRes = await API.get('/donation-requests/donor');
        if (requestsRes?.data?.success) {
          const allRequests = requestsRes.data.donationRequests || [];
          // Limit to last 6 requests
          setDonationRequests(allRequests.slice(0, 6));
        } else {
          setDonationRequests([]);
        }
      } catch (error) {
        console.log('Error fetching donation requests:', error);
        setDonationRequests([]);
      }



    } catch (error) {
      console.log(error);
    } finally {
      setTemp(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'donor') {
      getDonorData();
    } else if (user?.role === 'organisation') {
      // Fetch all donors for organisations
      const fetchDonors = async () => {
        try {
          setTemp(true);
          const donationRes = await API.post('/inventory/get-inventory-hospital', { 
            filters: { inventoryType: 'in' } 
          });
          if (donationRes?.data?.success) {
            setDonationHistory(donationRes.data.inventory || []);
          }
        } catch (error) {
          console.log('Error fetching donors:', error);
          setDonationHistory([]);
        } finally {
          setTemp(false);
        }
      };
      fetchDonors();
    }
  }, [user]);

  // Calculate donor statistics
  const calculateDonorStats = () => {
    if (!donationHistory.length) return null;

    const totalDonations = donationHistory.length;
    const totalQuantity = donationHistory.reduce((sum, donation) => sum + (donation.quantity || 0), 0);
    const lastDonation = donationHistory.reduce((latest, donation) => {
      return !latest || new Date(donation.createdAt) > new Date(latest.createdAt) ? donation : latest;
    }, null);

    // Calculate next eligible date (3 months from last donation)
    const nextEligibleDate = lastDonation ? moment(lastDonation.createdAt).add(3, 'months') : null;
    const isEligible = !nextEligibleDate || moment().isAfter(nextEligibleDate);

    // Get unique blood groups donated
    const bloodGroups = [...new Set(donationHistory.map(d => d.bloodGroup))];

    return {
      totalDonations,
      totalQuantity,
      lastDonationDate: lastDonation?.createdAt,
      nextEligibleDate: nextEligibleDate?.toDate(),
      isEligible,
      bloodGroups
    };
  };

  // Calculate badges and achievements
  const calculateBadges = () => {
    const stats = calculateDonorStats();
    if (!stats) return [];

    const badges = [];

    if (stats.totalDonations >= 1) badges.push({ name: "First Donor", icon: "🥇", color: "bg-warning" });
    if (stats.totalDonations >= 5) badges.push({ name: "Regular Donor", icon: "🥈", color: "bg-info" });
    if (stats.totalDonations >= 10) badges.push({ name: "Lifetime Hero", icon: "👑", color: "bg-success" });
    if (stats.totalDonations >= 25) badges.push({ name: "Legendary Donor", icon: "🏆", color: "bg-primary" });
    
    if (stats.totalQuantity >= 1000) badges.push({ name: "1L Club", icon: "💉", color: "bg-danger" });
    if (stats.totalQuantity >= 5000) badges.push({ name: "5L Club", icon: "🩸", color: "bg-warning" });
    if (stats.totalQuantity >= 10000) badges.push({ name: "10L Club", icon: "💎", color: "bg-success" });

    return badges;
  };

  // Get motivating quotes
  const getMotivatingQuote = () => {
    const quotes = [
      "The blood you donate gives someone another chance at life. One day that someone may be a close relative, a friend, a loved one—or even you.",
      "A single drop of blood can make a huge difference. Your donation can save up to three lives.",
      "The blood donation process is simple, safe, and it saves lives. You have the power to make a difference.",
      "Donating blood is a simple act of kindness that can have a profound impact on someone's life.",
      "Your blood donation can give a precious smile to someone's face. That is the power you hold in your veins."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // Get organisations requesting donor's blood group
  const getOrganisationsRequestingBlood = () => {
    const stats = calculateDonorStats();
    if (!stats || !stats.bloodGroups.length) return [];

    return organisations.filter(org => {
      // Check if organisation needs any of the donor's blood groups
      return org.neededBloodGroups && 
             org.neededBloodGroups.some(needed => stats.bloodGroups.includes(needed));
    });
  };

  const stats = calculateDonorStats();
  const badges = calculateBadges();
  const requestingOrgs = getOrganisationsRequestingBlood();

  // Check if user is donor or organisation (organisations can view donor lists)
  if (user?.role !== 'donor' && user?.role !== 'organisation') {
    return (
      <Layout>
        <div className="container mt-4">
          <div className="alert alert-warning">
            This page is only accessible to donors and organisations.
          </div>
        </div>
      </Layout>
    );
  }

  // If organisation, show donor list instead of personal dashboard
  if (user?.role === 'organisation') {
    return (
      <Layout>
        <div className="container mt-4">
          <h3 className="mb-4">Donor Management</h3>
          {temp ? (
            <div className="d-flex justify-content-center align-items-center">
              <Spinner size={80} />
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">All Donors</h5>
              </div>
              <div className="card-body">
                {donationHistory.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted">No donors found.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr className="table-active">
                          <th>Donor Name</th>
                          <th>Blood Group</th>
                          <th>Contact</th>
                          <th>Total Donations</th>
                          <th>Total Quantity</th>
                          <th>Last Donation</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donationHistory.map((donation, index) => {
                          const donor = donation.donar;
                          return (
                            <tr key={donation._id || index}>
                              <td>
                                <strong>{donor?.name || 'Unknown Donor'}</strong>
                                <div className="text-muted small">
                                  ID: {donor?._id?.slice(-8) || 'N/A'}
                                </div>
                              </td>
                              <td>
                                <span className="badge bg-danger">{donation.bloodGroup}</span>
                              </td>
                              <td>
                                {donor?.phone || donor?.email || 'N/A'}
                              </td>
                              <td>
                                {donationHistory.filter(d => d.donar?._id === donor?._id).length}
                              </td>
                              <td>
                                {donationHistory
                                  .filter(d => d.donar?._id === donor?._id)
                                  .reduce((sum, d) => sum + (d.quantity || 0), 0)} ml
                              </td>
                              <td>
                                {moment(donation.createdAt).format('DD/MM/YYYY hh:mm A')}
                              </td>
                              <td>
                                <span className="text-muted">Last donation: {moment(donation.createdAt).fromNow()}</span>
                              </td>
                            </tr>
                          );
                        })}
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
  }

  return (
    <Layout>
      {temp ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner size={80} />
        </div>
      ) : (
        <div className="container mt-4">
          {/* Donor Profile Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '60px', height: '60px' }}>
                      <i className="fa-solid fa-user fa-2x"></i>
                    </div>
                    <div>
                      <h3 className="mb-1">{user?.name || 'Donor'}</h3>
                      <p className="text-muted mb-0">Donor ID: {user?._id?.slice(-8) || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Blood Group:</strong> {user?.bloodGroup || 'Not specified'}</p>
                      <p><strong>Age:</strong> {user?.age || 'Not specified'}</p>
                      <p><strong>Gender:</strong> {user?.gender || 'Not specified'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Contact:</strong> {user?.phone || user?.email || 'Not specified'}</p>
                      <p><strong>Address:</strong> {user?.address || 'Not specified'}</p>
                      <p><strong>Weight:</strong> {user?.weight ? `${user.weight} kg` : 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donation Timeline and Eligibility */}
          {stats && (
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Donation Timeline</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Last Donation:</strong>
                      <div className="text-muted">
                        {stats.lastDonationDate ? 
                          moment(stats.lastDonationDate).format('DD/MM/YYYY hh:mm A') : 
                          'No previous donations'
                        }
                      </div>
                    </div>
                    <div className="mb-3">
                      <strong>Next Eligible Date:</strong>
                      <div className="text-muted">
                        {stats.nextEligibleDate ? 
                          moment(stats.nextEligibleDate).format('DD/MM/YYYY') : 
                          'Eligible now'
                        }
                      </div>
                    </div>
                    {stats.lastDonationDate && (
                      <div className="alert alert-info">
                        <small>
                          <i className="fa-solid fa-info-circle me-2"></i>
                          Donors must wait 3 months between donations for health safety.
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Blood Groups Donated</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex flex-wrap gap-2">
                      {stats.bloodGroups.map(bg => (
                        <span key={bg} className="badge bg-danger fs-6">{bg}</span>
                      ))}
                    </div>
                    {stats.bloodGroups.length === 0 && (
                      <p className="text-muted">No blood donations yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Badges and Achievements */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Badges & Achievements</h5>
                </div>
                <div className="card-body">
                  {badges.length > 0 ? (
                    <div className="d-flex flex-wrap gap-3">
                      {badges.map((badge, index) => (
                        <div key={index} className={`badge ${badge.color} fs-6 p-3 d-flex align-items-center`}>
                          <span className="me-2">{badge.icon}</span>
                          {badge.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">Start donating to earn badges!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Motivating Quote */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <i className="fa-solid fa-quote-left fa-2x mb-3 opacity-75"></i>
                  <blockquote className="mb-0">
                    <p className="fs-5 mb-0">{getMotivatingQuote()}</p>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Organisations You've Donated To */}
          {recentOrganisations.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Recent Organisations You've Donated To</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {recentOrganisations.map(org => (
                        <div key={org._id} className="col-md-6 mb-3">
                          <div className="card border-success">
                            <div className="card-body">
                              <h6 className="card-title text-success">{org.organisation.organisationName}</h6>
                              <p className="card-text">
                                <strong>Contact:</strong> {org.organisation.phone || org.organisation.email}<br/>
                                <strong>Address:</strong> {org.organisation.address}, {org.organisation.city}<br/>
                                <strong>Last Donation:</strong> {moment(org.completedDate).format('DD/MM/YYYY')}
                              </p>
                              <button 
                                className="btn btn-sm btn-success" 
                                data-bs-toggle="modal" 
                                data-bs-target="#staticBackdrop" 
                                data-orgid={org.organisation._id}
                              >
                                Donate Again
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}








          {/* Donation History */}
          {donationHistory.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5 className="mb-0">Your Donation History</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr className="table-active">
                            <th>Date</th>
                            <th>Blood Group</th>
                            <th>Quantity</th>
                            <th>Organisation</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donationHistory.map((donation, index) => (
                            <tr key={donation._id || index}>
                              <td>{moment(donation.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                              <td>
                                <span className="badge bg-danger">{donation.bloodGroup}</span>
                              </td>
                              <td>{donation.quantity} ml</td>
                              <td>
                                {donation.organisation?.organisationName || 
                                 donation.organisation?.email || 
                                 'Organisation'}
                              </td>
                              <td>
                                <span className="badge bg-success">Completed</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Donate Button */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => window.location.href = '/organisations'}
                disabled={stats && !stats.isEligible}
              >
                <i className="fa-solid fa-heart me-2"></i>
                {stats && !stats.isEligible ? 'Not Eligible Yet' : 'Donate Blood Now'}
              </button>
              {stats && !stats.isEligible && (
                <div className="mt-2">
                  <small className="text-muted">
                    Next eligible date: {stats.nextEligibleDate ? 
                      moment(stats.nextEligibleDate).format('DD/MM/YYYY') : 'Unknown'
                    }
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Donation Modal */}
      <Modal />
    </Layout>
  );
};

export default Donor;