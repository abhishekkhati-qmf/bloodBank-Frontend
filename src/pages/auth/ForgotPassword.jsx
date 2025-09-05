import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../../services/API';
import { toast } from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await API.post('/auth/forgot-password', {
        email
      });

      if (data?.success) {
        setSuccess(true);
        toast.success('Password reset link sent to your email!');
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to send reset link');
      toast.error(error?.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="card shadow" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-body p-5 text-center">
            <div className="mb-4">
              <i className="fa-solid fa-envelope-circle-check text-success" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3 className="text-success mb-3">Check Your Email!</h3>
            <p className="text-muted mb-4">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your email and click the link to reset your password.
            </p>
            <div className="alert alert-info">
              <i className="fa-solid fa-info-circle me-2"></i>
              <strong>Note:</strong> The reset link will expire in 1 hour for security reasons.
            </div>
            <div className="mt-4">
              <button 
                className="btn btn-primary me-2"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                Send Another Email
              </button>
              <Link to="/login" className="btn btn-outline-secondary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="fa-solid fa-key text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3>Forgot Password?</h3>
            <p className="text-muted">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="fa-solid fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={loading}
              />
              <div className="form-text">
                Enter the email address associated with your account
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane me-2"></i>
                  Send Reset Link
                </>
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="btn btn-link">
                <i className="fa-solid fa-arrow-left me-2"></i>
                Back to Login
              </Link>
            </div>
          </form>

          <div className="mt-4 pt-3 border-top">
            <div className="text-center">
              <small className="text-muted">
                Remember your password?{' '}
                <Link to="/login" className="text-decoration-none">
                  Sign in here
                </Link>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
