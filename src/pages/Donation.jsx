import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import API from "../services/API";
import { useSelector } from "react-redux";
import Spinner from "../components/shared/Spinner";
import { toast } from 'react-hot-toast';

const Donation = () => {
  const { user } = useSelector((state) => state.auth);
  const [donationRequests, setDonationRequests] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [temp, setTemp] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get donation requests for the donor
  const getDonationRequests = async () => {
    try {
      const { data } = await API.get("/donation-requests/donor");
      if (data?.success) {
        setDonationRequests(data?.donationRequests || []);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setTemp(false);
    }
  };

  // Get all organisations with blood inventory
  const getOrganisations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/donation-requests/organisations');
      
      if (data?.success) {
        setOrganisations(data.organisations || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error fetching organisations");
    } finally {
      setLoading(false);
    }
  };

  // Handle donation request
  const handleDonationRequest = async (organisationId) => {
    try {
      const { data } = await API.post('/donation-requests/create', {
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
  };

  useEffect(() => {
    setTemp(true);
    getDonationRequests();
    getOrganisations();
  }, []);

  return (
    <Layout>
      {temp ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner size={80} />
        </div>
      ) : (
        <div className="container mt-4">
          {/* Donation History */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Your Donation History</h5>
                </div>
                <div className="card-body">
                  {donationRequests.filter(req => req.status === 'completed').length === 0 ? (
                    <p className="text-muted text-center">No donation history found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr className="table-active">
                            <th>Organisation</th>
                            <th>Blood Group</th>
                            <th>Donation Date</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donationRequests.filter(req => req.status === 'completed').map((request) => (
                            <tr key={request._id}>
                              <td>{request.organisation?.organisationName || 'N/A'}</td>
                              <td>
                                <span className="badge bg-danger">{request.bloodGroup}</span>
                              </td>
                              <td>{moment(request.completedDate).format('DD/MM/YYYY')}</td>
                              <td>350 ml</td>
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
        </div>
      )}
    </Layout>
  );
};

export default Donation;