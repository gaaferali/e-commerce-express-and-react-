import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

const Messages = () => {
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);

    const auth = localStorage.getItem("user");
    const user = useMemo(() => auth ? JSON.parse(auth) : null, [auth]);
    const userId = user?._id;
    
    const messagesEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const fetchContacts = useCallback(async () => {
        if (!userId) return;
        try {
            let result = await fetch(`http://localhost:5000/messages/contacts/${userId}`);
            result = await result.json();
            if (Array.isArray(result)) {
                setContacts(result);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoadingContacts(false);
        }
    }, [userId]);

    const fetchChat = useCallback(async (contactId) => {
        if (!userId || !contactId) return;
        try {
            let result = await fetch(`http://localhost:5000/messages/chat/${userId}/${contactId}`);
            result = await result.json();
            if (Array.isArray(result)) {
                setMessages(result);
            }
        } catch (error) {
            console.error("Error fetching chat history:", error);
        } finally {
            setLoadingChat(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Setup polling for active chat conversation
    useEffect(() => {
        if (selectedContact) {
            setLoadingChat(true);
            fetchChat(selectedContact._id);

            // Poll every 4 seconds to check for incoming messages
            pollIntervalRef.current = setInterval(() => {
                fetchChat(selectedContact._id);
            }, 4000);
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [selectedContact, fetchChat]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedContact) return;

        try {
            let result = await fetch("http://localhost:5000/messages/send", {
                method: "post",
                body: JSON.stringify({
                    senderId: user._id,
                    receiverId: selectedContact._id,
                    content: newMessage
                }),
                headers: { "Content-Type": "application/json" }
            });
            result = await result.json();
            if (result) {
                setMessages(prev => [...prev, result]);
                setNewMessage("");
                // Refresh contacts list to update order
                fetchContacts();
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleSelectContact = (contact) => {
        setSelectedContact(contact);
        setMessages([]);
    };

    if (loadingContacts) {
        return <div style={{ textAlign: "center", padding: "40px" }}><h2>Loading Messages...</h2></div>;
    }

    return (
        <div className="product-List" style={{ maxWidth: "1000px", margin: "20px auto", padding: "0", overflow: "hidden" }}>
            <div style={{ display: "flex", height: "70vh", background: "#ffffff", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-color)" }}>
                
                {/* CONTACTS SIDEBAR */}
                <div style={{ width: "300px", borderRight: "1px solid var(--border-color)", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", background: "var(--primary-light)" }}>
                        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", fontFamily: "Outfit", color: "var(--text-primary)" }}>Conversations</h2>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {contacts.length > 0 ? (
                            contacts.map(c => {
                                const isSelected = selectedContact && selectedContact._id === c._id;
                                return (
                                    <div 
                                        key={c._id}
                                        onClick={() => handleSelectContact(c)}
                                        style={{
                                            padding: "15px 20px",
                                            borderBottom: "1px solid #f1f5f9",
                                            cursor: "pointer",
                                            backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                                            borderLeft: isSelected ? "4px solid var(--primary)" : "none",
                                            transition: "background var(--transition-fast)"
                                        }}
                                        className="contact-item"
                                    >
                                        <strong style={{ color: "var(--text-primary)", display: "block" }}>{c.name}</strong>
                                        <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: "600", color: "var(--text-muted)" }}>
                                            {c.role} {c.company ? `(${c.company})` : ""}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ padding: "30px 20px", textSet: "center", color: "var(--text-muted)", textAlign: "center" }}>
                                <p style={{ fontSize: "0.9rem" }}>No messages yet.</p>
                                <p style={{ fontSize: "0.8rem", marginTop: "5px" }}>Initiate chat by clicking 'Contact' on catalog cards or orders.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ACTIVE CHAT WINDOW */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc" }}>
                    {selectedContact ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: "15px 25px", borderBottom: "1px solid var(--border-color)", background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "var(--text-primary)", fontFamily: "Outfit" }}>{selectedContact.name}</h3>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "500" }}>
                                        {selectedContact.role} {selectedContact.company ? `| ${selectedContact.company}` : ""}
                                    </span>
                                </div>
                                <button 
                                    className="action-btn update" 
                                    style={{ padding: "6px 12px", fontSize: "0.8rem" }}
                                    onClick={() => fetchChat(selectedContact._id)}
                                >
                                    Refresh
                                </button>
                            </div>

                            {/* Chat Message Stream */}
                            <div style={{ flex: 1, overflowY: "auto", padding: "20px 25px", display: "flex", flexDirection: "column", gap: "12px" }}>
                                {loadingChat && messages.length === 0 ? (
                                    <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Loading messages...</div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isOwn = msg.senderId === user._id;
                                        return (
                                            <div 
                                                key={idx}
                                                style={{
                                                    alignSelf: isOwn ? "flex-end" : "flex-start",
                                                    maxWidth: "70%",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "4px"
                                                }}
                                            >
                                                {/* Optional Product context box */}
                                                {msg.productId && (
                                                    <div style={{
                                                        padding: "6px 10px",
                                                        background: "#ffffff",
                                                        border: "1px solid var(--border-color)",
                                                        borderRadius: "var(--radius-sm)",
                                                        fontSize: "0.75rem",
                                                        color: "var(--text-secondary)",
                                                        marginBottom: "-8px",
                                                        boxShadow: "var(--shadow-sm)"
                                                    }}>
                                                        📦 Context: <strong>{msg.productId.name}</strong> (${msg.productId.price})
                                                    </div>
                                                )}

                                                <div style={{
                                                    padding: "10px 16px",
                                                    borderRadius: "14px",
                                                    fontSize: "0.95rem",
                                                    lineHeight: "1.4",
                                                    wordBreak: "break-word",
                                                    backgroundColor: isOwn ? "var(--primary)" : "#ffffff",
                                                    color: isOwn ? "#ffffff" : "var(--text-primary)",
                                                    border: isOwn ? "none" : "1px solid var(--border-color)",
                                                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                                                    borderTopRightRadius: isOwn ? "2px" : "14px",
                                                    borderTopLeftRadius: isOwn ? "14px" : "2px"
                                                }}>
                                                    {msg.content}
                                                </div>
                                                <span style={{
                                                    fontSize: "0.7rem",
                                                    color: "var(--text-muted)",
                                                    alignSelf: isOwn ? "flex-end" : "flex-start",
                                                    margin: "0 4px"
                                                }}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input Field */}
                            <form onSubmit={handleSendMessage} style={{ padding: "20px", background: "#ffffff", borderTop: "1px solid var(--border-color)", display: "flex", gap: "10px" }}>
                                <input 
                                    className="inputBox"
                                    type="text"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{ margin: 0, flex: 1 }}
                                    required
                                />
                                <button 
                                    className="appButton"
                                    type="submit"
                                    style={{ margin: 0, width: "100px" }}
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", padding: "20px" }}>
                            <span style={{ fontSize: "3rem", marginBottom: "15px" }}>💬</span>
                            <h3>Select a contact to view conversation</h3>
                            <p style={{ fontSize: "0.9rem", marginTop: "5px" }}>Choose from the left sidebar to send and receive real-time updates.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Messages;
