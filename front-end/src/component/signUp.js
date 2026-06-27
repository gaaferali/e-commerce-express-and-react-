import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const SignUp = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("buyer");
    const [company, setCompany] = useState("");
    const [address, setAddress] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem("user");
        if (auth) {
            navigate('/');
        }
    }, [navigate]);

    const collectData = async () => {
        if (!name || !email || !password) {
            alert("Please fill in all standard fields");
            return;
        }
        if (role === 'seller' && !company) {
            alert("Please enter your company name");
            return;
        }
        if (role === 'buyer' && !address) {
            alert("Please enter your shipping address");
            return;
        }

        const payload = {
            name,
            email,
            password,
            role,
            company: role === 'seller' ? company : undefined,
            address: role === 'buyer' ? address : undefined
        };

        try {
            let result = await fetch('http://localhost:5000/register', {
                method: 'post',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            result = await result.json();
            if (result && result._id) {
                localStorage.setItem("user", JSON.stringify(result));
                navigate('/');
            } else {
                alert("Registration failed. Please check details.");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            alert("An error occurred during registration. Please try again.");
        }
    };

    return (
        <div className="form-container">
            <h1>Create Account</h1>
            <p className="form-subtitle">Join us to manage or browse the marketplace</p>
            
            <div className="form-group">
                <label className="form-label">I want to register as a:</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name="role" 
                            value="buyer" 
                            checked={role === "buyer"} 
                            onChange={() => setRole("buyer")} 
                        />
                        Buyer
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', cursor: 'pointer' }}>
                        <input 
                            type="radio" 
                            name="role" 
                            value="seller" 
                            checked={role === "seller"} 
                            onChange={() => setRole("seller")} 
                        />
                        Seller
                    </label>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                    className="inputBox" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                    className="inputBox" 
                    type="password" 
                    placeholder="Create a password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            {role === "seller" && (
                <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                        className="inputBox" 
                        type="text" 
                        placeholder="Enter your company name" 
                        value={company} 
                        onChange={(e) => setCompany(e.target.value)}
                    />
                </div>
            )}

            {role === "buyer" && (
                <div className="form-group">
                    <label className="form-label">Shipping Address</label>
                    <input 
                        className="inputBox" 
                        type="text" 
                        placeholder="Enter your shipping address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
            )}
            
            <button onClick={collectData} className="appButton" type="button">
                Sign Up
            </button>

            <div className="auth-switch">
                Already have an account? <Link to="/login">Login here</Link>
            </div>
        </div>
    );
};

export default SignUp;
