import React, { useEffect, useMemo, useState } from 'react'
import Layout from '../../components/shared/Layout/Layout'
import API from '../../services/API';
import moment from 'moment';
import Spinner from '../../components/shared/Spinner';
import Modal from '../../components/shared/modal/Modal';
import { useSelector } from 'react-redux';

const Hospital = () => {
    const { user } = useSelector((state)=>state.auth);
    const isHospital = user?.role === 'hospital';

    // Organisation perspective (existing list of hospitals)
    const [data, setData] = useState([]);
    const [temp,setTemp] = useState(false);
    const [browse, setBrowse] = useState({ open: false, list: [], search: '' });
  const [browseSearch, setBrowseSearch] = useState('');

    const loadOrgPerspective = async () => {
      try {
        const { data } = await API.get("/api/inventory/hospital-stats");
        if (data?.success) setData(data?.rows);
      } catch (error) {
        console.log(error);
      } finally {
        setTemp(false);
      }
    };

    // Hospital dashboard data
    const [requests, setRequests] = useState([]);
    const [received, setReceived] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [lastRefreshedAt, setLastRefreshedAt] = useState(Date.now());

    const loadHospitalDashboard = async () => {
      try {
        const [reqRes, invRes, orgRes, allOrgsRes] = await Promise.all([
          API.get('/api/requests/hospital'),
          API.post('/api/inventory/get-inventory-hospital', { filters: { inventoryType: 'out', hospital: user?._id } }),
          API.get('/api/inventory/get-organisation-for-hospital'),
          API.get('/api/inventory/all-organisations'),
        ]);
        if (reqRes?.data?.success) setRequests(reqRes.data.requests || []);
        if (invRes?.data?.success) setReceived(invRes.data.inventory || []);
        if (orgRes?.data?.success) setOrgs(orgRes.data.organisations || []);
        // Store all organisations for browsing
        if (allOrgsRes?.data?.success) setBrowse({ ...browse, allOrganisations: allOrgsRes.data.organisations || [] });
      } catch (e) {
        console.log(e);
      } finally {
        setTemp(false);
      }
    };

    useEffect(() => {
        setTemp(true);
        if (isHospital) loadHospitalDashboard(); else loadOrgPerspective();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHospital]);

    useEffect(() => {
      if (!isHospital) return;
      const id = setInterval(() => { loadHospitalDashboard(); setLastRefreshedAt(Date.now()); }, 30000);
      return () => clearInterval(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isHospital]);

    const stats = useMemo(() => {
      if (!isHospital) return null;
      const totalRequested = requests.reduce((s,r)=> s + (r.quantity||0), 0);
      const fulfilledCount = requests.filter(r=>r.status==='fulfilled').length;
      const lastRequest = requests.reduce((max,r)=> (!max || new Date(r.createdAt) > new Date(max)) ? r.createdAt : max, null);
      const pending = requests.filter(r=>r.status==='pending').length;
      const totalReceived = received.reduce((s,i)=> s + (i.quantity||0), 0);
      return { totalRequested, fulfilledCount, lastRequest, pending, totalReceived };
    }, [isHospital, requests, received]);
  
    return (
      <Layout>
          {temp ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <Spinner size={80} />
          </div>
        ) : (
          <div className="container-fluid mt-3 p-responsive">
            {isHospital ? (
              <>
                <div className="mb-4">
                  <h4 className="m-0 text-responsive">Welcome {user?.hospitalName || 'Hospital'}</h4>
                  <div className="text-muted text-responsive">{user?.address || '-'} · {user?.phone || user?.email || '-'}</div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="card h-100 stats-card">
                      <div className="card-body text-center">
                        <div className="text-muted small">Total Blood Requests</div>
                        <div className="stats-number">{stats?.totalRequested || 0} ml</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card h-100 stats-card">
                      <div className="card-body text-center">
                        <div className="text-muted small">Requests Fulfilled</div>
                        <div className="stats-number">{stats?.fulfilledCount || 0}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card h-100 stats-card">
                      <div className="card-body text-center">
                        <div className="text-muted small">Last Request</div>
                        <div className="stats-number small">{stats?.lastRequest ? moment(stats.lastRequest).format('DD/MM/YY') : '-'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="card h-100 stats-card">
                      <div className="card-body text-center">
                        <div className="text-muted small">Pending</div>
                        <div className="stats-number">{stats?.pending || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row g-3 mb-4">
                  <div className="col-12 col-md-3">
                    <div className="card h-100 stats-card">
                      <div className="card-body text-center">
                        <div className="text-muted small">Total Units Received</div>
                        <div className="stats-number">{stats?.totalReceived || 0} ml</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blood Stock by Blood Group */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">Current Blood Stock</h5>
                    <small className="text-muted">Last updated: {moment(lastRefreshedAt).format('DD/MM/YYYY hh:mm A')}</small>
                  </div>
                  <div className="row g-3">
                    {['O+','O-','AB+','AB-','A+','A-','B+','B-'].map(bloodGroup => {
                      const stock = received.reduce((total, item) => {
                        return item.bloodGroup === bloodGroup ? total + (item.quantity || 0) : total;
                      }, 0);
                      return (
                        <div key={bloodGroup} className="col-md-3">
                          <div className="card h-100">
                            <div className="card-body text-center">
                              <div className="text-muted">Blood Group</div>
                              <div className="fs-4 fw-bold text-primary">{bloodGroup}</div>
                              <div className="text-muted">Available Stock</div>
                              <div className="fs-5 fw-bold">{stock} ml</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Requests Status */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0">Recent Requests Status</h5>
                    <small className="text-muted">Last updated: {moment(lastRefreshedAt).format('DD/MM/YYYY hh:mm A')}</small>
                  </div>
                  {requests.length === 0 ? (
                    <div className="alert alert-info text-center">
                      <i className="fas fa-info-circle me-2"></i>
                      No requests sent yet
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th className="text-nowrap">Organisation</th>
                            <th className="text-nowrap">Blood Group</th>
                            <th className="text-nowrap">Quantity</th>
                            <th className="text-nowrap">Request Date</th>
                            <th className="text-nowrap">Status</th>
                            <th className="text-nowrap">Response Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.slice(0, 3).map((request) => (
                            <tr key={request._id}>
                              <td>{request.organisation?.organisationName || request.organisation?.email}</td>
                              <td><span className="badge bg-primary">{request.bloodGroup}</span></td>
                              <td>{request.quantity} ml</td>
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
                                {request.status !== 'pending' ? 
                                  moment(request.updatedAt).from(request.createdAt) : 
                                  <span className="text-muted">Waiting...</span>
                                }
                                {request.status === 'approved' && (
                                  <div className="mt-1">
                                    <button 
                                      className="btn btn-sm btn-success" 
                                      onClick={async () => {
                                        try {
                                          const res = await API.post(`/api/requests/${request._id}/fulfilled`);
                                          if (res?.data?.success) {
                                            alert('Request marked as fulfilled!');
                                            loadHospitalDashboard(); // Refresh data
                                          }
                                        } catch (e) {
                                          console.log(e);
                                          alert('Failed to mark as fulfilled');
                                        }
                                      }}
                                    >
                                      Mark as Received
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>


              </>
            ) : (
              <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h4 className="m-0">Hospitals</h4>
              <button className="btn btn-outline-primary btn-sm" onClick={async()=>{
                try{
                  const { data } = await API.get('/api/inventory/all-hospitals');
                  if (data?.success) setBrowse({ open: true, list: data.hospitals || [], search: '' });
                }catch(e){ console.log(e); }
              }}>Browse All Hospitals</button>
            </div>
            <table className="table m-3 border-primary">
            <thead>
              <tr className='table-active'>
                <th scope="col">Hospital Name</th>
                <th scope="col">Address</th>
                <th scope="col">Contact</th>
                <th scope="col">Website</th>
                <th scope="col">Total Blood Requested</th>
                <th scope="col">Last Request Date</th>
                <th scope="col">Total Donated</th>
                <th scope="col">Last Donation Group</th>
                <th scope="col">Last Donation Date</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((record) => (
                <tr key={record.hospitalId}>
                  <td>{record.name}</td>
                  <td>{record.address}</td>
                  <td>{record.contact}</td>
                  <td>{record.website ? <a href={record.website.startsWith('http') ? record.website : `https://${record.website}`} target="_blank" rel="noreferrer">Website</a> : '-'}</td>
                  <td>{record.totalRequested} ml</td>
                  <td>{record.lastRequestDate ? moment(record.lastRequestDate).format("DD/MM/YYYY hh:mm A") : '-'}</td>
                  <td>{record.totalDonated ? `${record.totalDonated} ml` : '0 ml'}</td>
                  <td>{record.lastDonationGroup || '-'}</td>
                  <td>{record.lastDonationDate ? moment(record.lastDonationDate).format("DD/MM/YYYY hh:mm A") : '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success me-2"
                      data-bs-toggle="modal"
                      data-bs-target="#staticBackdrop"
                      data-orgid=""
                      data-hospitalid={record.hospitalId}
                      data-hospitalemail={record.email}
                    >
                      Donate
                    </button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={async()=>{
                      try{
                        const { data } = await API.get(`/api/inventory/hospital-donation-history?hospitalId=${record.hospitalId}`);
                        if (data?.success) {
                          window.hospitalHistory = data.records;
                          setBrowse({ open: true, list: [], search: 'HISTORY' });
                        }
                      }catch(e){ console.log(e); }
                    }}>View History</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              </>
            )}
        </div>
        )}
        {/* Organisation connect/history modals (organisation view) */}
        {!isHospital && browse.open && browse.search !== 'HISTORY' && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Browse Hospitals</h5>
                  <button type="button" className="btn-close" onClick={()=>setBrowse({...browse, open:false})}></button>
                </div>
                <div className="modal-body">
                  <input className="form-control mb-2" placeholder="Search by name/email/city" value={browse.search} onChange={(e)=>setBrowse({...browse, search:e.target.value})} />
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Website</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {browse.list.filter(h => {
                        const q = (browse.search||'').toLowerCase();
                        return !q || [h.hospitalName,h.email,h.address].some(v=>String(v||'').toLowerCase().includes(q));
                      }).map(h => (
                        <tr key={h._id}>
                          <td>{h.hospitalName || '-'}</td>
                          <td>{h.email || '-'}</td>
                          <td>{h.phone || '-'}</td>
                          <td>{h.address || '-'}</td>
                          <td>{h.website ? <a href={h.website.startsWith('http')?h.website:`https://${h.website}`} target="_blank" rel="noreferrer">Website</a> : '-'}</td>
                          <td>
                            <button className="btn btn-sm btn-primary" onClick={async()=>{
                              try{
                                const res = await API.post('/api/inventory/connect-hospital', { hospitalId: h._id });
                                if (res?.data?.success) {
                                  setBrowse({...browse, open:false});
                                  setTemp(true); 
                                  loadOrgPerspective(); // Reload the organisation perspective data
                                  alert('Hospital connected successfully!');
                                } else {
                                  alert(res?.data?.message || 'Failed to connect to hospital');
                                }
                              }catch(e){ 
                                console.log('Error connecting hospital:', e);
                                const errorMessage = e?.response?.data?.message || e?.message || 'Failed to connect to hospital';
                                alert(errorMessage);
                              }
                            }}>Connect</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isHospital && browse.open && browse.search === 'HISTORY' && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Donation Log</h5>
                  <button type="button" className="btn-close" onClick={()=>setBrowse({ open:false, list:[], search:'' })}></button>
                </div>
                <div className="modal-body">
                  <table className="table">
                    <thead>
                      <tr className="table-active">
                        <th>Blood Group</th>
                        <th>Quantity (ml)</th>
                        <th>Date & Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(window.hospitalHistory || []).map((r) => (
                        <tr key={r._id}>
                          <td>{r.bloodGroup}</td>
                          <td>{r.quantity} ml</td>
                          <td>{moment(r.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {!isHospital && <Modal />}

        {/* Hospital side: Request to organisation */}
        {isHospital && browse.open && browse.search === 'REQUEST' && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request Blood</h5>
                  <button type="button" className="btn-close" onClick={()=>setBrowse({ ...browse, open:false })}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-2">Organisation: <strong>{browse.list[0]?.organisationName || browse.list[0]?.email}</strong></div>
                  <div className="row">
                    <div className="col-6">
                      <select className="form-select" id="reqGroup">
                        <option value="">Select Blood Group</option>
                        {['O+','O-','AB+','AB-','A+','A-','B+','B-'].map(g=> <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <input className="form-control" id="reqQty" type="number" placeholder="Quantity (ml)" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={()=>setBrowse({ ...browse, open:false })}>Close</button>
                  <button className="btn btn-primary" onClick={async()=>{
                    const bloodGroup = document.getElementById('reqGroup').value;
                    const quantity = Number(document.getElementById('reqQty').value||0);
                    if (!bloodGroup || !quantity) return alert('Please select group and quantity');
                    try{
                      const orgId = browse.list[0]?._id;
                      const res = await API.post('/api/requests', { organisationId: orgId, bloodGroup, quantity });
                      if (res?.data?.success) { 
                        if (res?.data?.autoRejected) {
                          alert('Request rejected: No stock available.');
                        } else {
                          alert('Request sent successfully!');
                        }
                        setBrowse({ ...browse, open:false }); 
                        loadHospitalDashboard(); 
                      }
                    }catch(e){ console.log(e); alert('Failed to send request'); }
                  }}>Send Request</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hospital side: Organisation history (supply to this hospital) */}
        {isHospital && browse.open && browse.search === 'ORG_HISTORY' && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Organisation History</h5>
                  <button type="button" className="btn-close" onClick={()=>setBrowse({ ...browse, open:false })}></button>
                </div>
                <div className="modal-body">
                  <table className="table">
                    <thead><tr className="table-active"><th>Blood Group</th><th>Qty</th><th>Date</th></tr></thead>
                    <tbody>
                      {received.filter(i=> String(i.organisation)===String(browse.list[0]?._id)).map(r => (
                        <tr key={r._id}><td>{r.bloodGroup}</td><td>{r.quantity} ml</td><td>{moment(r.createdAt).format('DD/MM/YYYY hh:mm A')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Browse All Organisations Modal */}
        {isHospital && browse.open && browse.search === 'BROWSE_ALL' && (
          <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Browse All Organisations</h5>
                  <button type="button" className="btn-close" onClick={()=>{setBrowse({ ...browse, open: false }); setBrowseSearch('');}}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <input 
                      className="form-control" 
                      placeholder="Search by organisation name, address, or email" 
                      value={browseSearch} 
                      onChange={(e)=>setBrowseSearch(e.target.value)} 
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
                        {(browse.allOrganisations || []).filter(org => {
                          const q = browseSearch.toLowerCase();
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
                                  setBrowse({ ...browse, open: false });
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
                  <button className="btn btn-secondary" onClick={()=>{setBrowse({ ...browse, open: false }); setBrowseSearch('');}}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
  )
}

export default Hospital