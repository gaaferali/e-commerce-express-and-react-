import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

const UpdateComponent = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [company, setCompany] = useState("");
    const [description, setDescription] = useState("");
    const [stockQuantity, setStockQuantity] = useState("0");
    const [currentImageUrl, setCurrentImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const params = useParams();
    const navigate = useNavigate();

    const getProductDetails = useCallback(async () => {
        try {
            let result = await fetch(`http://localhost:5000/product/${params.id}`);
            result = await result.json();
            setName(result.name);
            setPrice(result.price);
            setCategory(result.category);
            setCompany(result.company);
            setDescription(result.description || "");
            setStockQuantity(result.stock_quantity || "0");
            setCurrentImageUrl(result.image_url || "");
        } catch (error) {
            console.error("Error fetching product details:", error);
        }
    }, [params.id]);

    useEffect(() => {
        getProductDetails();
    }, [getProductDetails]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const getImageSrc = (url) => {
        if (!url) return null;
        if (url.startsWith('/uploads/')) return `http://localhost:5000${url}`;
        return url;
    };

    const updateProduct = async () => {
        if (!name || !price || !category || !company) {
            alert("Please fill in all fields");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('price', Number(price));
            formData.append('category', category);
            formData.append('company', company);
            formData.append('description', description);
            formData.append('stock_quantity', Number(stockQuantity));
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await fetch(`http://localhost:5000/product/${params.id}`, {
                method: 'put',
                body: formData
            });
            navigate('/');
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const displayImage = imagePreview || getImageSrc(currentImageUrl);

    return (
        <div className="form-container">
            <h1>Update Product</h1>
            <p className="form-subtitle">Modify details for the selected catalogue item</p>
            
            <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter product name"
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
            </div>

            <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input 
                    className="inputBox" 
                    type="number" 
                    placeholder="Enter product price"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                />
            </div>

            <div className="form-group">
                <label className="form-label">Category</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter product category"
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                />
            </div>

            <div className="form-group">
                <label className="form-label">Company/Brand</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter product company"
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                />
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
                {displayImage && (
                    <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                            src={displayImage} 
                            alt="Current" 
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
                            {imageFile ? `New: ${imageFile.name}` : 'Current image'}
                        </span>
                    </div>
                )}
                <input 
                    className="inputBox" 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ padding: '10px' }}
                />
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

            <button className="appButton" type="button" onClick={updateProduct}>
                Update Product
            </button>
        </div>
    );
};

export default UpdateComponent;
