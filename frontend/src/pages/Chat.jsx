import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar.jsx";

function Chat() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState(() => {
        const saved = sessionStorage.getItem("chatMessages");
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        sessionStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        if (!isImage && !isPdf) {
            alert("Only images and PDF files are supported.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setAttachment({
                type: isImage ? "image" : "pdf",
                data: reader.result,
                name: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    const removeAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const sendMessage = async () => {

        if (!message.trim() && !attachment) {
            return;
        }

        const userMessage = message;
        const currentAttachment = attachment;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: currentAttachment
                    ? `${userMessage} ${currentAttachment.type === "image" ? "📷" : "📄"} ${currentAttachment.name}`
                    : userMessage
            }
        ]);

        setMessage("");
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setLoading(true);

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://internship-final-project-production.up.railway.app/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        message: userMessage,
                        attachment: currentAttachment
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Chat request failed"
                );
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        data.data?.aiResponse ||
                        "No response received"
                }
            ]);

        } catch (error) {

            console.error("Chat Error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Unable to get response from AI."
                }
            ]);

        } finally {

            setLoading(false);

        }
    };

    const handleKeyDown = (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            sendMessage();
        }
    };

    return (
        <>
            <Navbar />

            <main className="chat-page">

                <div className="chat-container">

                    <div className="chat-header">

                        <div>
                            <h2>🤖 AI Assistant</h2>

                            <span>
                                Groq AI
                            </span>
                        </div>

                    </div>

                    <div className="messages">

                        {messages.length === 0 && (

                            <div className="empty-chat">

                                <div className="big-icon">
                                    🤖
                                </div>

                                <h2>
                                    How can I help you?
                                </h2>

                                <p>
                                    Ask me anything, or attach an image/PDF.
                                </p>

                            </div>
                        )}

                        {messages.map(
                            (msg, index) => (

                                <div
                                    key={index}
                                    className={`message ${msg.role}`}
                                >

                                    <div className="message-content">
                                        {msg.content}
                                    </div>

                                </div>
                            )
                        )}

                        {loading && (

                            <div className="message assistant">

                                <div className="message-content">
                                    Thinking...
                                </div>

                            </div>
                        )}

                    </div>

                    {attachment && (
                        <div style={{
                            padding: "8px 16px",
                            background: "#eef2ff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "13px"
                        }}>
                            <span>
                                {attachment.type === "image" ? "📷" : "📄"} {attachment.name}
                            </span>
                            <button
                                onClick={removeAttachment}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "#4338ca",
                                    fontWeight: "600"
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    <div className="chat-input">

                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            style={{ display: "none" }}
                            id="fileAttach"
                        />

                        <label
                            htmlFor="fileAttach"
                            style={{
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                padding: "0 8px",
                                fontSize: "20px"
                            }}
                        >
                            📎
                        </label>

                        <textarea
                            value={message}
                            onChange={(e) =>
                                setMessage(e.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Message AI..."
                            rows="1"
                        />

                        <button
                            onClick={sendMessage}
                            disabled={loading}
                        >
                            {loading ? "..." : "➤"}
                        </button>

                    </div>

                </div>

            </main>
        </>
    );
}

export default Chat;