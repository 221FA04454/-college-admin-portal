import React, { useState, useEffect } from 'react';
import {
    getBrochures, createBrochure, deleteBrochure,
    getAds, createAd, deleteAd
} from '../../services/api';
import { FileText, Trash2, Plus, Download, Image as ImageIcon } from 'lucide-react';

const BrochuresManager = () => {
    // Brochures State
    const [brochures, setBrochures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formVisible, setFormVisible] = useState(false);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);

    // Ads State
    const [ads, setAds] = useState([]);
    const [adFormVisible, setAdFormVisible] = useState(false);
    const [adTitle, setAdTitle] = useState('');
    const [adImage, setAdImage] = useState(null);
    const [adLink, setAdLink] = useState('');

    useEffect(() => {
        fetchBrochures();
        fetchAds();
    }, []);

    const fetchBrochures = async () => {
        try {
            const res = await getBrochures();
            setBrochures(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAds = async () => {
        try {
            const res = await getAds();
            setAds(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('file', file);

            await createBrochure(formData);

            setTitle('');
            setFile(null);
            setFormVisible(false);
            e.target.reset();
            fetchBrochures();
        } catch (err) {
            alert('Failed to upload brochure');
        }
    };

    const handleAdUpload = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', adTitle);
            formData.append('image', adImage);
            if (adLink) formData.append('link', adLink);

            await createAd(formData);

            setAdTitle('');
            setAdImage(null);
            setAdLink('');
            setAdFormVisible(false);
            e.target.reset(); // Clear file input
            fetchAds();
            alert('Ad Content uploaded successfully!');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to upload ad content';
            alert('Error: ' + msg);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure?')) {
            try {
                await deleteBrochure(id);
                fetchBrochures();
            } catch (err) {
                alert('Failed to delete');
            }
        }
    };

    const handleDeleteAd = async (id) => {
        if (confirm('Are you sure you want to delete this content?')) {
            try {
                await deleteAd(id);
                fetchAds();
            } catch (err) {
                alert('Failed to delete ad');
            }
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>Brochures & Content</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => { setFormVisible(!formVisible); setAdFormVisible(false); }}
                        style={{ background: '#3b82f6', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Upload Brochure
                    </button>
                    <button
                        onClick={() => { setAdFormVisible(!adFormVisible); setFormVisible(false); }}
                        style={{ background: '#8b5cf6', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Plus size={18} /> Upload Ad Content
                    </button>
                </div>
            </div>

            {/* Brochure Form */}
            {formVisible && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ marginTop: 0 }}>Add New Brochure</h3>
                    <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                placeholder="e.g. 2026 Prospectus"
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>File (PDF/Doc)</label>
                            <input
                                type="file"
                                onChange={e => setFile(e.target.files[0])}
                                required
                                style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        </div>
                        <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>Upload Brochure</button>
                    </form>
                </div>
            )}

            {/* Ad Form */}
            {adFormVisible && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #8b5cf6' }}>
                    <h3 style={{ marginTop: 0, color: '#6d28d9' }}>Add New Ad Content</h3>
                    <form onSubmit={handleAdUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Title</label>
                            <input
                                value={adTitle}
                                onChange={e => setAdTitle(e.target.value)}
                                required
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                placeholder="e.g. Spring Admission Banner"
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={e => setAdImage(e.target.files[0])}
                                required
                                style={{ width: '100%', padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>Link (Optional)</label>
                            <input
                                value={adLink}
                                onChange={e => setAdLink(e.target.value)}
                                style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                                placeholder="https://..."
                            />
                        </div>
                        <button type="submit" style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '4px', cursor: 'pointer' }}>Upload Content</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>

                {/* Brochures List */}
                <section>
                    <h2 style={{ fontSize: '1.4rem', color: '#334155', marginBottom: '1rem' }}>Brochures</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {brochures.length === 0 && <p style={{ color: '#94a3b8' }}>No brochures found.</p>}
                        {brochures.map(b => (
                            <div key={b.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ background: '#fef3c7', padding: '0.8rem', borderRadius: '8px', color: '#d97706' }}>
                                        <FileText size={24} />
                                    </div>
                                    <button onClick={() => handleDelete(b.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 0.5rem 0', fs: '1.1rem' }}>{b.title}</h3>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Uploaded: {new Date(b.uploaded_at).toLocaleDateString()}</p>
                                </div>
                                <a href={b.file} target="_blank" rel="noreferrer" style={{ marginTop: 'auto', textAlign: 'center', background: '#f1f5f9', color: '#475569', padding: '0.6rem', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: '500' }}>
                                    Download
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Ads List */}
                <section>
                    <h2 style={{ fontSize: '1.4rem', color: '#334155', marginBottom: '1rem' }}>Ad Content</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {ads.length === 0 && <p style={{ color: '#94a3b8' }}>No content found.</p>}
                        {ads.map(ad => (
                            <div key={ad.id} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '150px', background: '#f8fafc', overflow: 'hidden' }}>
                                    <img src={ad.image} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{ad.title}</h3>
                                        <button onClick={() => handleDeleteAd(ad.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    {ad.link && <a href={ad.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'none' }}>{ad.link}</a>}
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', marginTop: 'auto' }}>Posted: {new Date(ad.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BrochuresManager;
