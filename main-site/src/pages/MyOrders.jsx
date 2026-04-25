import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronDown,
    Search,
    Calendar,
    ArrowRight,
    ShoppingBag,
    Truck,
    MessageCircle,
    CreditCard
} from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../config';
import '../pages/Orders.css';

// --- Components ---

const OrderTimeline = ({ status }) => {
    const steps = [
        { label: 'Pending', status: 'pending', icon: <Clock size={18} /> },
        { label: 'Processing', status: 'processing', icon: <Package size={18} /> },
        { label: 'Shipped', status: 'shipped', icon: <Truck size={18} /> },
        { label: 'Delivered', status: 'delivered', icon: <CheckCircle size={18} /> }
    ];

    const currentIdx = steps.findIndex(s => s.status === status.toLowerCase());
    const isCancelled = status.toLowerCase() === 'cancelled';

    return (
        <div className="timeline-container">
            {isCancelled ? (
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                    <XCircle size={24} />
                    <div>
                        <h4 className="font-bold">Order Cancelled</h4>
                        <p className="text-sm text-red-500">This order has been cancelled and will not be processed.</p>
                    </div>
                </div>
            ) : (
                <div className="order-timeline">
                    <div className="timeline-track-bg"></div>
                    {steps.map((step, index) => {
                        const isActive = index <= currentIdx;
                        const isCurrent = index === currentIdx;
                        return (
                            <div key={step.status} className={`timeline-step ${isActive ? 'active' : ''} ${index < currentIdx ? 'completed' : ''}`}>
                                <div className="step-circle">
                                    {step.icon}
                                </div>
                                <span className="step-label">{step.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (location.state?.orderSuccess) {
            setShowSuccess(true);
            window.history.replaceState({}, document.title);
            const timer = setTimeout(() => setShowSuccess(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await ordersAPI.getAll(token);
            const result = await response.json();

            if (result.success) {
                const sortedOrders = result.data.sort((a, b) =>
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setOrders(sortedOrders);
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch =
                order.id.toString().includes(searchQuery) ||
                (typeof order.items === 'string' ? order.items : JSON.stringify(order.items))
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

            const matchesStatus = filterStatus === 'All' || order.status.toLowerCase() === filterStatus.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, filterStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-50">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="h-16 w-16 bg-blue-200 rounded-full flex items-center justify-center">
                        <ShoppingBag size={32} className="text-blue-500" />
                    </div>
                    <p className="text-gray-500 font-medium text-lg">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-page">
            <div className="main-orderpage">
                {showSuccess && (
                    <div className="mb-8 bg-green-500/10 backdrop-blur-md border border-green-500/20 text-green-800 p-6 rounded-2xl flex items-center justify-between animate-fade-in shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg shadow-green-500/30">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Order Placed Successfully!</p>
                                <p className="text-green-700/80">Thank you for your purchase. Tracking details are below.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSuccess(false)} className="p-2 hover:bg-green-500/10 rounded-full transition-colors">
                            <XCircle size={20} />
                        </button>
                    </div>
                )}

                <div className="order-header-section">
                    <h1 className="order-title">My Orders</h1>
                    <p className="order-subtitle">Track and manage your recent purchases</p>
                </div>

                <div className="order-controls">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="search-icon" size={20} />
                    </div>

                    <div className="filter-tabs">
                        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                            <button
                                key={status}
                                className={`filter-tab ${filterStatus === status ? 'active' : ''}`}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="orders-list-container">
                    {filteredOrders.length === 0 ? (
                        <div className="empty-state-card animate-fade-in">
                            <div className="empty-state-icon">
                                <ShoppingBag size={48} />
                            </div>
                            <h3 className="empty-state-title">No orders found</h3>
                            <p className="empty-state-text">
                                {orders.length > 0
                                    ? "We couldn't find any orders matching your selected status or search."
                                    : "You haven't placed any orders yet. Explore our collection and find something you love!"}
                            </p>

                            {orders.length > 0 ? (
                                <button
                                    onClick={() => {
                                        setFilterStatus('All');
                                        setSearchQuery('');
                                    }}
                                    className="shop-now-btn"
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <button onClick={() => navigate('/allproducts')} className="shop-now-btn">
                                    Start Shopping <ArrowRight size={20} />
                                </button>
                            )}
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            let items = [];
                            try {
                                items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                            } catch (e) { items = []; }

                            const isExpanded = expandedOrder === order.id;

                            return (
                                <div key={order.id} className="order-card">
                                    <div
                                        className="order-card-header"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        <div className="order-id-group">
                                            <span className="order-id-label">Order ID</span>
                                            <span className="order-id-value">#{order.id}</span>
                                            <div className="order-date">
                                                <Calendar size={14} />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="order-total-group">
                                            <span className="total-label">Total Amount</span>
                                            <span className="total-value">{parseFloat(order.total).toFixed(2)} <small>EGP</small></span>
                                        </div>

                                        <div className={`expand-icon ${isExpanded ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.3s' }}>
                                            <ChevronDown size={24} />
                                        </div>
                                    </div>

                                    <div className={`order-details-wrapper ${isExpanded ? 'expanded' : ''}`}>
                                        <div className="order-details-inner">
                                            <OrderTimeline status={order.status} />

                                            <div className="order-content-layout">
                                                <div className="items-section">
                                                    <h4><Package size={18} className="text-indigo-600" /> Items in Order</h4>
                                                    <div className="items-list">
                                                        {items.map((item, index) => (
                                                            <div key={index} className="order-item-row">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    className="item-img"
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                                <div className="item-details-block">
                                                                    <h5 className="item-title">{item.title}</h5>
                                                                    <div className="item-specs">
                                                                        <span>Qty: {item.quantity}</span>
                                                                        <span className="w-px h-4 bg-gray-300"></span>
                                                                        <span className="item-price-tag">{parseFloat(item.price).toFixed(2)} EGP</span>
                                                                    </div>
                                                                </div>
                                                                <div className="font-bold text-gray-900 self-center">
                                                                    {(item.price * item.quantity).toFixed(2)} EGP
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="summary-section">
                                                    <div className="order-actions-card">
                                                        <div className="need-help">
                                                            <div className="help-title">
                                                                <AlertCircle size={18} /> Need Help?
                                                            </div>
                                                            <p className="help-text">
                                                                Having trouble with this order? Contact our support team for assistance.
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('/contact', { state: { orderId: order.id } });
                                                            }}
                                                            className="support-btn"
                                                        >
                                                            <MessageCircle size={18} /> Contact Support
                                                        </button>
                                                    </div>

                                                    {/* Additional info placeholder */}
                                                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                                                        <div className="flex items-center gap-2 text-blue-800 font-bold text-sm mb-2">
                                                            <CreditCard size={16} /> Payment Info
                                                        </div>
                                                        <p className="text-xs text-blue-600/80">
                                                            Payment via Cash on delivery
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;

