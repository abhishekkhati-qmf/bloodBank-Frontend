import React, { useEffect, useState } from 'react';
import Layout from '../../components/shared/Layout/Layout';
import API from '../../services/API';
import moment from 'moment';
import Spinner from '../../components/shared/Spinner';

const Inventory = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowOnly, setLowOnly] = useState(false);

  const load = async (low) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/api/inventory/stock-summary?lowOnly=${low ? 'true' : 'false'}`);
      if (data?.success) setRows(data.rows || []);
    } catch (e) { console.log(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(lowOnly); }, [lowOnly]);

  return (
    <Layout>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center"><Spinner size={80} /></div>
      ) : (
        <div className="container mt-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="m-0">Inventory</h4>
            <div>
              <label className="form-check-label me-2">Show only low stock</label>
              <input type="checkbox" className="form-check-input" checked={lowOnly} onChange={(e)=>setLowOnly(e.target.checked)} />
            </div>
          </div>
          <table className="table">
            <thead>
              <tr className="table-active">
                <th>Blood Group</th>
                <th>Available Quantity (ml)</th>
                <th>Last Updated</th>
                <th>Minimum Required (ml)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.bloodGroup} className={r.status === 'low' ? 'table-danger' : 'table-success'}>
                  <td>{r.bloodGroup}</td>
                  <td>{r.available}</td>
                  <td>{r.lastUpdated ? moment(r.lastUpdated).format('DD/MM/YYYY hh:mm A') : '-'}</td>
                  <td>{r.min}</td>
                  <td>{r.status === 'low' ? '⚠️ Low Stock' : '✔️ Sufficient'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;


