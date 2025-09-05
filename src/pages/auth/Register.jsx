import React from 'react'
import Form from '../../components/shared/Form/Form'
import {useSelector} from 'react-redux'
import Spinner from '../../components/shared/Spinner'
import toast from 'react-hot-toast'

const Register = () => {
  const {loading,error} = useSelector(state => state.auth)
  
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error])

  return (
    <>
        <div className='row'>
          <section className="vh-100">
            <div className="container-fluid">
              <div className="row h-100">
                {/* Left Side - Form */}
                <div className="col-12 col-md-6 col-lg-5 text-black d-flex flex-column justify-content-center">
                  <div className="px-3 px-md-5">
                    <div className="text-center mb-4">
                      <img src="./assets/logo.png" className='logo-login mb-3' alt="LifeLink" style={{ maxWidth: '120px' }} />
                      <h1 className="display-4 fw-bold text-danger mb-2 text-responsive">
                        <i className="fas fa-heartbeat me-2"></i>
                        Life<span className="text-warning">Link</span>
                      </h1>
                      <p className="text-muted fs-5 text-responsive">Join Our Blood Bank Community</p>
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
                      <Form formTitle={"Register"} submitBtn={"Register"} formType={'register'} />
                    )}
                  </div>
                </div>
                
                {/* Right Side - Image */}
                <div className="col-md-6 col-lg-7 px-0 d-none d-md-flex">
                  <div className="position-relative w-100 h-100">
                    <img 
                      src="./assets/banner2.jpg" 
                      alt="Register image" 
                      className="w-100 h-100 object-cover"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
                         style={{ background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.8) 0%, rgba(255, 152, 0, 0.8) 100%)' }}>
                      <div className="text-center text-white p-4">
                        <h2 className="display-5 fw-bold mb-3">Become a Life Saver</h2>
                        <p className="fs-5 mb-4">Register today and start making a difference in your community</p>
                        <div className="row g-3 text-center">
                          <div className="col-4">
                            <i className="fas fa-user-plus fa-2x mb-2"></i>
                            <div className="small">Easy Registration</div>
                          </div>
                          <div className="col-4">
                            <i className="fas fa-shield-alt fa-2x mb-2"></i>
                            <div className="small">Secure Platform</div>
                          </div>
                          <div className="col-4">
                            <i className="fas fa-handshake fa-2x mb-2"></i>
                            <div className="small">Join Community</div>
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

export default Register