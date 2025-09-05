import React, { useEffect } from 'react'
import { MdOutlineBloodtype } from "react-icons/md";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAlt } from "react-icons/fa";
import { useSelector } from 'react-redux';
import {Link, useLocation} from 'react-router-dom'

const Header = () => {

    const {user} = useSelector(state=> state.auth);
    const location = useLocation();
    //logout handler
    const handleLogout=()=>{
        localStorage.clear();
        alert('Logout Successful !')
        window.location.reload();
    }
    return (
    <>
        <nav className='navbar'>
            <div className="container-fluid">
                <div className="navbar-brand h1">
                  <MdOutlineBloodtype color='red'/>
                  Life<span className='gold'>Link</span>
                </div>
                
                {/* Desktop Navigation */}
                <ul className='navbar-nav flex-row d-none d-md-flex'>
                    <li className="nav-item mx-3">
                        <p className='nav-link mb-0'>
                          <FaUserAlt/> Welcome <span className='gold'> {user?.name || user?.hospitalName || user?.organisationName} &nbsp;</span>
                          <span className="badge bg-secondary">{user?.role}</span>
                        </p>
                    </li>
                    <li className="nav-item mx-3">
                        <Link to='/' className='nav-link'>
                            Home
                        </Link>
                    </li>
                    <li className="nav-item mx-3">
                        <button className='btn btn-danger btn-sm' onClick={handleLogout}> 
                          <HiOutlineLogout color='white' /> Logout
                        </button>
                    </li>
                </ul>

                {/* Mobile Navigation */}
                <div className="d-md-none">
                  <div className="dropdown">
                    <button 
                      className="btn btn-outline-light dropdown-toggle" 
                      type="button" 
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaUserAlt />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li className="dropdown-item-text">
                        <small className="text-muted">Welcome</small><br/>
                        <strong>{user?.name || user?.hospitalName || user?.organisationName}</strong><br/>
                        <span className="badge bg-secondary">{user?.role}</span>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <Link to='/' className='dropdown-item' onClick={() => {}}>
                          <i className="fas fa-home me-2"></i>Home
                        </Link>
                      </li>
                      <li>
                        <button className='dropdown-item text-danger' onClick={handleLogout}>
                          <HiOutlineLogout className="me-2" />Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
            </div>
        </nav>
    </>
  )
}

export default Header