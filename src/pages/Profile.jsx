import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Camera, Package, Calendar, DollarSign, ShoppingBag, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', email: '' });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const loadProfile = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchProfileData(),
                    fetchOrders()
                ]);
            } catch (error) {
                console.error('Error loading profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            const response = await fetch('https://store-b-backend-production.up.railway.app/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch profile: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setProfileData(data);
            setEditForm({ name: data.name || '', email: data.email || '' });
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Set default values to prevent crashes
            setProfileData({ name: user?.name || '', email: user?.email || '', role: user?.role || 'customer' });
            setEditForm({ name: user?.name || '', email: user?.email || '' });
        }
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return;
            }
            const response = await fetch('https://store-b-backend-production.up.railway.app/api/user/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status}`);
            }

            const data = await response.json();
            // Ensure data is an array
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]); // Set empty array on error
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profileImage', file);

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://store-b-backend-production.up.railway.app/api/user/profile/image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                setProfileData(prev => ({ ...prev, profileImage: data.profileImage }));
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('No token available');
                return;
            }

            const response = await fetch('https://store-b-backend-production.up.railway.app/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Failed to update profile' }));
                throw new Error(errorData.error || `Failed to update profile: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setProfileData(data);
            setIsEditing(false);

            // Update local storage safely
            try {
                const storedUserStr = localStorage.getItem('user');
                if (storedUserStr) {
                    const storedUser = JSON.parse(storedUserStr);
                    localStorage.setItem('user', JSON.stringify({ ...storedUser, name: data.name, email: data.email }));
                }
            } catch (storageError) {
                console.error('Error updating localStorage:', storageError);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.message || 'Failed to update profile. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Safety check - if no profileData but user exists, use user data
    const displayData = profileData || { name: user?.name || '', email: user?.email || '', role: user?.role || 'customer', profileImage: null };

    return (
        <div className="profile-container">
            <div className="profile-wrapper">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-header-bg"></div>
                    <div className="profile-info-card">
                        <div className="profile-image-section">
                            <div className="profile-image-wrapper">
                                {displayData?.profileImage ? (
                                    <img src={displayData.profileImage} alt="Profile" className="profile-image" />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        <User size={60} />
                                    </div>
                                )}
                                <label className="profile-image-upload-btn">
                                    <Camera size={20} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {uploading && <div className="upload-overlay">Uploading...</div>}
                            </div>
                        </div>

                        <div className="profile-details">
                            {!isEditing ? (
                                <>
                                    <h1 className="profile-name">{displayData?.name || 'User'}</h1>
                                    <p className="profile-email">{displayData?.email || ''}</p>
                                    <p className="profile-role">{displayData?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
                                    <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={18} />
                                        Edit Profile
                                    </button>
                                </>
                            ) : (
                                <div className="edit-profile-form">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Name"
                                        className="edit-input"
                                    />
                                    <input
                                        type="email"
                                        value={editForm.email}
                                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                        placeholder="Email"
                                        className="edit-input"
                                    />
                                    <div className="edit-actions">
                                        <button className="save-btn" onClick={handleUpdateProfile}>
                                            <Save size={18} />
                                            Save
                                        </button>
                                        <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                                            <X size={18} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order History */}
                <div className="order-history-section">
                    <div className="section-header">
                        <Package size={28} />
                        <h2>Shopping History</h2>
                    </div>

                    {orders.length === 0 ? (
                        <div className="no-orders">
                            <ShoppingBag size={64} />
                            <h3>No Orders Yet</h3>
                            <p>Start shopping to see your order history here!</p>
                            <button className="shop-now-btn" onClick={() => navigate('/allproducts')}>
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {orders.map((order, orderIndex) => (
                                <div key={order.id || orderIndex} className="order-card">
                                    <div className="order-header">
                                        <div className="order-id">
                                            <Package size={20} />
                                            <span>Order #{order.id || 'N/A'}</span>
                                        </div>
                                        <span className={`order-status status-${(order.status || 'pending').toLowerCase()}`}>
                                            {order.status || 'Pending'}
                                        </span>
                                    </div>

                                    <div className="order-meta">
                                        <div className="order-meta-item">
                                            <Calendar size={16} />
                                            <span>{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="order-meta-item">
                                            <DollarSign size={16} />
                                            <span className="order-total">{parseFloat(order.total || 0).toFixed(2)} <small>EGP</small></span>
                                        </div>
                                    </div>

                                    <div className="order-items">
                                        <h4>Items ({order.items?.length || 0})</h4>
                                        <div className="order-items-list">
                                            {(order.items || []).map((item, index) => (
                                                <div key={index} className="order-item">
                                                    <img src={item.image || ''} alt={item.title || 'Item'} className="order-item-image" />
                                                    <div className="order-item-details">
                                                        <p className="order-item-title">{item.title || 'Unknown Item'}</p>
                                                        <p className="order-item-quantity">Qty: {item.quantity || 0}</p>
                                                    </div>
                                                    <p className="order-item-price">{((item.price || 0) * (item.quantity || 0)).toFixed(2)} <small>EGP</small></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
