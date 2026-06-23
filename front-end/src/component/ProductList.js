import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [searchKey, setSearchKey] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [inStockOnly, setInStockOnly] = useState(false);
    
    // Message modal state
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState("");
    const [selectedProductId, setSelectedProductId] = useState("");
    const [selectedProductName, setSelectedProductName] = useState("");
    const [messageText, setMessageText] = useState("");

    const auth = localStorage.getItem("user");
    const user = auth ? JSON.parse(auth) : null;
    const isSeller = user && user.role === 'seller';

    const getProducts = useCallback(async () => {
        try {
            const url = isSeller 
                ? `http://localhost:5000/products?userId=${user._id}`
                : "http://localhost:5000/products";
            let result = await fetch(url);
            result = await result.json();
            if (Array.isArray(result)) {
                setProducts(result);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
        }
    }, [isSeller, user?._id]);

    useEffect(() => {
        getProducts();
    }, [getProducts]);

    const getImageSrc = (url) => {
        if (!url) return null;
        if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
        return url;
    };

    const deleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                let result = await fetch(`http://localhost:5000/product/${id}`, {
                    method: "Delete",
                });
                result = await result.json();
                if (result) {
                    getProducts();
                }
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    const searchHandle = async (event) => {
        let key = event.target.value;
        setSearchKey(key);
        if (key) {
            try {
                const url = isSeller
                    ? `http://localhost:5000/search/${key}?userId=${user._id}`
                    : `http://localhost:5000/search/${key}`;
                let result = await fetch(url);
                result = await result.json();
                if (Array.isArray(result)) {
                    setProducts(result);
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Error searching products:", error);
            }
        } else {
            getProducts();
        }
    };

    const addToCart = async (productId) => {
        try {
            let result = await fetch("http://localhost:5000/cart/add", {
                method: "post",
                body: JSON.stringify({ buyerId: user._id, productId, quantity: 1 }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            result = await result.json();
            if (result) {
                alert("Product added to cart successfully!");
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Could not add product to cart.");
        }
    };

    const handleOpenContactModal = (product) => {
        setSelectedSellerId(product.userId);
        setSelectedProductId(product._id);
        setSelectedProductName(product.name);
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
                    receiverId: selectedSellerId,
                    productId: selectedProductId,
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

    // Filter logic for Buyer View
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const uniqueCompanies = [...new Set(products.map(p => p.company).filter(Boolean))];

    const filteredProducts = products.filter(product => {
        if (categoryFilter && product.category !== categoryFilter) return false;
        if (companyFilter && product.company !== companyFilter) return false;
        if (inStockOnly && (!product.stock_quantity || product.stock_quantity <= 0)) return false;
        return true;
    });

    return (
        <div className="product-List">
            {/* Header section */}
            <div className="product-List-header">
                <h1>{isSeller ? "Seller Inventory Catalog" : "Explore Marketplace"}</h1>
                <div className="header-actions">
                    <div className="search-container">
                        <span className="search-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </span>
                        <input 
                            className="search-product-box" 
                            type="text" 
                            placeholder="Search name, category, brand..." 
                            value={searchKey}
                            onChange={searchHandle} 
                        />
                    </div>
                    {isSeller && (
                        <Link to="/add" className="add-product-link-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add Product
                        </Link>
                    )}
                </div>
            </div>

            {/* Buyer Filters section */}
            {!isSeller && products.length > 0 && (
                <div style={{
                    display: 'flex',
                    gap: '15px',
                    marginBottom: '20px',
                    padding: '15px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Category</label>
                        <select 
                            value={categoryFilter} 
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                        >
                            <option value="">All Categories</option>
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Brand / Company</label>
                        <select 
                            value={companyFilter} 
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }}
                        >
                            <option value="">All Brands</option>
                            {uniqueCompanies.map(co => (
                                <option key={co} value={co}>{co}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '20px', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            id="stock-filter"
                            checked={inStockOnly} 
                            onChange={(e) => setInStockOnly(e.target.checked)} 
                        />
                        <label htmlFor="stock-filter" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>In Stock Only</label>
                    </div>
                </div>
            )}

            {/* SELLER VIEW - DATA TABLE */}
            {isSeller && (
                filteredProducts.length > 0 ? (
                    <div className="dashboard-table-container">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Price</th>
                                    <th>Category</th>
                                    <th>Company</th>
                                    <th>Stock Level</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ width: '64px', height: '48px', overflow: 'hidden', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.image_url ? (
                                                    <img src={getImageSrc(item.image_url)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <span style={{ fontSize: '1.2rem' }}>📦</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</td>
                                        <td>${item.price}</td>
                                        <td>
                                            <span style={{ 
                                                background: 'var(--primary-light)', 
                                                color: 'var(--primary-hover)', 
                                                padding: '4px 10px', 
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                fontWeight: '500'
                                            }}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td>{item.company || "N/A"}</td>
                                        <td style={{ fontWeight: '600', color: item.stock_quantity > 5 ? 'var(--success)' : 'var(--danger)' }}>
                                            {item.stock_quantity || 0} units
                                        </td>
                                        <td>
                                            <div className="table-actions">
                                                <Link to={"/update/" + item._id} className="action-btn update">
                                                    Update
                                                </Link>
                                                <button 
                                                    type="button" 
                                                    className="action-btn delete"
                                                    onClick={() => deleteProduct(item._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>No listings found</h3>
                        <p>{searchKey ? "Try searching for a different keyword" : "Start adding products to populate your inventory catalogue."}</p>
                    </div>
                )
            )}

            {/* BUYER VIEW - CARDS GRID */}
            {!isSeller && (
                filteredProducts.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '25px',
                        marginTop: '10px'
                    }}>
                        {filteredProducts.map((item) => {
                            const isOutOfStock = !item.stock_quantity || item.stock_quantity <= 0;
                            return (
                                <div key={item._id} style={{
                                    background: '#ffffff',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all var(--transition-normal)'
                                }} className="product-card">
                                    <div style={{ height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
                                        {item.image_url ? (
                                            <img src={getImageSrc(item.image_url)} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ fontSize: '3rem' }}>📦</span>
                                        )}
                                        <span style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                            color: '#ffffff',
                                            background: isOutOfStock ? 'var(--danger)' : 'var(--success)'
                                        }}>
                                            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                        </span>
                                    </div>
                                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary-hover)', fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                            {item.category}
                                        </div>
                                        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '700' }}>
                                            {item.name}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px', flex: 1, lineBreak: 'anywhere' }}>
                                            {item.description || "No description provided."}
                                        </p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '15px' }}>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Brand: <strong>{item.company || "Unknown"}</strong></span>
                                            <span style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                                                ${item.price}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button 
                                                className="appButton" 
                                                type="button" 
                                                disabled={isOutOfStock}
                                                style={{ flex: 2, margin: 0, opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
                                                onClick={() => addToCart(item._id)}
                                            >
                                                Add to Cart
                                            </button>
                                            <button 
                                                className="action-btn update"
                                                type="button"
                                                title="Contact Seller"
                                                style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--primary)' }}
                                                onClick={() => handleOpenContactModal(item)}
                                            >
                                                Contact
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛍️</div>
                        <h3>No products match criteria</h3>
                        <p>Try resetting filters or expanding search words.</p>
                    </div>
                )
            )}

            {/* CONTACT SELLER MODAL */}
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
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '10px', fontFamily: 'Outfit' }}>Contact Seller</h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '15px' }}>
                            Sending message regarding: <strong>{selectedProductName}</strong>
                        </p>
                        <div className="form-group">
                            <label className="form-label">Message Content</label>
                            <textarea 
                                className="inputBox" 
                                placeholder="Type your message to the seller here..."
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

export default ProductList;
