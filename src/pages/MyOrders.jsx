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
    ChevronUp,
    Search,
    Calendar,
    ArrowRight,
    ShoppingBag,
    Truck,
    MessageCircle
} from 'lucide-react';
import CustomAlert from '../components/ui/Alert/CustomAlert';
import { PLACEHOLDER_IMAGE } from '../config';
import '../pages/Orders.css';

const OrderTimeline = ({ status }) => {
    const steps = [
        { label: 'Pending', status: 'pending', icon: <Clock size={16} /> },
        { label: 'Processing', status: 'processing', icon: <Package size={16} /> },
        { label: 'Shipped', status: 'shipped', icon: <Truck size={16} /> },
        { label: 'Delivered', status: 'delivered', icon: <CheckCircle size={16} /> }
    ];

    const currentIdx = steps.findIndex(s => s.status === status.toLowerCase());
    const isCancelled = status.toLowerCase() === 'cancelled';

    if (isCancelled) {
        return (
            <div className="order-timeline">
                <div className="timeline-step step-active w-full" style={{ width: '100%' }}>
                    <div className="step-icon bg-red-100 border-red-200 text-red-600">
                        <XCircle size={16} />
                    </div>
                    <span className="step-label text-red-600">Order Cancelled</span>
                </div>
            </div>
        );
    }

    return (
        <div className="order-timeline">
            <div className="timeline-line">
                <div
                    className="timeline-progress"
                    style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
                />
            </div>
            {steps.map((step, index) => {
                const isActive = index <= currentIdx;
                const isCurrent = index === currentIdx;

                return (
                    <div key={step.status} className={`timeline-step ${isActive ? 'step-completed' : ''} ${isCurrent ? 'step-active' : ''}`}>
                        <div className="step-icon">
                            {isActive ? <CheckCircle size={16} /> : step.icon}
                        </div>
                        <span className="step-label">{step.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showSuccess, setShowSuccess] = useState(false);
    // Removed alertState and setAlertState as they were only used for order cancellation

    useEffect(() => {
        if (location.state?.orderSuccess) {
            setShowSuccess(true);
            window.history.replaceState({}, document.title);
            const timer = setTimeout(() => setShowSuccess(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchOrders();
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
            } else {
                setError('Failed to fetch orders');
            }
        } catch (err) {
            console.error('Fetch orders error:', err);
            setError(err.message || 'An error occurred while fetching orders');
        } finally {
            setLoading(false);
        }
    };

    // Removed handleCancelOrder function

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
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-gray-500 font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="order-page">
            <div className="main-orderpage">
                {showSuccess && (
                    <div className="mb-8 bg-white border-l-4 border-green-500 shadow-sm p-6 rounded-r-xl flex items-center justify-between animate-fade-in">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-100 p-2 rounded-full">
                                <CheckCircle className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">Order Placed Successfully!</p>
                                <p className="text-sm text-gray-600">Thank you for your purchase. You can track your order status below.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSuccess(false)} className="text-gray-400 hover:text-gray-600">
                            <XCircle size={20} />
                        </button>
                    </div>
                )}

                <div className="order-header-section flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="order-title">My Orders</h1>
                        <p className="text-gray-500 mt-1">Check the status of your recent orders and manage them.</p>
                    </div>
                </div>

                <div className="order-controls mt-8">
                    <div className="search-container">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by Order ID or Product..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
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

                {filteredOrders.length === 0 ? (
                    <div className="empty-orders animate-fade-in">
                        <div className="empty-icon text-primary">
                            <ShoppingBag size={40} />
                        </div>
                        <h3 className="empty-title">No orders found</h3>
                        <p className="empty-text">
                            {searchQuery || filterStatus !== 'All'
                                ? "We couldn't find any orders matching your current search or filter."
                                : "You haven't placed any orders yet. Start shopping to see your orders here!"}
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => navigate('/allproducts')}
                                className="shop-button"
                            >
                                Start Shopping <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="px-6 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all inline-flex items-center gap-2"
                            >
                                <MessageCircle size={18} /> Contact Support
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            let items = [];
                            try {
                                items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                            } catch (e) {
                                items = [];
                            }

                            const isExpanded = expandedOrder === order.id;

                            return (
                                <div key={order.id} className="order-card animate-fade-in">
                                    <div
                                        className="order-card-header"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        <div className="order-id-group">
                                            <h3>Order #{order.id}</h3>
                                            <div className="order-date">
                                                <Calendar size={14} />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        <div className="status-group">
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="order-amount">
                                            <span className="amount-label">Total Amount</span>
                                            <span className="amount-value">{parseFloat(order.total).toFixed(2)} EGP</span>
                                        </div>

                                        <div className="header-actions flex items-center gap-4">
                                            {/* Removed Cancel button */}
                                            <div className={`p-2 rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    <OrderTimeline status={order.status} />

                                    <div className={`order-details-content ${isExpanded ? 'expanded' : ''}`}>
                                        <div className="details-inner">
                                            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <Package size={16} className="text-primary" />
                                                Order Items ({items.length})
                                            </h4>
                                            <div className="items-list">
                                                {items.map((item, index) => (
                                                    <div key={index} className="item-row">
                                                        <img
                                                            src={item.image}
                                                            alt={item.title}
                                                            className="item-image"
                                                            onError={(e) => {
                                                                e.target.src = PLACEHOLDER_IMAGE;
                                                            }}
                                                        />
                                                        <div className="item-info">
                                                            <h5 className="item-name">{item.title}</h5>
                                                            <div className="item-meta">
                                                                <span>Qty: <span className="font-bold text-gray-900">{item.quantity}</span></span>
                                                                <span>Price: <span className="font-bold text-gray-900">{parseFloat(item.price).toFixed(2)} EGP</span></span>
                                                            </div>
                                                        </div>
                                                        <div className="item-price">
                                                            {(item.price * item.quantity).toFixed(2)} EGP
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                                                    <div className="max-w-md">
                                                        <div className="flex items-center gap-2 font-bold mb-1 text-blue-900">
                                                            <AlertCircle size={18} className="text-blue-600" />
                                                            Need help with your order?
                                                        </div>
                                                        <p className="text-sm text-blue-700/80">
                                                            If you have any issues with this order, please contact our support team with your Order ID <span className="font-bold">#{order.id}</span>.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/contact', { state: { orderId: order.id } });
                                                        }}
                                                        className="whitespace-nowrap bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
                                                    >
                                                        <MessageCircle size={18} /> Contact Support
                                                    </button>
                                                </div>
                                                <div className="flex flex-col items-end min-w-[120px]">
                                                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Order Total</span>
                                                    <span className="text-2xl font-black text-primary">
                                                        {parseFloat(order.total).toFixed(2)} <span className="text-sm">EGP</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;

