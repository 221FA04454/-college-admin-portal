import React, { useState, useEffect } from 'react';
import { getStudents, getColleges, createStudent } from '../../services/api';
import { User, Plus } from 'lucide-react';

const StudentsManager = () => {
    const [students, setStudents] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', college: '', course: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentRes, collegeRes] = await Promise.all([getStudents(), getColleges()]);
            setStudents(studentRes.data);
            setColleges(collegeRes.data);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await createStudent(formData);
            setFormData({ name: '', email: '', college: '', course: '' });
            setFormVisible(false);
            // Refresh students
            const res = await getStudents();
            setStudents(res.data);
        } catch (err) {
            alert('Error creating student');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>Students</h1>
                <button
                    onClick={() => setFormVisible(!formVisible)}
                    style={{ background: '#3b82f6', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Add Student
                </button>
            </div>

            {formVisible && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Register New Student</h3>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr 1fr auto' }}>
                        <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        <input placeholder="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />

                        <select value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })} required style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                            <option value="">Select College</option>
                            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <input placeholder="Course" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} required style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />

                        <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    </form>
                </div>
            )}

            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>Name</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>Email</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>College</th>
                            <th style={{ padding: '1rem', color: '#64748b', fontWeight: '600', fontSize: '0.9rem' }}>Course</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ background: '#eff6ff', padding: '0.4rem', borderRadius: '50%', color: '#3b82f6' }}><User size={16} /></div>
                                    {student.name}
                                </td>
                                <td style={{ padding: '1rem', color: '#64748b' }}>{student.email}</td>
                                <td style={{ padding: '1rem', color: '#1e293b' }}>{student.college_name}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem' }}>{student.course}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && students.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No students found.</div>
                )}
            </div>
        </div>
    );
};
export default StudentsManager;
