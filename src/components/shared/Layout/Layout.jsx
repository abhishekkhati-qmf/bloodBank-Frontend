import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

const Layout = ({children}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()

  // Check if current page is an auth page (no sidebar needed)
  const isAuthPage = ['/login', '/register', '/verify-email', '/reset-password', '/forgot-password'].includes(location.pathname)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <>
      {/* Mobile Menu Toggle - Only show on authenticated pages */}
      {isMobile && !isAuthPage && (
        <button 
          className="mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
          type="button"
        >
          <i className="fas fa-bars"></i>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && !isAuthPage && (
        <div className="overlay show" onClick={closeSidebar}></div>
      )}

      {/* Header */}
      <div className='header'>
        <Header/>
      </div>

      {/* Main Layout */}
      <div className="row g-0">
        {/* Sidebar - Only show on authenticated pages */}
        {!isAuthPage && (
          <div className={`col-md-2 ${isMobile ? 'mobile-sidebar' : ''} ${sidebarOpen ? 'open' : ''}`}>
            <Sidebar onClose={closeSidebar} />
          </div>
        )}
        
        {/* Main Content */}
        <div className={`${isAuthPage ? 'col-12' : 'col-md-10'} responsive-container ${isMobile ? 'mobile-content' : ''}`}>
          {children}
        </div>
      </div>
    </>
  )
}

export default Layout