import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, verifyOtp, forceLogout } from '../../services/api';
import './Login.css';

const Login = () => {
    const [step, setStep] = useState(1); // 1: Credentials, 2: OTP, 3: Conflict
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [conflictDetails, setConflictDetails] = useState(null);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
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

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>🔐 EduAdmin Portal</h2>
                    <p>Secure Access Only</p>
                </div>

                {error && <div className="error-message">{error}</div>}

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
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
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
            </div>
        </div>
    );
};

export default Login;
