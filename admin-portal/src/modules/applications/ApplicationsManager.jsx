import React, { useState, useEffect } from 'react';
import { getApplications, updateApplicationStatus } from '../../services/api';
import { FileText, Check, X, Clock } from 'lucide-react';

const ApplicationsManager = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getApplications();
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateApplicationStatus(id, newStatus);
            fetchData();
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'accepted': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dcfce7', color: '#166534', fontSize: '0.85rem' }}>Accepted</span>;
            case 'rejected': return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fee2e2', color: '#991b1b', fontSize: '0.85rem' }}>Rejected</span>;
            default: return <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontSize: '0.85rem' }}>Pending</span>;
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>Applications</h1>
            </div>

            <div className="card" style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>Student</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>College</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>Course</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>Date</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: '#64748b' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontWeight: '500' }}>{app.student_name || app.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{app.email}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{app.college_name}</td>
                                <td style={{ padding: '1rem' }}>{app.course}</td>
                                <td style={{ padding: '1rem' }}>{new Date(app.applied_at).toLocaleDateString()}</td>
                                <td style={{ padding: '1rem' }}>{getStatusBadge(app.status)}</td>
                                <td style={{ padding: '1rem' }}>
                                    {app.status === 'pending' && (
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'accepted')}
                                                style={{ background: '#22c55e', border: 'none', color: 'white', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                                title="Accept"
                                            >
                                                <Check size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                style={{ background: '#ef4444', border: 'none', color: 'white', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                                title="Reject"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && !loading && (
                            <tr>
                                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No applications found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationsManager;
