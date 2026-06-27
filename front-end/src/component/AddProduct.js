import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [company, setCompany] = useState("");
    const [description, setDescription] = useState("");
    const [stockQuantity, setStockQuantity] = useState("0");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddProduct = async () => {
        if (!name || !price || !category || !company) {
            setError(true);
            return false;
        }
        
        const userId = JSON.parse(localStorage.getItem("user"))._id;
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', Number(price));
            formData.append('category', category);
            formData.append('company', company);
            formData.append('userId', userId);
            formData.append('description', description);
            formData.append('stock_quantity', Number(stockQuantity));
            if (imageFile) {
                formData.append('image', imageFile);
            }

            let result = await fetch('http://localhost:5000/add-product', {
                method: 'post',
                body: formData
            });
            result = await result.json();
            if (result) {
                navigate('/');
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    return (
        <div className="form-container">
            <h1>Add New Product</h1>
            <p className="form-subtitle">Create a new item in your inventory catalogue</p>
            
            <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter product name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
                {error && !name && (
                    <span className="invalid-input">
                        ⚠️ Please enter a valid product name
                    </span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Price ($) *</label>
                <input 
                    className="inputBox" 
                    type="number" 
                    placeholder="Enter product price"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                />
                {error && !price && (
                    <span className="invalid-input">
                        ⚠️ Please enter a valid product price
                    </span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Category *</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter product category"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                />
                {error && !category && (
                    <span className="invalid-input">
                        ⚠️ Please enter a valid category
                    </span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Company/Brand *</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter product company"
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                />
                {error && !company && (
                    <span className="invalid-input">
                        ⚠️ Please enter a valid company name
                    </span>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input 
                    className="inputBox" 
                    type="number" 
                    placeholder="Enter stock levels"
                    value={stockQuantity} 
                    onChange={(e) => setStockQuantity(e.target.value)} 
                />
            </div>

            <div className="form-group">
                <label className="form-label">Product Image</label>
                <input 
                    className="inputBox" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ padding: '10px' }}
                />
                {imagePreview && (
                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                objectFit: 'cover', 
                                borderRadius: 'var(--radius-sm)', 
                                border: '2px solid var(--primary-light)',
                                boxShadow: 'var(--shadow-sm)'
                            }} 
                        />
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {imageFile?.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                    className="inputBox" 
                    placeholder="Enter product description details"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    style={{ minHeight: '80px', resize: 'vertical' }}
                />
            </div>

            <button className="appButton" type="button" onClick={handleAddProduct}>
                Add Product
            </button>
        </div>
    );
};

export default AddProduct;
