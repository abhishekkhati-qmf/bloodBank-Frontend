import React from "react";
import AdminList from "../../components/shared/AdminList/AdminList";
import moment from "moment";

const DonorList = () => {
  const columns = ["Name", "Email", "Phone", "Status", "Date"];

  const renderRow = (record, { handleDelete, handleBlockUnblock }) => [
    <td key="name">{record.name || record.organisationName + " (ORG)"}</td>,
    <td key="email">{record.email}</td>,
    <td key="phone">{record.phone}</td>,
    <td key="status">
      <span className={`badge ${record.status === 'blocked' ? 'bg-danger' : 'bg-success'}`}>
        {record.status === 'blocked' ? 'Blocked' : 'Active'}
      </span>
    </td>,
    <td key="date">{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>,
    <td key="actions">
      <div className="d-flex gap-2">
        <button
          className={`btn btn-sm ${record.status === 'blocked' ? 'btn-success' : 'btn-warning'}`}
          onClick={() => handleBlockUnblock(record._id, record.status, 'Donor')}
        >
          {record.status === 'blocked' ? 'Unblock' : 'Block'}
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(record._id, 'Donor')}
        >
          Delete
        </button>
      </div>
    </td>
  ];

  return (
    <AdminList
      title="Donor List"
      apiEndpoint="/admin/donor-list"
      dataKey="donorData"
      columns={columns}
      renderRow={renderRow}
      showBloodStock={false}
    />
  );
};

export default DonorList;