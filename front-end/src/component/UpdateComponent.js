import React, { useEffect } from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const UpdateComponent = () => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [company, setCompany] = useState("");
    const params = useParams();
    const navigatore = useNavigate();
    useEffect(() => {
        getProductDetails();
    }, [])
    const getProductDetails = async () => {
        let result = await fetch(`http://localhost:5000/product/${params.id}`);
        result = await result.json();
        setName(result.name);
        setPrice(result.price);
        setCategory(result.category);
        setCompany(result.company);
    }


    const updateProduct = async () => {
        const userId = JSON.parse(localStorage.getItem("user"))._id;
        let result = await fetch(`http://localhost:5000/product/${params.id}`, {
            method: 'put',
            body: JSON.stringify({ name, price, category, company }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        result = await result.json();
        console.warn(result);
        navigatore('/');

    }
    return (
        <div className="product">
            <h1>Update Product</h1>
            <input className="inputBox" type="text" placeholder="Enter product name"
                value={name} onChange={(e) => setName(e.target.value)} />
            
            <input className="inputBox" type="text" placeholder="Enter product price"
                value={price} onChange={(e) => setPrice(e.target.value)} />

            <input className="inputBox" type="text" placeholder="Enter product category"
                value={category} onChange={(e) => setCategory(e.target.value)} />

            <input className="inputBox" type="text" placeholder="Enter product company"
                value={company} onChange={(e) => setCompany(e.target.value)} />

            <button className="appButton" type="button"
                onClick={updateProduct}>Update Product</button>
        </div>
    )
}
export default UpdateComponent;