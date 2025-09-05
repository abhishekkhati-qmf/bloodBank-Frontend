import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/API';
import { toast } from 'react-hot-toast';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No verification token found');
          setVerifying(false);
          return;
        }

        const { data } = await API.get(`/auth/verify-email/${token}`);
        
        if (data?.success) {
          setVerificationStatus('success');
          toast.success('Email verified successfully!');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(data?.message || 'Verification failed');
        }
      } catch (error) {
        setError(error?.response?.data?.message || 'Verification failed');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Verifying your email...</h5>
          <p className="text-muted">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="mb-4">
            <i className="fa-solid fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="text-success mb-3">Email Verified Successfully!</h3>
          <p className="text-muted mb-4">
            Your email has been verified. You can now log in to your account.
          </p>
          <div className="alert alert-info">
            <i className="fa-solid fa-info-circle me-2"></i>
            Redirecting to login page in a few seconds...
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="mb-4">
          <i className="fa-solid fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
        </div>
        <h3 className="text-danger mb-3">Verification Failed</h3>
        <p className="text-muted mb-4">
          {error || 'There was an error verifying your email address.'}
        </p>
        <div className="alert alert-warning">
          <i className="fa-solid fa-info-circle me-2"></i>
          The verification link may have expired or is invalid.
        </div>
        <div className="d-flex gap-2 justify-content-center">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate('/register')}
          >
            Register Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
