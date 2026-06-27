import React from "react";
import { Link } from "react-router-dom";

const Profile = () => {
    const auth = localStorage.getItem("user");
    const user = auth ? JSON.parse(auth) : null;

    if (!user) {
        return <div style={{ textAlign: "center", padding: "40px" }}><h2>Please log in to view profile.</h2></div>;
    }

    const isSeller = user.role === 'seller';

    return (
        <div className="form-container" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "30px", borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
                <div style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary-hover)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.5rem",
                    fontWeight: "bold",
                    border: "2px solid var(--primary)"
                }}>
                    {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <div>
                    <h1 style={{ textAlign: "left", fontSize: "1.8rem", margin: 0 }}>{user.name}</h1>
                    <span style={{
                        display: "inline-block",
                        marginTop: "5px",
                        padding: "3px 12px",
                        borderRadius: "12px",
                        fontSize: "0.8rem",
                        fontWeight: "600",
                        color: isSeller ? "var(--primary-hover)" : "var(--success)",
                        background: isSeller ? "var(--primary-light)" : "#d1fae5",
                        textTransform: "uppercase"
                    }}>
                        {user.role}
                    </span>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Email Address</label>
                    <span style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: "500" }}>{user.email}</span>
                </div>

                {isSeller ? (
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Company Name</label>
                        <span style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: "500" }}>{user.company || "Not Provided"}</span>
                    </div>
                ) : (
                    <div>
                        <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Default Shipping Address</label>
                        <span style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: "500" }}>{user.address || "Not Provided"}</span>
                    </div>
                )}

                <div style={{
                    marginTop: "20px",
                    padding: "20px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--primary-light)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-around",
                    textAlign: "center"
                }}>
                    {isSeller ? (
                        <>
                            <div>
                                <strong style={{ fontSize: "1.4rem", color: "var(--primary-hover)", display: "block" }}>Seller Account</strong>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Catalog Management Ready</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <strong style={{ fontSize: "1.4rem", color: "var(--success)", display: "block" }}>Buyer Account</strong>
                                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Order Placement Ready</span>
                            </div>
                        </>
                    )}
                </div>

                <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
                    <Link to="/" className="appButton" style={{ textDecoration: "none", display: "inline-flex", justifyContent: "center", alignItems: "center", margin: 0, flex: 1 }}>
                        {isSeller ? "Manage Catalog" : "Shop Products"}
                    </Link>
                    <Link to="/orders" className="appButton" style={{ textDecoration: "none", display: "inline-flex", justifyContent: "center", alignItems: "center", margin: 0, flex: 1, background: "transparent", border: "1.5px solid var(--primary)", color: "var(--primary-hover)", boxShadow: "none" }}>
                        {isSeller ? "Incoming Orders" : "Order History"}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Profile;
