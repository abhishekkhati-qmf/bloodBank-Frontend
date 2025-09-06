import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import Spinner from '../../components/shared/Spinner';
import { toast } from 'react-hot-toast';

const CampsHistory = () => {
  const [camps, setCamps] = useState([]);
  const [temp, setTemp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCamps, setTotalCamps] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Fetch camps data
  const getCamps = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      const { data } = await API.get(`/api/camps/admin/all?page=${page}&status=${status}`);
      
      if (data?.success) {
        setCamps(data.camps);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalCamps(data.pagination.totalCamps);
      }
    } catch (error) {
      toast.error("Error fetching camps data");
    } finally {
      setLoading(false);
      setTemp(false);
    }
  };

  useEffect(() => {
    setTemp(true);
    getCamps(1, statusFilter);
  }, [statusFilter]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    getCamps(page, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
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
      {temp ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner size={80} />
        </div>
      ) : (
        <div className="container mt-4">
          <div className="row mb-4">
            <div className="col-md-6">
              <h3>Camps History</h3>
              <p className="text-muted">View all blood donation camps</p>
            </div>
            <div className="col-md-6 text-end">
              <div className="d-flex justify-content-end align-items-center gap-3">
                <label htmlFor="statusFilter" className="form-label mb-0">Filter by Status:</label>
                <select
                  id="statusFilter"
                  className="form-select w-auto"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="row mb-4">
            <div className="col-md-2">
              <div className="card bg-primary text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">{totalCamps}</h5>
                  <small>Total Camps</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-warning text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    {camps.filter(camp => camp.status === 'pending').length}
                  </h5>
                  <small>Pending</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-success text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    {camps.filter(camp => camp.status === 'approved').length}
                  </h5>
                  <small>Approved</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-info text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    {camps.filter(camp => camp.status === 'completed').length}
                  </h5>
                  <small>Completed</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-danger text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    {camps.filter(camp => camp.status === 'rejected').length}
                  </h5>
                  <small>Rejected</small>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="card bg-secondary text-white">
                <div className="card-body text-center">
                  <h5 className="card-title">
                    {camps.filter(camp => camp.status === 'cancelled').length}
                  </h5>
                  <small>Cancelled</small>
                </div>
              </div>
            </div>
          </div>

          {/* Camps Table */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Camps List</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-4">
                  <Spinner size={60} />
                </div>
              ) : camps.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">No camps found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr className="table-active">
                        <th>Camp Name</th>
                        <th>Organisation</th>
                        <th>Date & Time</th>
                        <th>Location</th>
                        <th>Blood Groups</th>
                        <th>Status</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {camps.map((camp) => (
                        <tr key={camp._id}>
                          <td>
                            <strong>{camp.name}</strong>
                            {camp.description && (
                              <div className="text-muted small mt-1">
                                {camp.description.length > 50 
                                  ? `${camp.description.substring(0, 50)}...` 
                                  : camp.description
                                }
                              </div>
                            )}
                          </td>
                          <td>
                            <div>
                              <strong>{camp.organisation?.organisationName || 'N/A'}</strong>
                              <div className="text-muted small">
                                {camp.organisation?.email || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{moment(camp.date).format('DD/MM/YYYY')}</strong>
                              <div className="text-muted small">
                                {camp.startTime} - {camp.endTime}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{camp.location}</strong>
                              <div className="text-muted small">{camp.city}</div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {camp.bloodGroups.map(bg => (
                                <span key={bg} className="badge bg-danger">{bg}</span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadgeColor(camp.status)}`}>
                              {getStatusText(camp.status)}
                            </span>
                            {camp.adminNotes && (
                              <div className="text-muted small mt-1">
                                {camp.adminNotes}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="text-muted small">
                              {moment(camp.createdAt).format('DD/MM/YYYY')}
                            </div>
                            <div className="text-muted small">
                              {moment(camp.createdAt).format('hh:mm A')}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Pagination Info */}
          <div className="text-center mt-3">
            <small className="text-muted">
              Showing page {currentPage} of {totalPages} ({totalCamps} total camps)
            </small>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CampsHistory;
