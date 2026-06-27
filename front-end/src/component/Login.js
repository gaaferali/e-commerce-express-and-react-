import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const auth = localStorage.getItem("user");
        if (auth) {
            navigate('/');
        }
    }, [navigate]);

    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }
        let result = await fetch('http://localhost:5000/login', {
            method: 'post',
            body: JSON.stringify({ email, password }),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        result = await result.json();
        if (result.name) {
            localStorage.setItem("user", JSON.stringify(result));
            navigate('/');
        } else {
            alert("Please enter correct details");
        }
    };

    return (
        <div className="form-container">
            <h1>Welcome Back</h1>
            <p className="form-subtitle">Log in to manage your store dashboard</p>
            
            <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                    className="inputBox" 
                    type="text" 
                    placeholder="Enter email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                    className="inputBox" 
                    type="password" 
                    placeholder="Enter password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            
            <button className="appButton" type="button" onClick={handleLogin}>
                Login
            </button>

            <div className="auth-switch">
                Don't have an account? <Link to="/signUp">Register here</Link>
            </div>
        </div>
    );
};

export default Login;