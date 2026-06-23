import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    
    // Checkout details
    const [cardName, setCardName] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCVV, setCardCVV] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");

    const navigate = useNavigate();
    const auth = localStorage.getItem("user");
    const user = useMemo(() => auth ? JSON.parse(auth) : null, [auth]);
    const userId = user?._id;
    const userAddress = user?.address;

    const getImageSrc = (url) => {
        if (!url) return null;
        if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
        return url;
    };

    const fetchCart = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            let result = await fetch(`http://localhost:5000/cart/${userId}`);
            result = await result.json();
            if (result && result.items) {
                setCart(result);
            }
        } catch (error) {
            console.error("Error fetching cart:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchCart();
        if (userAddress) {
            setShippingAddress(userAddress);
        }
    }, [fetchCart, userAddress]);

    const updateQuantity = async (productId, currentQty, amount) => {
        const newQty = currentQty + amount;
        if (newQty <= 0) {
            removeItem(productId);
            return;
        }
        try {
            let result = await fetch("http://localhost:5000/cart/update", {
                method: "put",
                body: JSON.stringify({ buyerId: user._id, productId, quantity: newQty }),
                headers: { "Content-Type": "application/json" }
            });
            result = await result.json();
            if (result) {
                fetchCart();
            }
        } catch (error) {
            console.error("Error updating cart quantity:", error);
        }
    };

    const removeItem = async (productId) => {
        try {
            let result = await fetch(`http://localhost:5000/cart/remove/${user._id}/${productId}`, {
                method: "delete"
            });
            result = await result.json();
            if (result) {
                fetchCart();
            }
        } catch (error) {
            console.error("Error removing item from cart:", error);
        }
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!cardName || !cardNumber || !cardExpiry || !cardCVV || !shippingAddress) {
            alert("Please fill in all checkout fields");
            return;
        }

        try {
            let result = await fetch("http://localhost:5000/order/checkout", {
                method: "post",
                body: JSON.stringify({ buyerId: user._id }),
                headers: { "Content-Type": "application/json" }
            });
            
            const responseData = await result.json();
            
            if (result.ok) {
                alert("Payment authorized! Order placed successfully.");
                setShowCheckoutModal(false);
                navigate('/orders');
            } else {
                alert(responseData.error || "Checkout failed. Please check stock levels.");
            }
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("A checkout error occurred. Please try again.");
        }
    };

    if (loading) {
        return <div style={{ textAlign: "center", padding: "40px" }}><h2>Loading Cart...</h2></div>;
    }

    const items = cart ? cart.items.filter(item => item.productId) : [];
    const totalAmount = items.reduce((acc, item) => acc + (item.productId.price * item.quantity), 0);

    return (
        <div className="product-List" style={{ maxWidth: "900px", margin: "20px auto" }}>
            <h1 style={{ marginBottom: "20px", fontFamily: "Outfit", textAlign: "left" }}>Your Shopping Cart</h1>

            {items.length > 0 ? (
                <>
                    <div className="dashboard-table-container">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => (
                                    <tr key={item.productId._id}>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                                <div style={{ width: "50px", height: "50px", background: "#f1f5f9", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                                                    {item.productId.image_url ? (
                                                        <img src={getImageSrc(item.productId.image_url)} alt={item.productId.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                    ) : (
                                                        <span>📦</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <span style={{ fontWeight: "600", display: "block", color: "var(--text-primary)" }}>{item.productId.name}</span>
                                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Brand: {item.productId.company}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>${item.productId.price}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <button 
                                                    className="action-btn update" 
                                                    style={{ padding: "4px 8px", minWidth: "24px" }}
                                                    onClick={() => updateQuantity(item.productId._id, item.quantity, -1)}
                                                >
                                                    -
                                                </button>
                                                <span style={{ fontWeight: "600", minWidth: "20px", textAlign: "center" }}>{item.quantity}</span>
                                                <button 
                                                    className="action-btn update" 
                                                    style={{ padding: "4px 8px", minWidth: "24px" }}
                                                    onClick={() => updateQuantity(item.productId._id, item.quantity, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: "700", color: "var(--text-primary)" }}>
                                            ${(item.productId.price * item.quantity).toFixed(2)}
                                        </td>
                                        <td>
                                            <button 
                                                className="action-btn delete"
                                                onClick={() => removeItem(item.productId._id)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: "25px"
                    }}>
                        <div style={{
                            width: "320px",
                            background: "#ffffff",
                            padding: "20px",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border-color)",
                            boxShadow: "var(--shadow-sm)"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Total quantity</span>
                                <span style={{ fontWeight: "600" }}>{items.reduce((acc, i) => acc + i.quantity, 0)} units</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginBottom: "20px" }}>
                                <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)" }}>Total Amount</span>
                                <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--primary-hover)" }}>${totalAmount.toFixed(2)}</span>
                            </div>
                            <button 
                                className="appButton" 
                                style={{ margin: 0, width: "100%" }}
                                onClick={() => setShowCheckoutModal(true)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <div className="empty-state-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Go to the <Link to="/">Marketplace</Link> to discover products and add them to your cart.</p>
                </div>
            )}

            {/* CHECKOUT MODAL */}
            {showCheckoutModal && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "rgba(15, 23, 42, 0.45)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div className="form-container" style={{ width: "450px", margin: 0, background: "#ffffff", overflowY: "auto", maxHeight: "90vh" }}>
                        <h1>Secure Checkout</h1>
                        <p className="form-subtitle">Authorize credit card transaction of <strong>${totalAmount.toFixed(2)}</strong></p>
                        
                        <form onSubmit={handleCheckout}>
                            <div className="form-group">
                                <label className="form-label">Shipping Address *</label>
                                <input 
                                    className="inputBox" 
                                    type="text" 
                                    placeholder="Enter full shipping address"
                                    value={shippingAddress} 
                                    onChange={(e) => setShippingAddress(e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Name on Card *</label>
                                <input 
                                    className="inputBox" 
                                    type="text" 
                                    placeholder="John Doe"
                                    value={cardName} 
                                    onChange={(e) => setCardName(e.target.value)} 
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Card Number *</label>
                                <input 
                                    className="inputBox" 
                                    type="text" 
                                    placeholder="1111-2222-3333-4444"
                                    maxLength="19"
                                    value={cardNumber} 
                                    onChange={(e) => setCardNumber(e.target.value)} 
                                    required
                                />
                            </div>

                            <div style={{ display: "flex", gap: "15px" }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Expiry *</label>
                                    <input 
                                        className="inputBox" 
                                        type="text" 
                                        placeholder="MM/YY"
                                        maxLength="5"
                                        value={cardExpiry} 
                                        onChange={(e) => setCardExpiry(e.target.value)} 
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">CVV *</label>
                                    <input 
                                        className="inputBox" 
                                        type="password" 
                                        placeholder="123"
                                        maxLength="3"
                                        value={cardCVV} 
                                        onChange={(e) => setCardCVV(e.target.value)} 
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                                <button 
                                    className="appButton" 
                                    type="submit" 
                                    style={{ margin: 0, flex: 1 }}
                                >
                                    Authorize Payment
                                </button>
                                <button 
                                    className="action-btn delete" 
                                    type="button" 
                                    style={{ flex: 1, borderRadius: "var(--radius-sm)" }}
                                    onClick={() => setShowCheckoutModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
