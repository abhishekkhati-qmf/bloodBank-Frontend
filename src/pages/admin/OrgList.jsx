import React from "react";
import AdminList from "../../components/shared/AdminList/AdminList";
import moment from "moment";

const OrgList = () => {
  const columns = ["Name", "Email", "Phone", "Blood Stock", "Status", "Date"];

  const renderRow = (record, { handleDelete, handleBlockUnblock, renderBloodStock }) => [
    <td key="name">{record.organisationName}</td>,
    <td key="email">{record.email}</td>,
    <td key="phone">{record.phone}</td>,
    <td key="bloodStock">{renderBloodStock(record.bloodStock)}</td>,
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
          onClick={() => handleBlockUnblock(record._id, record.status, 'Organisation')}
        >
          {record.status === 'blocked' ? 'Unblock' : 'Block'}
        </button>
        <button
          className="btn btn-danger btn-sm"
          onClick={() => handleDelete(record._id, 'Organisation')}
        >
          Delete
        </button>
      </div>
    </td>
  ];

  return (
    <AdminList
      title="Organization List"
      apiEndpoint="/admin/org-list-with-stock"
      dataKey="orgData"
      columns={columns}
      renderRow={renderRow}
      showBloodStock={true}
    />
  );
};

export default OrgList;
