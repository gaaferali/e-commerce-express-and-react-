import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Nav = () => {
    const auth = localStorage.getItem("user");
    const navigate = useNavigate();
    
    const logout = () => {
        localStorage.clear();
        navigate('/signUp');
    };

    const user = auth ? JSON.parse(auth) : null;
    const isSeller = user && user.role === 'seller';

    return (
        <header className="nav-header">
            <Link to="/" className="nav-left-group">
                <img 
                    className="logo" 
                    src="https://img.freepik.com/free-psd/3d-shopping-cart-icon-blue-circle-background-online-retail-symbol_84443-55705.jpg?semt=ais_hybrid&w=740&q=80"
                    alt="logo" 
                />
                <span className="nav-brand-name">E-Shop Admin</span>
            </Link>
            
            <nav>
                {auth ? (
                    <ul className="nav-ul">
                        {isSeller ? (
                            // Seller navigation tabs
                            <>
                                <li>
                                    <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
                                        Manage Catalog
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/add" className={({ isActive }) => isActive ? "active-link" : ""}>
                                        Add Product
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/orders" className={({ isActive }) => isActive ? "active-link" : ""}>
                                        Incoming Orders
                                    </NavLink>
                                </li>
                            </>
                        ) : (
                            // Buyer navigation tabs
                            <>
                                <li>
                                    <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
                                        Browse Products
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/cart" className={({ isActive }) => isActive ? "active-link" : ""}>
                                        Shopping Cart
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/orders" className={({ isActive }) => isActive ? "active-link" : ""}>
                                        My Orders
                                    </NavLink>
                                </li>
                            </>
                        )}
                        <li>
                            <NavLink to="/messages" className={({ isActive }) => isActive ? "active-link" : ""}>
                                Messages
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? "active-link" : ""}>
                                Profile
                            </NavLink>
                        </li>
                        <li>
                            <a href="/signUp" className="logout-btn" style={{ color: 'var(--danger)', fontWeight: '600' }} onClick={(e) => {
                                e.preventDefault();
                                logout();
                            }}>
                                Logout ({user.name})
                            </a>
                        </li>
                    </ul>
                ) : (
                    <ul className="nav-ul nav-right">
                        <li>
                            <NavLink to="/signUp" className={({ isActive }) => isActive ? "active-link" : ""}>
                                Sign Up
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/login" className={({ isActive }) => isActive ? "active-link" : ""}>
                                Login
                            </NavLink>
                        </li>
                    </ul>
                )}
            </nav>
        </header>
    );
};

export default Nav;
