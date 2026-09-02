import { useState } from "react";
import Navbar from "../components/navbar.jsx";

function Chat() {

    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {

        if (!message.trim()) {
            return;
        }

        const userMessage = message;

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMessage
            }
        ]);

        setMessage("");
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
                        message: userMessage
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
                                    Ask me anything.
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

                    <div className="chat-input">

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