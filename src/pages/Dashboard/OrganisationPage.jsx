import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import Modal from "../../components/shared/modal/Modal";
import { useSelector } from "react-redux";
import API from "../../services/API";
import Spinner from "../../components/shared/Spinner";
import moment from "moment";
import { toast } from 'react-hot-toast';

const OrganisationPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState([]);
  const [temp,setTemp] = useState(false);
  const [search, setSearch] = useState("");
  const [received, setReceived] = useState([]);
  const [summary, setSummary] = useState({ totalFulfilled: 0, avgResponseMs: 0 });
  const [browse, setBrowse] = useState({ open: false, list: [], search: '' });
  const [requests, setRequests] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  const [browseOrgs, setBrowseOrgs] = useState({ open: false, organisations: [], search: '' });
  const [showAllRequests, setShowAllRequests] = useState(false);

  const getOrg = async () => {
    try {
      if(user?.role === 'donor'){
        const { data } = await API.get("/inventory/all-organisations");
        if (data?.success) setData(data?.organisations);
      }
      if (user?.role === "hospital") {
        const [orgRes, invRes, reqRes, allOrgsRes] = await Promise.all([
          API.get("/inventory/get-organisation-for-hospital"),
          API.post('/inventory/get-inventory-hospital', { filters: { inventoryType: 'out', hospital: user?._id } }),
          API.get('/requests/hospital'),
          API.get('/inventory/all-organisations'),
        ]);
        if (orgRes?.data?.success) setData(orgRes.data.organisations || []);
        if (invRes?.data?.success) setReceived(invRes.data.inventory || []);
        if (reqRes?.data?.success) setSummary(reqRes.data.summary || { totalFulfilled:0, avgResponseMs:0 });
        // Store all organisations for search functionality
        if (allOrgsRes?.data?.success) {
          setBrowseOrgs(prev => ({ 
            ...prev, 
            allOrganisations: allOrgsRes.data.organisations || [] 
          }));
        }
      }
      if (user?.role === 'organisation') {
        // show the logged-in organisation's own info
        setData([{
          _id: user?._id,
          organisationName: user?.organisationName,
          address: user?.address,
          phone: user?.phone,
          email: user?.email,
          website: user?.website,
        }]);
        // fetch incoming requests for organisation
        const reqRes = await API.get('/requests/organisation');
        if (reqRes?.data?.success) setRequests(reqRes.data.requests || []);
      }
    } catch (error) { 
      toast.error("Error fetching data");
    }
    finally{ setTemp(false); }
  };

  useEffect(() => { setTemp(true); getOrg(); }, [user]);

  // Auto-refresh for organisations to get real-time request updates
  useEffect(() => {
    if (user?.role === 'organisation') {
      const interval = setInterval(() => {
        getOrg();
      }, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user?.role]);

  const isDonor = user?.role === 'donor';
  const isHospital = user?.role === 'hospital';

  const formatMs = (ms) => {
    if (!ms) return '-';
    const minutes = Math.round(ms/60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.round(minutes/60);
    return `${hours} hr`;
  };

  const renderAvailability = (o) => {
    const availability = o.availability || {};
    const needed = new Set(o.neededBloodGroups || []);
    const entries = Object.entries(availability);
    // show only few badges for clarity
    return (
      <div className="d-flex flex-wrap gap-1">
        {entries.map(([g,val]) => {
          const isNeeded = needed.has(g);
          const cls = isNeeded ? 'bg-danger' : 'bg-success';
          return <span key={g} className={`badge ${cls}`}>{g}: {val} ml</span>;
        })}
      </div>
    );
  };

  return (
    <Layout>
      {temp ? (
        <div className="d-flex justify-content-center align-items-center"><Spinner size={80} /></div>
      ) : (
        <div className="container mt-4">
          {isHospital && (
            <div className="row g-3 mb-3">
              <div className="col-md-3"><div className="card h-100"><div className="card-body"><div className="text-muted">Total Fulfilled Requests</div><div className="fs-4 fw-bold">{summary.totalFulfilled || 0}</div></div></div></div>
              <div className="col-md-3"><div className="card h-100"><div className="card-body"><div className="text-muted">Avg Response Time</div><div className="fs-5 fw-bold">{formatMs(summary.avgResponseMs)}</div></div></div></div>
              <div className="col-md-6 d-flex align-items-center justify-content-end">
                <input className="form-control w-50" placeholder="Search by name/address" value={search} onChange={(e)=>setSearch(e.target.value)} />
                <button className="btn btn-outline-primary ms-2" onClick={async()=>{
                  try{
                    const res = await API.get('/inventory/all-organisations');
                    if (res?.data?.success) {
                      setBrowseOrgs({ 
                        open: true, 
                        organisations: res.data.organisations || [], 
                        search: '',
                        allOrganisations: res.data.organisations || []
                      });
                    }
                  }catch(e){ 
                    toast.error("Error browsing organizations");
                  }
                }}>Browse Organisations</button>
              </div>
            </div>
          )}
          <table className="table">
            <thead>
              <tr className="table-active">
                <th scope="col">Organisation Name</th>
                <th scope="col">Address</th>
                <th scope="col">Contact</th>
                {isDonor && <th scope="col">Available / In-demand</th>}
                {isDonor && <th scope="col">Actions</th>}
                {isHospital && <th scope="col">Pending Requests</th>}
                <th scope="col">Website</th>
                {isHospital && <th scope="col">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {(search ? (browseOrgs.allOrganisations || data) : data)?.filter(o => {
                const q = (search||'').toLowerCase();
                return !q || [o.organisationName,o.address,o.email].some(v=>String(v||'').toLowerCase().includes(q));
              }).map((o) => {
                const orgId = o._id;
                const supplied = received.filter(i=> String(i.organisation)===String(orgId));
                const totalSupplied = supplied.reduce((s,i)=> s + (i.quantity||0), 0);
                const lastSupply = supplied.reduce((max,i)=> (!max || new Date(i.createdAt)>new Date(max)) ? i.createdAt : max, null);
                return (
                <tr key={o._id}>
                  <td>{o.organisationName || '-'}</td>
                  <td>{o.address || '-'}</td>
                  <td>{o.phone || o.email || '-'}</td>
                  {isDonor && (
                    <td>{renderAvailability(o)}</td>
                  )}
                  {isDonor && (
                    <td>
                      <button className="btn btn-sm btn-success" data-bs-toggle="modal" data-bs-target="#staticBackdrop" data-orgid={o._id}>Donate</button>
                    </td>
                  )}
                  {isHospital && (
                    <td>-</td>
                  )}
                  <td>{o.website ? (<a href={o.website.startsWith('http') ? o.website : `https://${o.website}`} target="_blank" rel="noreferrer">Website</a>) : ('-')}</td>
                  {isHospital && (
                    <td>
                      <button className="btn btn-sm btn-primary me-2" onClick={()=>setBrowse({ ...browse, open:true, list:[o], search:'REQUEST' })}>Request</button>
                      <button className="btn btn-sm btn-outline-info me-2" onClick={()=>setBrowse({ ...browse, open:true, list:[o], search:'HISTORY' })}>View History</button>
                      <a className="btn btn-sm btn-outline-secondary" href={`mailto:${o.email}`}>Contact</a>
                    </td>
                  )}
                </tr>
              );})}
            </tbody>
          </table>


          {/* Organisation Request Management */}
          {user?.role === 'organisation' && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">Incoming Blood Requests</h5>
                <div>
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => setShowAllRequests(!showAllRequests)}>
                    {showAllRequests ? 'Show Recent Only' : 'View All Requests'}
                  </button>
                </div>
              </div>
              {requests.length === 0 ? (
                <div className="alert alert-info">No pending requests</div>
              ) : (
                <table className="table">
                  <thead>
                    <tr className="table-active">
                      <th>Hospital</th>
                      <th>Blood Group</th>
                      <th>Quantity (ml)</th>
                      <th>Request Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllRequests ? requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : requests
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 6)
                    ).map((request) => (
                      <tr key={request._id}>
                        <td>
                          <div>
                            <strong>{request.hospital?.hospitalName || request.hospital?.email}</strong>
                            <br />
                            <small className="text-muted">{request.hospital?.address}</small>
                          </div>
                        </td>
                        <td><span className="badge bg-primary">{request.bloodGroup}</span></td>
                        <td>{request.quantity}</td>
                        <td>{moment(request.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                        <td>
                          <span className={`badge ${
                            request.status === 'pending' ? 'bg-warning' :
                            request.status === 'approved' ? 'bg-success' :
                            request.status === 'rejected' ? 'bg-danger' :
                            'bg-info'
                          }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          {request.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success me-2" 
                                onClick={async () => {
                                  try {
                                    const res = await API.post(`/requests/${request._id}/approve`);
                                    if (res?.data?.success) {
                                      alert('Request approved successfully!');
                                      getOrg(); // Refresh data
                                    }
                                  } catch (e) {
                                    const errorMessage = e?.response?.data?.message || 'Failed to approve request';
                                    alert(errorMessage);
                                  }
                                }}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-danger" 
                                onClick={() => setRejectModal({ open: true, request })}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-success">✓ Approved</span>
                          )}
                          {request.status === 'rejected' && (
                            <span className="text-danger">✗ Rejected</span>
                          )}
                          {request.reason && (
                            <div className="mt-1">
                              <small className="text-muted">Reason: {request.reason}</small>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hospital side: Request to organisation modal */}
      {isHospital && browse.open && browse.search === 'REQUEST' && (
        <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Request Blood</h5>
                <button type="button" className="btn-close" onClick={()=>setBrowse({ ...browse, open:false })}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Organisation:</label>
                  <div className="form-control-plaintext"><strong>{browse.list[0]?.organisationName || browse.list[0]?.email}</strong></div>
                </div>
                <div className="row">
                  <div className="col-6">
                    <label className="form-label">Blood Group</label>
                    <select className="form-select" id="reqGroup">
                      <option value="">Select Blood Group</option>
                      {['O+','O-','AB+','AB-','A+','A-','B+','B-'].map(g=> <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label">Quantity (ml)</label>
                    <input className="form-control" id="reqQty" type="number" placeholder="Enter quantity" min="1" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setBrowse({ ...browse, open:false })}>Cancel</button>
                <button className="btn btn-primary" onClick={async()=>{
                  const bloodGroup = document.getElementById('reqGroup').value;
                  const quantity = Number(document.getElementById('reqQty').value||0);
                  if (!bloodGroup || !quantity) {
                    alert('Please select blood group and enter quantity');
                    return;
                  }
                  try{
                    const orgId = browse.list[0]?._id;
                    const res = await API.post('/requests', { organisationId: orgId, bloodGroup, quantity });
                    if (res?.data?.success) { 
                      if (res?.data?.autoRejected) {
                        alert('Request rejected: No stock available.');
                      } else {
                        alert('Request sent successfully!');
                      }
                      setBrowse({ ...browse, open:false }); 
                      getOrg(); // Refresh the data
                    }
                  }catch(e){ 
                    alert('Failed to send request. Please try again.'); 
                  }
                }}>Send Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModal.open && (
        <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Reject Request</h5>
                <button type="button" className="btn-close" onClick={()=>setRejectModal({ open: false, request: null })}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Hospital:</label>
                  <div className="form-control-plaintext">
                    <strong>{rejectModal.request?.hospital?.hospitalName || rejectModal.request?.hospital?.email}</strong>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Request Details:</label>
                  <div className="form-control-plaintext">
                    {rejectModal.request?.bloodGroup} - {rejectModal.request?.quantity} ml
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Rejection Reason (Optional):</label>
                  <textarea 
                    className="form-control" 
                    id="rejectReason" 
                    rows="3" 
                    placeholder="Enter reason for rejection..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setRejectModal({ open: false, request: null })}>Cancel</button>
                <button className="btn btn-danger" onClick={async()=>{
                  const reason = document.getElementById('rejectReason').value;
                  try {
                    const res = await API.post(`/requests/${rejectModal.request._id}/reject`, { reason });
                    if (res?.data?.success) {
                      alert('Request rejected');
                      setRejectModal({ open: false, request: null });
                      getOrg(); // Refresh data
                    }
                  } catch (e) {
                    alert('Failed to reject request');
                  }
                }}>Reject Request</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browse Organisations Modal */}
      {isHospital && browseOrgs.open && (
        <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Browse All Organisations</h5>
                <button type="button" className="btn-close" onClick={()=>setBrowseOrgs({ open: false, organisations: [], search: '' })}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <input 
                    className="form-control" 
                    placeholder="Search by organisation name, address, or email" 
                    value={browseOrgs.search} 
                    onChange={(e)=>setBrowseOrgs({...browseOrgs, search:e.target.value})} 
                  />
                </div>
                <div className="table-responsive">
                  <table className="table">
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
                      {browseOrgs.organisations.filter(org => {
                        const q = (browseOrgs.search||'').toLowerCase();
                        return !q || [org.organisationName, org.address, org.email].some(v=>String(v||'').toLowerCase().includes(q));
                      }).map(org => (
                        <tr key={org._id}>
                          <td><strong>{org.organisationName || org.email}</strong></td>
                          <td>{org.address || '-'}</td>
                          <td>{org.phone || org.email || '-'}</td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {Object.entries(org.availability || {}).map(([bloodType, quantity]) => (
                                <span key={bloodType} className="badge bg-success">
                                  {bloodType}: {quantity} ml
                                </span>
                              ))}
                              {(!org.availability || Object.keys(org.availability).length === 0) && (
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
                              onClick={() => {
                                setBrowseOrgs({ open: false, organisations: [], search: '' });
                                setBrowse({ ...browse, open: true, list: [org], search: 'REQUEST' });
                              }}
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
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setBrowseOrgs({ open: false, organisations: [], search: '' })}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View History Modal */}
      {isHospital && browse.open && browse.search === 'HISTORY' && (
        <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Blood Donation History - {browse.list[0]?.organisationName || browse.list[0]?.email}</h5>
                <button type="button" className="btn-close" onClick={()=>setBrowse({ ...browse, open:false })}></button>
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Blood Group</th>
                        <th>Quantity (ml)</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {received.filter(item => String(item.organisation) === String(browse.list[0]?._id)).map(item => (
                        <tr key={item._id}>
                          <td><span className="badge bg-primary">{item.bloodGroup}</span></td>
                          <td>{item.quantity} ml</td>
                          <td>{moment(item.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                          <td><span className="badge bg-success">Received</span></td>
                        </tr>
                      ))}
                      {received.filter(item => String(item.organisation) === String(browse.list[0]?._id)).length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No donation history found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={()=>setBrowse({ ...browse, open:false })}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDonor && <Modal />}
    </Layout>
  );
};

export default OrganisationPage;