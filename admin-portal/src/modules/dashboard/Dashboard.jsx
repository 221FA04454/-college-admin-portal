import React, { useEffect, useState } from 'react';
import { Users, School, FileText, TrendingUp, MoreHorizontal, Eye, ShieldCheck } from 'lucide-react';
import { getDashboardStats } from '../../services/api';
import './Dashboard.css';

const StatCard = ({ title, value, change, icon, color }) => (
    <div className="card stat-card">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
            {icon}
        </div>
        <div className="stat-info">
            <h3 className="stat-value">{value}</h3>
            <p className="stat-title">{title}</p>
            <span className="stat-change text-green">
                <TrendingUp size={14} /> {change} this month
            </span>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        // Fetch Real Data from API
        getDashboardStats()
            .then(res => setStats(res.data))
            .catch(err => console.error("Failed to fetch dashboard stats", err));
    }, []);

    if (!stats) return <div className="p-8">Loading Dashboard...</div>;

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>Dashboard Overview</h1>
                <div className="date-picker-placeholder">
                    📅 Real-Time Data
                </div>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Students"
                    value={stats.total_students}
                    change="+12%"
                    icon={<Users size={24} />}
                    color="#3b82f6"
                />
                <StatCard
                    title="Total College Views"
                    value={stats.total_views}
                    change="+150"
                    icon={<Eye size={24} />}
                    color="#8b5cf6"
                />
                <StatCard
                    title="Applications"
                    value={stats.applications_pending}
                    change="+24%"
                    icon={<FileText size={24} />}
                    color="#10b981"
                />
                <StatCard
                    title="Active Admin Sessions"
                    value={stats.active_sessions}
                    change="Online Now"
                    icon={<ShieldCheck size={24} />}
                    color="#f59e0b"
                />
            </div>

            <div className="dashboard-content-grid">
                {/* Recent Applications Table */}
                <div className="card recent-applications">
                    <div className="card-header">
                        <h3>Recent Applications</h3>
                        <button className="btn-outline">View All</button>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>College</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2, 3].map(i => (
                                <tr key={i}>
                                    <td>
                                        <div className="user-row">
                                            <div className="avatar-sm">U</div>
                                            <span>User Name {i}</span>
                                        </div>
                                    </td>
                                    <td>IIT Delhi</td>
                                    <td>Jan {20 + i}, 2026</td>
                                    <td><span className="status-badge pending">Pending</span></td>
                                    <td><button className="icon-btn"><MoreHorizontal size={18} /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Quick Actions / Notifications */}
                {/* Welcome Card */}
                <div className="card welcome-card" style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%'
                    }} />

                    <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '50%', backdropFilter: 'blur(5px)' }}>
                        <span style={{ fontSize: '3rem', display: 'block' }}>👋</span>
                    </div>

                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Welcome Back!</h2>
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, margin: 0, fontWeight: '300' }}>EduAdmin Portal</p>

                    <div style={{ marginTop: '2.5rem', width: '100%', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1.5rem' }}>
                        <p style={{ fontSize: '0.95rem', opacity: 0.9, fontStyle: 'italic', margin: 0 }}>"Empowering education through technology."</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '0.5rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
