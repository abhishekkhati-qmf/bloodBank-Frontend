import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { useSelector } from "react-redux";
import Spinner from '../../components/shared/Spinner';

const Consumer = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [requests, setRequests] = useState([]);
    const [temp,setTemp] =useState(false);
    //find donar records
    const getDonors = async () => {
      try {
        const { data } = await API.post("/inventory/get-inventory-hospital", {
          filters: {
            inventoryType: "out",
            hospital: user?._id,
          },
        });
        if (data?.success) {
          setData(data?.inventory);
          console.log(data);
        }
        const reqRes = await API.get('/requests/hospital');
        if (reqRes?.data?.success) setRequests(reqRes.data.requests || []);
      } catch (error) {
        console.log(error);
      }finally{
        setTemp(false);
      }
    };
  
    useEffect(() => {
        setTemp(true);
      getDonors();
    }, []);
  
    return (
      <Layout>
        {temp ? (
        <div className="d-flex justify-content-center align-items-center"><Spinner size={80} /></div>
      ) : (
        <div className="container mt-4">
          <h5 className="mb-2">Requests</h5>
          <table className="table">
            <thead className="table-active">
              <tr>
                <th>Consumer Name</th>
                <th>Blood Group</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Request Date</th>
                <th>Actions</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r._id}>
                  <td>{r.organisation?.organisationName || '-'}</td>
                  <td>{r.bloodGroup}</td>
                  <td>{r.quantity} ml</td>
                  <td>{r.status}</td>
                  <td>{moment(r.createdAt).format('DD/MM/YYYY hh:mm A')}</td>
                  <td>
                    <button className="btn btn-sm btn-success me-2" disabled={r.status!=='approved'} onClick={async()=>{ try{ const res = await API.post(`/requests/${r._id}/fulfilled`); if(res?.data?.success){ alert('Marked fulfilled'); getDonors(); } }catch(e){ alert('Failed'); } }}>Mark Fulfilled</button>
                    <span className="text-muted">Approve/Reject by organisation</span>
                  </td>
                  <td><a href={`mailto:${r.organisation?.email}`}>Email</a></td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5 className="mt-4">Donation History (Received)</h5>
          <table className="table table-danger">
            <thead className="table-active">
              <tr>
                <th scope="col">Blood Group</th>
                <th scope="col">Inventory TYpe</th>
                <th scope="col">Quantity</th>
                <th scope="col">Email</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((record) => (
                <tr key={record._id}>
                  <td>{record.bloodGroup}</td>
                  <td>{record.inventoryType}</td>
                  <td>{record.quantity}</td>
                  <td>{record.email}</td>
                  <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </Layout>
    );
};

export default Consumer;
