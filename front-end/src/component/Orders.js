import React, { useState, useEffect, useCallback, useMemo } from "react";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Messaging popup state
    const [showContactModal, setShowContactModal] = useState(false);
    const [recipientId, setRecipientId] = useState("");
    const [contextProductId, setContextProductId] = useState("");
    const [contextProductName, setContextProductName] = useState("");
    const [messageText, setMessageText] = useState("");

    const auth = localStorage.getItem("user");
    const user = useMemo(() => auth ? JSON.parse(auth) : null, [auth]);
    const isSeller = user && user.role === 'seller';
    const userId = user?._id;

    const fetchOrders = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const url = isSeller
                ? `http://localhost:5000/orders/seller/${userId}`
                : `http://localhost:5000/orders/buyer/${userId}`;
            let result = await fetch(url);
            result = await result.json();
            if (Array.isArray(result)) {
                setOrders(result);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    }, [userId, isSeller]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const updateStatus = async (orderId, newStatus) => {
        try {
            let result = await fetch(`http://localhost:5000/order/${orderId}/status`, {
                method: "put",
                body: JSON.stringify({ status: newStatus }),
                headers: { "Content-Type": "application/json" }
            });
            result = await result.json();
            if (result) {
                alert("Order status updated successfully!");
                fetchOrders();
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const handleOpenContactModal = (targetUserId, productObj) => {
        setRecipientId(targetUserId);
        if (productObj) {
            setContextProductId(productObj._id);
            setContextProductName(productObj.name);
        } else {
            setContextProductId("");
            setContextProductName("General Inquiry");
        }
        setMessageText("");
        setShowContactModal(true);
    };

    const handleSendMessage = async () => {
        if (!messageText.trim()) {
            alert("Please enter a message");
            return;
        }
        try {
            let result = await fetch("http://localhost:5000/messages/send", {
                method: "post",
                body: JSON.stringify({
                    senderId: user._id,
                    receiverId: recipientId,
                    productId: contextProductId || undefined,
                    content: messageText
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            result = await result.json();
            if (result) {
                alert("Message sent successfully!");
                setShowContactModal(false);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message.");
        }
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "40px" }}><h2>Loading Orders...</h2></div>;
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', text: '#d97706' };
            case 'shipped': return { bg: '#e0f2fe', text: '#0284c7' };
            case 'delivered': return { bg: '#d1fae5', text: '#059669' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <div className="product-List" style={{ maxWidth: "1050px", margin: "20px auto" }}>
            <h1 style={{ marginBottom: "20px", fontFamily: "Outfit", textAlign: "left" }}>
                {isSeller ? "Fulfillment Manager" : "Order History"}
            </h1>

            {orders.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    {orders.map((order) => {
                        const statusDetails = getStatusColor(order.status);
                        const orderDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        return (
                            <div key={order._id} style={{
                                background: '#ffffff',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-sm)',
                                overflow: 'hidden'
                            }}>
                                {/* Order header bar */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '15px 20px',
                                    background: 'var(--primary-light)',
                                    borderBottom: '1px solid var(--border-color)',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Order ID</span>
                                        <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--text-primary)' }}>{order._id}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Date Placed</span>
                                        <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{orderDate}</span>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: '600' }}>Total Amount</span>
                                        <span style={{ fontWeight: '700', color: 'var(--primary-hover)', fontSize: '1.1rem' }}>${order.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            backgroundColor: statusDetails.bg,
                                            color: statusDetails.text
                                        }}>
                                            {order.status.toUpperCase()}
                                        </span>

                                        {isSeller && (
                                            <select 
                                                value={order.status}
                                                onChange={(e) => updateStatus(order._id, e.target.value)}
                                                style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--border-color)',
                                                    outline: 'none',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                        )}
                                    </div>
                                </div>

                                {/* Order details body */}
                                <div style={{ padding: '20px' }}>
                                    {isSeller && order.buyerId && (
                                        <div style={{
                                            marginBottom: '15px',
                                            padding: '12px 15px',
                                            background: '#f8fafc',
                                            border: '1px dashed var(--border-color)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontSize: '0.9rem'
                                        }}>
                                            <strong style={{ color: 'var(--text-secondary)' }}>Buyer Details:</strong> {order.buyerId.name} ({order.buyerId.email})<br/>
                                            <strong style={{ color: 'var(--text-secondary)' }}>Shipping Address:</strong> {order.buyerId.address || "N/A"}
                                            <button 
                                                className="action-btn update"
                                                onClick={() => handleOpenContactModal(order.buyerId._id, null)}
                                                style={{ float: 'right', padding: '4px 10px', fontSize: '0.75rem', marginTop: '-18px' }}
                                            >
                                                Message Buyer
                                            </button>
                                        </div>
                                    )}

                                    {/* Items Table */}
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                                <th style={{ paddingBottom: '8px' }}>Product Details</th>
                                                <th style={{ paddingBottom: '8px' }}>Qty</th>
                                                <th style={{ paddingBottom: '8px' }}>Price</th>
                                                <th style={{ paddingBottom: '8px' }}>Subtotal</th>
                                                {!isSeller && <th style={{ paddingBottom: '8px', textAlign: 'right' }}>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item, idx) => {
                                                const product = item.productId || {};
                                                return (
                                                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '12px 0' }}>
                                                            <strong style={{ color: 'var(--text-primary)' }}>{product.name || "Deleted Product"}</strong>
                                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Brand: {product.company || "N/A"}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>x{item.quantity}</td>
                                                        <td style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>${item.priceAtTime}</td>
                                                        <td style={{ padding: '12px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                            ${(item.priceAtTime * item.quantity).toFixed(2)}
                                                        </td>
                                                        {!isSeller && (
                                                            <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                                {product.userId && (
                                                                    <button 
                                                                        className="action-btn update"
                                                                        onClick={() => handleOpenContactModal(product.userId, product)}
                                                                        style={{ fontSize: '0.75rem' }}
                                                                    >
                                                                        Contact Seller
                                                                    </button>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>No orders yet</h3>
                    <p>{isSeller ? "Buyers have not placed any orders for your products yet." : "You have not completed any purchases yet."}</p>
                </div>
            )}

            {/* SEND DIRECT MESSAGE DIALOG */}
            {showContactModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.45)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="form-container" style={{ width: '420px', margin: 0, background: '#ffffff', boxShadow: 'var(--shadow-lg)' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px', fontFamily: 'Outfit' }}>Direct Message</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Subject context: <strong>{contextProductName}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Message Content</label>
                            <textarea 
                                className="inputBox" 
                                placeholder="Type your message here..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                style={{ minHeight: '120px', resize: 'vertical', padding: '10px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button 
                                className="appButton" 
                                type="button" 
                                style={{ margin: 0, flex: 1 }}
                                onClick={handleSendMessage}
                            >
                                Send Message
                            </button>
                            <button 
                                className="action-btn delete" 
                                type="button" 
                                style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}
                                onClick={() => setShowContactModal(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;
