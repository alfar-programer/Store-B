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
import styles from './Orders.module.css';

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
    const stepSpan = 100 / steps.length; // 25% for each step
    const totalProgressSpan = 100 - stepSpan; // 75% total span between first and last step centers
    
    // Calculate progress width: 0% starting from first icon center, up to totalProgressSpan
    const progressWidth = currentIdx === -1 ? 0 : (currentIdx / (steps.length - 1)) * totalProgressSpan;

    return (
        <div className={`${styles.timelineContainer}`}>
            {isCancelled ? (
                <div className="flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">
                    <XCircle size={24} />
                    <div>
                        <h4 className="font-bold">Order Cancelled</h4>
                        <p className="text-sm text-red-500">This order has been cancelled and will not be processed.</p>
                    </div>
                </div>
            ) : (
                <div className={`${styles.orderTimeline}`}>
                    <div className={`${styles.timelineTrackBg}`}></div>
                    <div 
                        className={`${styles.timelineTrackProgress}`} 
                        style={{ width: `${progressWidth}%` }}
                    ></div>
                    {steps.map((step, index) => {
                        const isActive = index <= currentIdx;
                        return (
                            <div 
                                key={step.status} 
                                className={`${styles.timelineStep} ${isActive ? styles.active : ''} ${index < currentIdx ? styles.completed : ''}`}
                            >
                                <div className={`${styles.stepCircle}`}>
                                    {step.icon}
                                </div>
                                <span className={`${styles.stepLabel}`}>{step.label}</span>
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
            case 'pending': return styles.statusPending;
            case 'processing': return styles.statusProcessing;
            case 'shipped': return styles.statusShipped;
            case 'delivered': return styles.statusDelivered;
            case 'cancelled': return styles.statusCancelled;
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
        <div className={`${styles.orderPage}`}>
            <div className={`${styles.mainOrderpage}`}>
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

                <div className={`${styles.orderHeaderSection}`}>
                    <h1 className={`${styles.orderTitle}`}>My Orders</h1>
                    <p className={`${styles.orderSubtitle}`}>Track and manage your recent purchases</p>
                </div>

                <div className={`${styles.orderControls}`}>
                    <div className={`${styles.searchContainer}`}>
                        <input
                            type="text"
                            className={`${styles.searchInput}`}
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className={`${styles.searchIcon}`} size={20} />
                    </div>

                    <div className={`${styles.filterTabs}`}>
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

                <div className={`${styles.ordersListContainer}`}>
                    {filteredOrders.length === 0 ? (
                        <div className={`${styles.emptyStateCard} animate-fade-in`}>
                            <div className={`${styles.emptyStateIcon}`}>
                                <ShoppingBag size={48} />
                            </div>
                            <h3 className={`${styles.emptyStateTitle}`}>No orders found</h3>
                            <p className={`${styles.emptyStateText}`}>
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
                                    className={`${styles.shopNowBtn}`}
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <button onClick={() => navigate('/allproducts')} className={`${styles.shopNowBtn}`}>
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
                                <div key={order.id} className={`${styles.orderCard}`}>
                                    <div
                                        className={`${styles.orderCardHeader}`}
                                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                    >
                                        <div className={`${styles.orderIdGroup}`}>
                                            <span className={`${styles.orderIdLabel}`}>Order ID</span>
                                            <span className={`${styles.orderIdValue}`}>#{order.id}</span>
                                            <div className={`${styles.orderDate}`}>
                                                <Calendar size={14} />
                                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className={`${styles.orderTotalGroup}`}>
                                            <span className={`${styles.totalLabel}`}>Total Amount</span>
                                            <span className={`${styles.totalValue}`}>{parseFloat(order.total).toFixed(2)} <small>EGP</small></span>
                                        </div>

                                        <div className={`expand-icon ${isExpanded ? 'rotate-180' : ''}`} style={{ transition: 'transform 0.3s' }}>
                                            <ChevronDown size={24} />
                                        </div>
                                    </div>

                                    <div className={`order-details-wrapper ${isExpanded ? 'expanded' : ''}`}>
                                        <div className={`${styles.orderDetailsInner}`}>
                                            <OrderTimeline status={order.status} />

                                            <div className={`${styles.orderContentLayout}`}>
                                                <div className={`${styles.itemsSection}`}>
                                                    <h4><Package size={18} className="text-indigo-600" /> Items in Order</h4>
                                                    <div className="items-list">
                                                        {items.map((item, index) => (
                                                            <div key={index} className={`${styles.orderItemRow}`}>
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.title}
                                                                    className={`${styles.itemImg}`}
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                                <div className={`${styles.itemDetailsBlock}`}>
                                                                    <h5 className={`${styles.itemTitle}`}>{item.title}</h5>
                                                                    <div className={`${styles.itemSpecs}`}>
                                                                        <span>Qty: {item.quantity}</span>
                                                                        <span className="w-px h-4 bg-gray-300"></span>
                                                                        <span className={`${styles.itemPriceTag}`}>{parseFloat(item.price).toFixed(2)} EGP</span>
                                                                    </div>
                                                                </div>
                                                                <div className="font-bold text-gray-900 self-center">
                                                                    {(item.price * item.quantity).toFixed(2)} EGP
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className={`${styles.summarySection}`}>
                                                    <div className={`${styles.orderActionsCard}`}>
                                                        <div className={`${styles.needHelp}`}>
                                                            <div className={`${styles.helpTitle}`}>
                                                                <AlertCircle size={18} /> Need Help?
                                                            </div>
                                                            <p className={`${styles.helpText}`}>
                                                                Having trouble with this order? Contact our support team for assistance.
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate('/contact', { state: { orderId: order.id } });
                                                            }}
                                                            className={`${styles.supportBtn}`}
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

