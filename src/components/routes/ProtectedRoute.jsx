import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import API from '../../services/API'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../redux/features/auth/authActions'

const ProtectedRoute = ({ children, roles }) => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const location = useLocation()

  // get current user
  const getUser = async () => {
    try {
      const { data } = await API.get('/api/auth/current-user')
      if (data?.success) {
        dispatch(getCurrentUser(data))
      }
    } catch (error) {
      localStorage.clear()
      console.log(error)
    }
  }

  useEffect(() => {
    if (!user) {
      getUser()
    }
  }, [user])

  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If still loading user data, show loading or wait
  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // check role
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
