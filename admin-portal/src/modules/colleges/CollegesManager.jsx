import React, { useState, useEffect } from 'react';
import { getColleges, createCollege, deleteCollege } from '../../services/api';
import { School, Plus, Trash2 } from 'lucide-react';

const CollegesManager = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [formData, setFormData] = useState({ name: '', location: '', website: '' });
    const [brochureFile, setBrochureFile] = useState(null);

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            const res = await getColleges();
            setColleges(res.data);
        } catch (err) {
            console.error("Failed to fetch colleges", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('location', formData.location);
            if (formData.website) data.append('website', formData.website);
            if (brochureFile) data.append('brochure', brochureFile);

            await createCollege(data);

            setFormData({ name: '', location: '', website: '' });
            setBrochureFile(null);
            setFormVisible(false);
            fetchColleges();
        } catch (err) {
            alert('Error creating college');
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            await deleteCollege(id);
            fetchColleges();
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>Colleges</h1>
                <button
                    onClick={() => setFormVisible(!formVisible)}
                    style={{ background: '#3b82f6', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={18} /> Add College
                </button>
            </div>

            {formVisible && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Add New College</h3>
                    <form onSubmit={handleAdd} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                        <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        <input placeholder="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        <input placeholder="Website" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="file"
                                onChange={e => setBrochureFile(e.target.files[0])}
                                accept=".pdf,.doc,.docx"
                                style={{ fontSize: '0.9rem' }}
                            />
                        </div>
                        <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {colleges.map(college => (
                    <div key={college.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ background: '#eff6ff', padding: '0.8rem', borderRadius: '8px', color: '#3b82f6' }}>
                                    <School size={24} />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.3rem 0', color: '#0f172a' }}>{college.name}</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{college.location}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(college.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                            <span>Students: {college.student_count || 0}</span>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {college.brochure && (
                                    <a href={college.brochure} target="_blank" rel="noreferrer" style={{ color: '#10b981', fontWeight: '500' }}>
                                        Brochure
                                    </a>
                                )}
                                {college.website && <a href={college.website} target="_blank" rel="noreferrer" style={{ color: '#3b82f6' }}>Visit Website</a>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && colleges.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <p>No colleges found. Add one to get started.</p>
                </div>
            )}
        </div>
    );
};
export default CollegesManager;
