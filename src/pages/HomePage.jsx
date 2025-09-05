import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import Layout from "../components/shared/Layout/Layout";
import Modal from "../components/shared/modal/Modal";
import API from "../services/API";
import moment from 'moment'

const HomePage = () => {
  const [data,setData] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const { loading, error, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // ✅ Redirect users to their dashboard based on role
  useEffect(() => {
    if (user && user.role) {
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "donor":
          navigate("/donor");
          break;
        case "hospital":
          navigate("/hospital");
          break;
        case "organisation":
          // stay on homepage for org
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  const getBloodRecords = async () => {
    try {
      const { data } = await API.get('/inventory/get-inventory');
      if (data?.success) {
        setData(data?.inventory);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getEmergencyRequests = async () => {
    try {
      const { data } = await API.get('/emergency/donor');
      if (data?.success) {
        setEmergencyRequests(data?.emergencyRequests);
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (user?.role === 'organisation') {
      getBloodRecords();
            } else if (user?.role === 'donor') {
      getEmergencyRequests();
    }
  }, [user])

  // Donor view - show emergency requests
          if (user?.role === 'donor') {
    return (
      <Layout>
        {error && <span>{alert(error)}</span>}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner size={80} />
          </div>
        ) : (
          <div className="container mt-3">
            <h4 className="mb-4">🚨 Emergency Blood Requests</h4>
            {emergencyRequests.length === 0 ? (
              <div className="alert alert-info">
                <h5>No emergency requests at the moment</h5>
                <p>Your blood group ({user?.bloodGroup}) is not currently needed for any emergency requests.</p>
              </div>
            ) : (
              <div className="row">
                {emergencyRequests.map((request) => (
                  <div key={request._id} className="col-md-6 mb-4">
                    <div className={`card ${request.urgency === 'critical' ? 'border-danger' : request.urgency === 'emergency' ? 'border-warning' : 'border-primary'}`}>
                      <div className={`card-header ${request.urgency === 'critical' ? 'bg-danger text-white' : request.urgency === 'emergency' ? 'bg-warning text-dark' : 'bg-primary text-white'}`}>
                        <h5 className="mb-0">
                          {request.urgency === 'critical' ? '🔴 CRITICAL' : request.urgency === 'emergency' ? '🟡 EMERGENCY' : '🔵 HIGH PRIORITY'}
                        </h5>
                      </div>
                      <div className="card-body">
                        <h6 className="card-title">Blood Group: {request.bloodGroup}</h6>
                        <p className="card-text">
                          <strong>Quantity Needed:</strong> {request.quantity} ml<br/>
                          <strong>Location:</strong> {request.location}, {request.city}<br/>
                          <strong>Reason:</strong> {request.reason}<br/>
                          <strong>Contact Person:</strong> {request.contactPerson}<br/>
                          <strong>Phone:</strong> {request.contactPhone}<br/>
                          <strong>Organisation:</strong> {request.organisation?.organisationName}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            Posted: {moment(request.createdAt).format('DD/MM/YYYY hh:mm A')}
                          </small>
                          <a href={`tel:${request.contactPhone}`} className="btn btn-success btn-sm">
                            📞 Call Now
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Layout>
    );
  }

  // Other roles (admin, hospital) - redirect to their dashboards
  if (user?.role !== 'organisation') {
    return (
      <Layout>
        {error && <span>{alert(error)}</span>}
        {loading && (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner size={80} />
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      {error && <span>{alert(error)}</span>}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner size={80} />
        </div>
      ) : (
        <>
          {/* Org homepage */}
          <h4
            className="ms-4"
            data-bs-toggle="modal"
            data-bs-target="#staticBackdrop"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-regular fa-square-plus text-success py-4"></i>
            &nbsp;Add To Inventory
          </h4>

          <div className="container m-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="m-0">Stock Summary</h5>
              <div>
                <label className="form-check-label me-2">Show only low stock</label>
                <input type="checkbox" className="form-check-input" onChange={async (e)=>{
                  try {
                    const { data } = await API.get(`/inventory/stock-summary?lowOnly=${e.target.checked}`);
                    if (data?.success) {
                      setData([]);
                      setInventoryData([]);
                      // reuse inventory table structure differently: we will display a simple table below recent logs
                      window.stockSummaryRows = data.rows; // quick store
                    }
                  } catch (err) { console.log(err); }
                }} />
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Blood Group</th>
                  <th scope="col">InventoryType</th>
                  <th scope="col">Quantity</th>
                  <th scope="col">Donor/Hospital Email</th>
                  <th scope="col">Time Date</th>
                </tr>
              </thead>
              <tbody>
                {(window.stockSummaryRows || data)?.map((record) => (
                  <tr
                    className={
                      record.status ? (record.status === 'low' ? 'table-danger' : 'table-success') : (record.inventoryType?.toLowerCase() === "in" ? "table-success" : "table-danger")
                    }
                    key={record._id}
                  >
                    <td>{record.bloodGroup || '-'}</td>
                    <td>{record.inventoryType ? record.inventoryType.toUpperCase() : (record.available + ' ml')}</td>
                    <td>{record.quantity ? `${record.quantity} ml` : (record.min + ' ml min')}</td>
                    <td>{record.email || record.status || '-'}</td>
                    <td>{record.createdAt ? moment(record.createdAt).format("DD/MM/YYYY hh:mm A") : (record.lastUpdated ? moment(record.lastUpdated).format("DD/MM/YYYY hh:mm A") : '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Modal />
        </>
      )}
    </Layout>
  );
};

export default HomePage;
