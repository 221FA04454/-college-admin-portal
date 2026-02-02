import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verifyOtp, forceLogout, forgotPassword, resetPassword } from '../../services/api';
import { Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP, 3: Conflict, 4: Forgot Email, 5: Forgot Reset
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [conflictDetails, setConflictDetails] = useState(null);

    // Forgot Password State
    const [resetEmail, setResetEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Toggle State
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const response = await login(username, password);
            if (response.data.status === 'OTP_REQUIRED') {
                setStep(2);
            } else if (response.data.status === 'SESSION_CONFLICT') {
                setConflictDetails(response.data);
                setStep(3);
            } else if (response.data.status === 'TEMP_PASSWORD_RESET_REQUIRED') {
                setError('Please reset your password via the web portal first.');
            } else {
                setError('Unexpected response from server');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleForceLogout = async () => {
        setLoading(true);
        try {
            await forceLogout(username, password);
            // Auto-retry login after forcing logout
            const response = await login(username, password);
            if (response.data.status === 'OTP_REQUIRED') {
                setStep(2);
                setConflictDetails(null);
            } else {
                setStep(1);
                setError('Session cleared. Please login again.');
            }
        } catch (err) {
            setError('Failed to clear session.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await verifyOtp(username, otp);
            if (response.data.status === 'SUCCESS') {
                // Save Token
                localStorage.setItem('access_token', response.data.tokens.access);
                localStorage.setItem('refresh_token', response.data.tokens.refresh);
                localStorage.setItem('user', JSON.stringify({ username: response.data.username, role: response.data.role }));

                // Redirect
                navigate('/admin');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // --- Forgot Password Handlers ---
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(resetEmail);
            setStep(5); // Move to Reset Step
            setSuccessMsg('OTP sent to your email.');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await resetPassword(resetEmail, resetOtp, newPassword);
            setStep(1); // Back to Login
            setSuccessMsg('Password reset successfully! Please login.');
            setResetEmail('');
            setResetOtp('');
            setNewPassword('');
        } catch (err) {
            setError(err.response?.data?.error || 'Reset failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>🔐 EduAdmin Portal</h2>
                    <p>Secure Access Only</p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {successMsg && <div className="success-message" style={{ background: '#f0fdf4', color: '#166534', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '0.9rem' }}>{successMsg}</div>}

                {step === 1 && (
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6c757d',
                                        display: 'flex',
                                        alignItems: 'center' // Add this to align icon vertically
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                            <button type="button" onClick={() => { setStep(4); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: '0.9rem' }}>
                                Forgot Password?
                            </button>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="otp-info">
                            <p>Enter the 6-digit code sent to your email.</p>
                        </div>
                        <div className="form-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="XXXXXX"
                                maxLength="6"
                                className="otp-input"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Checking...' : 'Verify & Access'}
                        </button>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => setStep(1)}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="conflict-view">
                        <div className="conflict-alert">
                            <h3>⚠️ Active Session Detected</h3>
                            <p>{conflictDetails?.message}</p>
                        </div>
                        <div className="session-info">
                            <p><strong>Device:</strong> {conflictDetails?.device}</p>
                            <p><strong>IP Address:</strong> {conflictDetails?.ip}</p>
                        </div>
                        <p className="conflict-prompt">Do you want to end the other session and continue?</p>

                        <button onClick={handleForceLogout} className="btn-danger" disabled={loading}>
                            {loading ? 'Ending Session...' : 'Yes, End Other Session'}
                        </button>
                        <button onClick={() => setStep(1)} className="btn-link">
                            Cancel
                        </button>
                    </div>
                )}

                {/* Step 4: Forgot Password - Email Input */}
                {step === 4 && (
                    <form onSubmit={handleForgotSubmit}>
                        <div className="login-header" style={{ marginBottom: '1rem' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>Reset Password</h3>
                            <p style={{ fontSize: '0.9rem' }}>Enter your email to receive an OTP.</p>
                        </div>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                                placeholder="admin@example.com"
                            />
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => { setStep(1); setError(''); }}
                        >
                            Back to Login
                        </button>
                    </form>
                )}

                {/* Step 5: Forgot Password - Verify & Update */}
                {step === 5 && (
                    <form onSubmit={handleResetSubmit}>
                        <div className="otp-info">
                            <p>Enter the OTP sent to <strong>{resetEmail}</strong> and your new password.</p>
                        </div>
                        <div className="form-group">
                            <label>OTP Code</label>
                            <input
                                type="text"
                                value={resetOtp}
                                onChange={(e) => setResetOtp(e.target.value)}
                                placeholder="XXXXXX"
                                maxLength="6"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <div className="password-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    minLength="6"
                                    style={{ paddingRight: '40px', width: '100%', boxSizing: 'border-box' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6c757d',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                        <button
                            type="button"
                            className="btn-link"
                            onClick={() => setStep(4)}
                        >
                            Back
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Login;
