import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { User, Camera, Package, Calendar, DollarSign, ShoppingBag, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../components/ui/Alert/CustomAlert';
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
    const [alertState, setAlertState] = useState(null);

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
            const response = await fetch(`${API_BASE_URL}/user/profile`, {
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
            const response = await fetch(`${API_BASE_URL}/user/orders`, {
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
            const response = await fetch(`${API_BASE_URL}/user/profile/image`, {
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

            const response = await fetch(`${API_BASE_URL}/user/profile`, {
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
            setAlertState({ message: error.message || 'Failed to update profile. Please try again.', type: 'error' });
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

    // Filter for delivered orders (Redundant if backend does it, but safer)
    const deliveredOrders = orders.filter(order => (order.status || '').toLowerCase() === 'delivered');

    return (
        <div className="profile-container">
            <div className="profile-content">
                {/* Profile Sidebar / Card */}
                <aside className="profile-sidebar">
                    <div className="profile-card">
                        <div className="profile-header-image">
                            <div className="image-container">
                                {displayData?.profileImage ? (
                                    <img src={displayData.profileImage} alt="Profile" className="profile-img" />
                                ) : (
                                    <div className="profile-img-placeholder">
                                        <User size={48} />
                                    </div>
                                )}
                                <label className="upload-btn" title="Change Profile Photo">
                                    <Camera size={18} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        hidden
                                    />
                                </label>
                                {uploading && <div className="uploading-spinner"></div>}
                            </div>
                        </div>

                        <div className="profile-info-display">
                            {!isEditing ? (
                                <>
                                    <h2 className="user-name">{displayData?.name || 'User'}</h2>
                                    <p className="user-email">{displayData?.email}</p>
                                    <div className="user-badge">
                                        {displayData?.role === 'admin' ? 'Administrator' : 'Verified Customer'}
                                    </div>
                                    <button className="btn-primary edit-btn" onClick={() => setIsEditing(true)}>
                                        <Edit2 size={16} /> Edit Profile
                                    </button>
                                </>
                            ) : (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="form-input"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            disabled
                                            className="form-input disabled"
                                            title="Email cannot be changed"
                                        />
                                        <span className="input-hint">Email cannot be changed associated with account</span>
                                    </div>
                                    <div className="form-actions">
                                        <button className="btn-primary save-btn" onClick={handleUpdateProfile}>
                                            <Save size={16} /> Save
                                        </button>
                                        <button className="btn-secondary cancel-btn" onClick={() => setIsEditing(false)}>
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content - Order History */}
                <main className="profile-main">
                    <div className="orders-section">
                        <div className="section-header">
                            <h2><Package size={24} /> Order History</h2>
                            <p className="section-subtitle">View your past delivered orders</p>
                        </div>

                        {deliveredOrders.length === 0 ? (
                            <div className="empty-state">
                                <ShoppingBag size={48} />
                                <h3>No delivered orders yet</h3>
                                <p>Once your orders are delivered, they will appear here.</p>
                                <button className="btn-primary shop-btn" onClick={() => navigate('/allproducts')}>
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {deliveredOrders.map((order, index) => (
                                    <div key={order.id || index} className="order-item-card">
                                        <div className="order-top">
                                            <div className="order-id-group">
                                                <span className="order-number">#{order.id || 'N/A'}</span>
                                                <span className="order-date">{formatDate(order.createdAt)}</span>
                                            </div>
                                            <div className="order-status-badge status-delivered">
                                                Delivered
                                            </div>
                                        </div>

                                        <div className="order-products">
                                            {(order.items || []).map((item, idx) => (
                                                <div key={idx} className="product-preview">
                                                    <img src={item.image || ''} alt={item.title} title={item.title} />
                                                    <span className="product-qty">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-footer">
                                            <div className="order-total">
                                                <span className="label">Total</span>
                                                <span className="amount">{parseFloat(order.total || 0).toFixed(2)} EGP</span>
                                            </div>
                                            {/* Could add 'View Details' button here later */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {alertState && (
                <CustomAlert
                    message={alertState.message}
                    type={alertState.type}
                    onClose={() => setAlertState(null)}
                />
            )}
        </div>
    );
};

export default Profile;
