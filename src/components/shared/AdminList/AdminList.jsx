import React, { useEffect, useState } from "react";
import Layout from "../Layout/Layout";
import moment from "moment";
import API from "../../../services/API";
import Spinner from '../Spinner';
import { toast } from 'react-hot-toast';

const AdminList = ({ 
  title, 
  apiEndpoint, 
  dataKey, 
  columns, 
  renderRow, 
  showBloodStock = false 
}) => {
  const [data, setData] = useState([]);
  const [temp, setTemp] = useState(false);

  const fetchData = async () => {
    try {
      setTemp(true);
      const { data } = await API.get(apiEndpoint);
      if (data?.success) {
        setData(data[dataKey] || []);
      }
    } catch (error) {
      toast.error(`Error fetching ${title.toLowerCase()}`);
    } finally {
      setTemp(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, itemName) => {
    try {
      const answer = window.prompt(
        `Are You Sure Want To Delete This ${itemName}`,
        "Sure"
      );
      if (!answer) return;
      
      const { data } = await API.delete(`/admin/delete-donor/${id}`);
      toast.success(data?.message);
      window.location.reload();
    } catch (error) {
      toast.error(`Error deleting ${itemName.toLowerCase()}`);
    }
  };

  const handleBlockUnblock = async (id, currentStatus, itemName) => {
    try {
      const action = currentStatus === 'blocked' ? 'unblock' : 'block';
      const answer = window.confirm(
        `Are you sure you want to ${action} this ${itemName.toLowerCase()}?`
      );
      if (!answer) return;
      
      const { data } = await API.put(`/admin/block-unblock/${id}`, {
        action: action
      });
      
      if (data?.success) {
        toast.success(data.message);
        fetchData();
      }
    } catch (error) {
      toast.error(`Error ${currentStatus === 'blocked' ? 'unblocking' : 'blocking'} ${itemName.toLowerCase()}`);
    }
  };

  const renderBloodStock = (bloodStock) => {
    if (!bloodStock) return null;
    
    return (
      <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '200px' }}>
        {Object.entries(bloodStock).map(([bloodGroup, quantity]) => (
          <span 
            key={bloodGroup} 
            className={`badge ${quantity > 0 ? 'bg-success' : 'bg-secondary'}`}
            title={`${bloodGroup}: ${quantity} ml`}
          >
            {bloodGroup}: {quantity}ml
          </span>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      {temp ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <Spinner size={80} />
        </div>
      ) : (
        <div className="container-fluid mt-3 p-responsive">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0 text-responsive">{title}</h4>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">{data?.length || 0} records</span>
            </div>
          </div>
          
          {data?.length === 0 ? (
            <div className="alert alert-info text-center">
              <i className="fas fa-info-circle me-2"></i>
              No {title.toLowerCase()} found.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-dark">
                  <tr>
                    {columns.map((column, index) => (
                      <th key={index} scope="col" className="text-nowrap">{column}</th>
                    ))}
                    <th scope="col" className="text-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((record) => (
                    <tr key={record._id}>
                      {renderRow(record, { handleDelete, handleBlockUnblock, renderBloodStock })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default AdminList;
