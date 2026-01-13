import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './Orders.css'

const Orders = () => {
    const [orders, setOrders] = useState([])

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const response = await axios.get('https://store-b-backend-production.up.railway.app/api/orders')
            setOrders(response.data)
        } catch (error) {
            console.error('Error fetching orders:', error)
        }
    }

    const updateOrderStatus = async (id, newStatus) => {
        try {
            await axios.put(`https://store-b-backend-production.up.railway.app/api/orders/${id}`, { status: newStatus })
            fetchOrders()
        } catch (error) {
            console.error('Error updating order:', error)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending':
                return '#f6ad55'
            case 'Shipped':
                return '#4299e1'
            case 'Delivered':
                return '#48bb78'
            default:
                return '#718096'
        }
    }

    return (
        <div className="orders-page">
            <div className="page-header">
                <h1>Orders Management</h1>
            </div>

            <div className="orders-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td>#{order.id}</td>
                                <td>{order.customerName}</td>
                                <td>${(Number(order.total) || 0).toFixed(2)}</td>
                                <td>
                                    <span
                                        className="status-badge"
                                        style={{ background: getStatusColor(order.status) }}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Orders
