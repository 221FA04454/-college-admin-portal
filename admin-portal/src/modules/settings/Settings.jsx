import React, { useState, useEffect } from 'react';
import { Shield, Send, Megaphone, AlertTriangle, Activity, Key } from 'lucide-react'; // Added icons
import { sendHelpEmail, getAnnouncement, updateAnnouncement, getAuditLogs, changePassword } from '../../services/api';
import api from '../../services/api';
import './Settings.css';

const ChangePasswordForm = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('');

        if (newPassword !== confirmPassword) {
            setStatus('error: New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setStatus('error: Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setStatus('success: Password changed successfully');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setStatus(err.response?.data?.error || 'error: Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-card">
            <div className="card-header header-dark">
                <div className="header-title-row">
                    <Key size={24} />
                    <h2 className="header-title">Change Password</h2>
                </div>
                <p className="header-desc">
                    Update your account security.
                </p>
            </div>
            <div className="card-body">
                {status && (
                    <div className={`status-msg ${status.startsWith('success') ? 'status-success' : 'status-error'}`}>
                        {status.replace('success: ', '').replace('error: ', '')}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="form-group">
                        <label>Current Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-dark"
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const HelpDeskForm = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessageBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');

    const handleSend = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('');

        try {
            await sendHelpEmail(subject, message);
            setStatus('success: Message sent to Super Admin!');
            setSubject('');
            setMessageBody('');
        } catch (err) {
            setStatus('error: Failed to send message.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {status && (
                <div className={`status-msg ${status.startsWith('success') ? 'status-success' : 'status-error'}`}>
                    {status.replace('success: ', '').replace('error: ', '')}
                </div>
            )}
            <form onSubmit={handleSend} className="settings-form">
                <div className="form-group">
                    <label>Subject</label>
                    <input
                        type="text"
                        className="form-input"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        placeholder="e.g. System Update Request"
                    />
                </div>
                <div className="form-group">
                    <label>Message</label>
                    <textarea
                        className="form-textarea"
                        value={message}
                        onChange={(e) => setMessageBody(e.target.value)}
                        required
                        rows="4"
                        placeholder="Describe your query..."
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-indigo"
                >
                    {loading ? 'Sending...' : (
                        <>
                            <Send size={20} />
                            Send Message
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

// --- NEW COMPONENT: System Controls ---
const SystemControls = () => {
    const [announcement, setAnnouncement] = useState('');
    const [loadingAnnounce, setLoadingAnnounce] = useState(false);

    useEffect(() => {
        getAnnouncement().then(res => setAnnouncement(res.data.global_announcement || ''));
    }, []);

    const saveAnnouncement = async () => {
        setLoadingAnnounce(true);
        try {
            await updateAnnouncement(announcement);
            alert("Announcement Updated!");
        } catch (err) {
            alert("Failed to update announcement");
        } finally {
            setLoadingAnnounce(false);
        }
    };

    return (
        <div className="settings-grid">
            {/* Global Announcement */}
            <div className="settings-card">
                <div className="card-header header-amber">
                    <div className="header-title-row">
                        <Megaphone size={24} />
                        <h2 className="header-title">Global Announcement</h2>
                    </div>
                    <p className="header-desc">
                        Broadcast a message to all users on the platform.
                    </p>
                </div>
                <div className="card-body">
                    <textarea
                        className="form-textarea"
                        value={announcement}
                        onChange={(e) => setAnnouncement(e.target.value)}
                        rows="3"
                        style={{ marginBottom: '1.5rem', flex: 1 }}
                        placeholder="e.g. Scheduled maintenance at 10 PM..."
                    />
                    <button onClick={saveAnnouncement} disabled={loadingAnnounce} className="btn btn-amber">
                        {loadingAnnounce ? 'Saving...' : 'Update Announcement'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- NEW COMPONENT: Audit Logs ---
const AuditLogTable = () => {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('ALL');

    useEffect(() => {
        getAuditLogs().then(res => setLogs(res.data)).catch(err => console.error(err));
    }, []);

    // Get unique actions for filter dropdown
    const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action))];

    // Filter logic
    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterAction === 'ALL' || log.action === filterAction;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="settings-card" style={{ marginTop: '2rem' }}>
            <div className="card-header header-slate">
                <div className="header-title-row">
                    <Activity size={24} />
                    <h2 className="header-title">System Activity Log</h2>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="form-input"
                    style={{ flex: 1, minWidth: '200px' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="form-input"
                    style={{ width: 'auto', minWidth: '150px' }}
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                >
                    {uniqueActions.map(action => (
                        <option key={action} value={action}>{action.replace('_', ' ')}</option>
                    ))}
                </select>
            </div>

            <div className="audit-table-wrapper">
                <table className="audit-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>#</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log, index) => (
                                <tr key={log.id}>
                                    <td style={{ color: '#94a3b8', fontWeight: '500' }}>{index + 1}</td>
                                    <td style={{ fontWeight: '500' }}>{log.user}</td>
                                    <td className="audit-action">{log.action}</td>
                                    <td>{log.details}</td>
                                    <td className="audit-timestamp">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-state">
                                    No matching records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {logs.length === 0 && <p className="empty-state">No activity recorded yet.</p>}
            </div>
        </div>
    );
};

const SettingsComp = () => {
    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1 className="settings-title">Settings & Configuration</h1>
            </div>

            <div className="settings-grid">
                {/* Help Desk Section */}
                <div className="settings-card">
                    <div className="card-header header-indigo">
                        <div className="header-title-row">
                            <Send size={24} />
                            <h2 className="header-title">Help Desk</h2>
                        </div>
                        <p className="header-desc">
                            Contact the Super Admin for updates or support.
                        </p>
                    </div>

                    <div className="card-body">
                        <HelpDeskForm />
                    </div>
                </div>

                {/* Change Password Section */}
                <ChangePasswordForm />
            </div>

            {/* New Sections */}
            <SystemControls />
            <AuditLogTable />

        </div>
    );
};
export default SettingsComp;
