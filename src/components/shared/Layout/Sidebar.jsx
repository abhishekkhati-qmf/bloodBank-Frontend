import React from "react";
// import { userMenu } from './Menus/userMenu'
import { Link, useLocation } from "react-router-dom";
import "../../../styles/Layout.css";
import { useSelector } from "react-redux";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  return (
    <div>
      <div className="sidebar">
        <div className="menu">
          {user?.role === "organisation" && (
            <>
              <div
                className={`menu-item ${location.pathname === "/inventory" && "active"}`}
              >
                <i className="fa-solid fa-cubes"></i>
                <Link to="/inventory">Inventory</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/donors-list" && "active"
                }`}
              >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donors-list">Donors</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/hospital" && "active"
                }`}
              >
                <i className="fa-solid fa-truck-medical"></i>
                <Link to="/hospital">Hospitals</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/camps" && "active"
                }`}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <Link to="/camps">Blood Camps</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/emergency" && "active"
                }`}
              >
                <i className="fa-solid fa-exclamation-triangle"></i>
                <Link to="/emergency">Emergency Requests</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/organisation-dashboard" && "active"
                }`}
              >
                <i className="fa-solid fa-hand-holding-heart"></i>
                <Link to="/organisation-dashboard">Donation Requests</Link>
              </div>
            </>
          )}
          
          {user?.role === "admin" && (
            <>
              <div
                className={`menu-item ${
                  location.pathname === "/donor-list" && "active"
                }`}
              >
                <i className="fa-solid fa-hand-holding-medical"></i>
                <Link to="/donor-list">Donor List</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/hospital-list" && "active"
                }`}
              >
                <i className="fa-solid fa-truck-medical"></i>
                <Link to="/hospital-list">Hospital List</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/org-list" && "active"
                }`}
              >
                <i className="fa-solid fa-hospital"></i>
                <Link to="/org-list">Organisation List</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/camp-approval" && "active"
                }`}
              >
                <i className="fa-solid fa-calendar-check"></i>
                <Link to="/camp-approval">Camp Approval</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/emergency-management" && "active"
                }`}
              >
                <i className="fa-solid fa-exclamation-triangle"></i>
                <Link to="/emergency-management">Emergency Management</Link>
              </div>
              <div
                className={`menu-item ${
                  location.pathname === "/camps-history" && "active"
                }`}
              >
                <i className="fa-solid fa-history"></i>
                <Link to="/camps-history">Camps History</Link>
              </div>
            </>
          )}

          {(user?.role === "donor" || user?.role === "hospital") && (
            <>
              <div
                className={`menu-item ${
                  location.pathname === "/organisations" && "active"
                }`}
              >
                <i className="fa-solid fa-building-ngo"></i>
                <Link to="/organisations">Organisations</Link>
              </div>
            </>
          )}

          {/* Consumer page removed - hospital acts as consumer */}
          {user?.role === "donor" && (
            <div
              className={`menu-item ${
                location.pathname === "/donation" && "active"
              }`}
            >
              <i className="fa-solid fa-book-medical"></i>
              <Link to="/donation">Donations Log</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
