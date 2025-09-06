import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/API';
import { toast } from 'react-hot-toast';

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('No reset token found');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { data } = await API.post('/api/auth/reset-password', {
        token,
        newPassword
      });

      if (data?.success) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setError(error?.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="mb-4">
            <i className="fa-solid fa-exclamation-triangle text-danger" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="text-danger mb-3">Invalid Reset Link</h3>
          <p className="text-muted mb-4">
            {error}
          </p>
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

  if (success) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="mb-4">
            <i className="fa-solid fa-check-circle text-success" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="text-success mb-3">Password Reset Successfully!</h3>
          <p className="text-muted mb-4">
            Your password has been updated. You can now log in with your new password.
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
      <div className="card shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div className="mb-3">
              <i className="fa-solid fa-lock text-primary" style={{ fontSize: '3rem' }}></i>
            </div>
            <h3>Reset Your Password</h3>
            <p className="text-muted">Enter your new password below</p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="fa-solid fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength="6"
              />
              <div className="form-text">
                Password must be at least 6 characters long
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-link"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
