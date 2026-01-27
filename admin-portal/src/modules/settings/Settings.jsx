import React, { useState } from 'react';
import { Mail, Shield, UserPlus } from 'lucide-react';
// We'll assume a createAdmin or similar API exists or we'll mock it for now.
// Since create_admin API exists in backend (accounts/api_views.py) -> APICreateAdminView
import api from '../../services/api';

const SettingsComp = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.post('create-admin/', { username, email });
            setMessage('Admin invitation sent successfully!');
            setEmail('');
            setUsername('');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to invite admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '2rem' }}>Settings</h1>

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', overflow: 'hidden', maxWidth: '600px' }}>
                <div style={{ background: '#3b82f6', padding: '1.5rem', color: 'white' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Shield size={24} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Create New Admin</h2>
                    </div>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
                        Create a new admin account. They will receive temporary credentials via email.
                    </p>
                </div>

                <div style={{ padding: '2rem' }}>
                    {message && (
                        <div style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            background: message.includes('success') ? '#f0fdf4' : '#fef2f2',
                            color: message.includes('success') ? '#166534' : '#991b1b',
                            border: `1px solid ${message.includes('success') ? '#bbf7d0' : '#fecaca'}`
                        }}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleInvite} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                placeholder="e.g. college_admin_1"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500', color: '#475569' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '0.875rem',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Creating...' : (
                                <>
                                    <UserPlus size={20} />
                                    Create Admin User
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default SettingsComp;
