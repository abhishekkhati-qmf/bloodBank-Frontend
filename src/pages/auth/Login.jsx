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
            <div className="row">
              <div className="col-sm-4 text-black">
                <div className="px-5 ms-xl-4">
                  <div className="text-center mb-4">
                    <h1 className="display-4 fw-bold text-danger mb-2">
                      <i className="fas fa-heartbeat me-2"></i>
                      Life<span className="text-warning">Link</span>
                    </h1>
                    <p className="text-muted fs-5">Blood Bank Management System</p>
                    <div className="text-danger">
                      <small>Let's Save Lives Together!</small>
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center h-custom-2 px-5 ms-xl-4 mt-5 pt-5 pt-xl-0 mt-xl-n5">
                  {loading ? (
                    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
                      <Spinner size={120} />
                    </div>
                  ) : (
                    <Form formTitle={"Log In"} submitBtn={"Login"} formType={'login'} />
                  )}
                </div>
              </div>
              <div className="col-sm-6 px-0 d-none d-sm-block">
                <img src="./assets/banner1.jpg" alt="Login image" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Login
