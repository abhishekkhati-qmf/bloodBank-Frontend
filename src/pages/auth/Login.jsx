import React from 'react'
import Form from '../../components/shared/Form/Form'
import { useSelector } from 'react-redux'
import Spinner from '../../components/shared/Spinner'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Login = () => {
  const { loading, error, user } = useSelector(state => state.auth)
  const navigate = useNavigate()

  React.useEffect(() => {
    if (user && user.role) {
      // Navigate based on user role after successful login
      switch (user.role) {
        case "admin":
          navigate("/admin");
          break;
        case "hospital":
          navigate("/hospital");
          break;
        case "donor":
          navigate("/donor");
          break;
        case "organisation":
          navigate("/organisation");
          break;
        default:
          navigate("/");
      }
    }
  }, [user, navigate])

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error])

  return (
    <>
      <div className='row hide_scroll'>
        <section className="vh-100">
          <div className="container-fluid">
            <div className="row h-100">
              {/* Left Side - Form */}
              <div className="col-12 col-md-6 col-lg-5 text-black d-flex flex-column justify-content-center">
                <div className="px-3 px-md-5">
                  <div className="text-center mb-4">
                    <h1 className="display-4 fw-bold text-danger mb-2 text-responsive">
                      <i className="fas fa-heartbeat me-2"></i>
                      Life<span className="text-warning">Link</span>
                    </h1>
                    <p className="text-muted fs-5 text-responsive">Blood Bank Management System</p>
                    <div className="text-danger">
                      <small>Let's Save Lives Together!</small>
                    </div>
                  </div>
                </div>
                <div className="px-3 px-md-5">
                  {loading ? (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center" style={{ minHeight: '300px' }}>
                      <Spinner size={120} />
                    </div>
                  ) : (
                    <Form formTitle={"Log In"} submitBtn={"Login"} formType={'login'} />
                  )}
                </div>
              </div>
              
              {/* Right Side - Image */}
              <div className="col-md-6 col-lg-7 px-0 d-none d-md-flex">
                <div className="position-relative w-100 h-100">
                  <img 
                    src="./assets/banner1.jpg" 
                    alt="Login image" 
                    className="w-100 h-100 object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                       style={{ background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.8) 0%, rgba(255, 152, 0, 0.8) 100%)' }}>
                    <div className="text-center text-white p-4">
                      <h2 className="display-5 fw-bold mb-3">Save Lives Today</h2>
                      <p className="fs-5 mb-4">Join our community of life-savers and make a difference in someone's life</p>
                      <div className="row g-3 text-center">
                        <div className="col-4">
                          <i className="fas fa-heart fa-2x mb-2"></i>
                          <div className="small">Donate Blood</div>
                        </div>
                        <div className="col-4">
                          <i className="fas fa-hospital fa-2x mb-2"></i>
                          <div className="small">Save Lives</div>
                        </div>
                        <div className="col-4">
                          <i className="fas fa-users fa-2x mb-2"></i>
                          <div className="small">Build Community</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Login
