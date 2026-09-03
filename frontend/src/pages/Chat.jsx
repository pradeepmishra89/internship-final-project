import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar.jsx";

function Chat() {
    // =====================================================
    // STATES
    // =====================================================

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState(() => {
        try {
            const saved = sessionStorage.getItem("chatMessages");
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error("Unable to load chat messages:", error);
            return [];
        }
    });

    const [loading, setLoading] = useState(false);
    const [attachment, setAttachment] = useState(null);

    // Attachment menu
    const [showAttachMenu, setShowAttachMenu] = useState(false);

    // =====================================================
    // REFS
    // =====================================================

    const imageInputRef = useRef(null);
    const pdfInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // =====================================================
    // BACKEND
    // =====================================================

    const API_URL =
        "https://internship-final-project-production.up.railway.app/api/chat";

    // =====================================================
    // FILE LIMIT
    // =====================================================

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // =====================================================
    // SAVE CHAT
    // =====================================================

    useEffect(() => {
        try {
            sessionStorage.setItem(
                "chatMessages",
                JSON.stringify(messages)
            );
        } catch (error) {
            console.error("Unable to save chat:", error);
        }
    }, [messages]);

    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    // =====================================================
    // OPEN ATTACHMENT MENU
    // =====================================================

    const toggleAttachMenu = () => {
        if (loading) return;

        setShowAttachMenu((prev) => !prev);
    };

    // =====================================================
    // OPEN IMAGE PICKER
    // =====================================================

    const openImagePicker = () => {
        if (loading) return;

        setShowAttachMenu(false);

        setTimeout(() => {
            imageInputRef.current?.click();
        }, 0);
    };

    // =====================================================
    // OPEN PDF PICKER
    // =====================================================

    const openPdfPicker = () => {
        if (loading) return;

        setShowAttachMenu(false);

        setTimeout(() => {
            pdfInputRef.current?.click();
        }, 0);
    };

    // =====================================================
    // HANDLE FILE SELECT
    // =====================================================

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const isImage = file.type.startsWith("image/");
        const isPdf = file.type === "application/pdf";

        if (!isImage && !isPdf) {
            alert("Only images and PDF files are supported.");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert("File size must be less than 10 MB.");
            e.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result !== "string" || !result) {
                alert("Unable to read the selected file.");
                return;
            }

            setAttachment({
                type: isImage ? "image" : "pdf",
                data: result,
                name: file.name,
                mimeType: file.type,
                size: file.size
            });
        };

        reader.onerror = () => {
            alert("Unable to read the selected file.");
        };

        reader.readAsDataURL(file);
    };

    // =====================================================
    // REMOVE ATTACHMENT
    // =====================================================

    const removeAttachment = () => {
        setAttachment(null);

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }

        if (pdfInputRef.current) {
            pdfInputRef.current.value = "";
        }
    };

    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const sendMessage = async () => {
        if (!message.trim() && !attachment) return;

        if (loading) return;

        const userMessage = message.trim();
        const currentAttachment = attachment;

        // -------------------------------------------------
        // SHOW USER MESSAGE
        // -------------------------------------------------

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                content: userMessage,
                attachment: currentAttachment
                    ? {
                          type: currentAttachment.type,
                          name: currentAttachment.name
                      }
                    : null
            }
        ]);

        // -------------------------------------------------
        // CLEAR INPUT
        // -------------------------------------------------

        setMessage("");
        setAttachment(null);
        setShowAttachMenu(false);

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }

        if (pdfInputRef.current) {
            pdfInputRef.current.value = "";
        }

        setLoading(true);

        // =================================================
        // API REQUEST
        // =================================================

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Authentication token not found. Please login again."
                );
            }

            const requestBody = {
                message: userMessage,
                attachment: currentAttachment
                    ? {
                          type: currentAttachment.type,
                          data: currentAttachment.data,
                          name: currentAttachment.name,
                          mimeType: currentAttachment.mimeType,
                          size: currentAttachment.size
                      }
                    : null
            };

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            let data;

            try {
                data = await response.json();
            } catch (error) {
                throw new Error(
                    "Invalid response received from server."
                );
            }

            if (!response.ok) {
                throw new Error(
                    data?.message || "Chat request failed."
                );
            }

            const aiResponse = data?.data?.aiResponse;

            if (!aiResponse) {
                throw new Error(
                    "AI did not return a response."
                );
            }

            // -------------------------------------------------
            // SHOW AI RESPONSE
            // -------------------------------------------------

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: aiResponse
                }
            ]);
        } catch (error) {
            console.error("Chat Error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `❌ ${
                        error?.message ||
                        "Unable to get response from AI."
                    }`,
                    isError: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // ENTER KEY
    // =====================================================

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // =====================================================
    // CLEAR CHAT
    // =====================================================

    const clearChat = () => {
        if (loading) return;

        setMessages([]);
        sessionStorage.removeItem("chatMessages");
    };

    // =====================================================
    // FORMAT FILE SIZE
    // =====================================================

    const formatFileSize = (bytes) => {
        if (!bytes) return "";

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <>
            <Navbar />

            <main className="chat-page">
                <div className="chat-container">

                    {/* =================================================
                        CHAT HEADER
                    ================================================= */}

                    <header className="chat-header">

                        <div className="chat-brand">

                            <div className="chat-brand-icon">
                                ✦
                            </div>

                            <div>
                                <h1>Nexa AI Companion</h1>

                                <div className="chat-status">
                                    <span className="status-dot"></span>

                                    <span>
                                        Your intelligent companion
                                    </span>
                                </div>
                            </div>

                        </div>

                        {messages.length > 0 && (
                            <button
                                type="button"
                                className="clear-chat-btn"
                                onClick={clearChat}
                                disabled={loading}
                            >
                                <span>⌫</span>
                                <span>Clear chat</span>
                            </button>
                        )}

                    </header>

                    {/* =================================================
                        MESSAGES
                    ================================================= */}

                    <section className="messages">

                        {/* EMPTY STATE */}

                        {messages.length === 0 && (
                            <div className="empty-chat">

                                <div className="empty-icon">
                                    <div className="empty-icon-glow">
                                        ♥
                                    </div>
                                </div>

                                <span className="welcome-label">
                                    WELCOME TO NEXA
                                </span>

                                <h2>
                                    Your AI companion,
                                    <br />
                                    <span>
                                        always here for you.
                                    </span>
                                </h2>

                                <p>
                                    Ask questions, explore ideas,
                                    analyze documents, understand images,
                                    or simply have a conversation.
                                </p>

                                <div className="quick-actions">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMessage(
                                                "Explain Node.js in simple language"
                                            )
                                        }
                                    >
                                        <span>💡</span>
                                        Learn something
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMessage(
                                                "Help me prepare for a backend developer interview"
                                            )
                                        }
                                    >
                                        <span>🎯</span>
                                        Prepare for interview
                                    </button>

                                    <button
                                        type="button"
                                        onClick={toggleAttachMenu}
                                    >
                                        <span>📎</span>
                                        Analyze a file
                                    </button>

                                </div>

                                {/* EMPTY STATE ATTACH MENU */}

                                {showAttachMenu && (
                                    <div className="attachment-menu empty-attachment-menu">

                                        <button
                                            type="button"
                                            onClick={openImagePicker}
                                        >
                                            <span className="attachment-menu-icon">
                                                🖼️
                                            </span>

                                            <span>
                                                <strong>Image</strong>
                                                <small>
                                                    JPG, PNG, WEBP, GIF
                                                </small>
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={openPdfPicker}
                                        >
                                            <span className="attachment-menu-icon">
                                                📄
                                            </span>

                                            <span>
                                                <strong>PDF</strong>
                                                <small>
                                                    PDF document
                                                </small>
                                            </span>
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}

                        {/* CHAT MESSAGES */}

                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message-row ${msg.role}`}
                            >

                                {/* AI AVATAR */}

                                {msg.role === "assistant" && (
                                    <div className="message-avatar ai-avatar">
                                        ♥
                                    </div>
                                )}

                                <div
                                    className={`message ${
                                        msg.role
                                    } ${
                                        msg.isError
                                            ? "message-error"
                                            : ""
                                    }`}
                                >

                                    {msg.role === "assistant" && (
                                        <div className="message-label">
                                            Nexa AI Companion
                                        </div>
                                    )}

                                    <div className="message-content">
                                        {msg.content}
                                    </div>

                                    {/* ATTACHMENT */}

                                    {msg.attachment && (
                                        <div className="message-attachment">

                                            <div className="attachment-file-icon">
                                                {msg.attachment.type ===
                                                "image"
                                                    ? "🖼️"
                                                    : "📄"}
                                            </div>

                                            <div className="attachment-info">

                                                <span>
                                                    {
                                                        msg.attachment
                                                            .name
                                                    }
                                                </span>

                                                <small>
                                                    {
                                                        msg.attachment
                                                            .type
                                                    }
                                                </small>

                                            </div>

                                        </div>
                                    )}

                                </div>

                                {/* USER AVATAR */}

                                {msg.role === "user" && (
                                    <div className="message-avatar user-avatar">
                                        You
                                    </div>
                                )}

                            </div>
                        ))}

                        {/* LOADING */}

                        {loading && (
                            <div className="message-row assistant">

                                <div className="message-avatar ai-avatar">
                                    ♥
                                </div>

                                <div className="message assistant">

                                    <div className="message-label">
                                        Nexa AI Companion
                                    </div>

                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>

                                </div>

                            </div>
                        )}

                        <div ref={messagesEndRef}></div>

                    </section>

                    {/* =================================================
                        ATTACHMENT PREVIEW
                    ================================================= */}

                    {attachment && (
                        <div className="attachment-preview">

                            <div className="attachment-preview-left">

                                <div className="preview-icon">
                                    {attachment.type === "image"
                                        ? "🖼️"
                                        : "📄"}
                                </div>

                                <div className="preview-details">

                                    <strong>
                                        {attachment.name}
                                    </strong>

                                    <span>
                                        {attachment.type === "image"
                                            ? "Image"
                                            : "PDF"}{" "}
                                        •{" "}
                                        {formatFileSize(
                                            attachment.size
                                        )}
                                    </span>

                                </div>

                            </div>

                            <button
                                type="button"
                                className="remove-attachment"
                                onClick={removeAttachment}
                                disabled={loading}
                                aria-label="Remove attachment"
                            >
                                ×
                            </button>

                        </div>
                    )}

                    {/* =================================================
                        INPUT AREA
                    ================================================= */}

                    <div className="chat-input-wrapper">

                        <div className="chat-input">

                            {/* =================================================
                                HIDDEN IMAGE INPUT
                            ================================================= */}

                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                ref={imageInputRef}
                                onChange={handleFileSelect}
                                disabled={loading}
                                className="hidden-file-input"
                            />

                            {/* =================================================
                                HIDDEN PDF INPUT
                            ================================================= */}

                            <input
                                type="file"
                                accept="application/pdf"
                                ref={pdfInputRef}
                                onChange={handleFileSelect}
                                disabled={loading}
                                className="hidden-file-input"
                            />

                            {/* =================================================
                                ATTACHMENT BUTTON + MENU
                            ================================================= */}

                            <div className="attach-wrapper">

                                {/* ATTACHMENT MENU */}

                                {showAttachMenu && (
                                    <div className="attachment-menu">

                                        <button
                                            type="button"
                                            onClick={openImagePicker}
                                        >
                                            <span className="attachment-menu-icon">
                                                🖼️
                                            </span>

                                            <span>
                                                <strong>Image</strong>
                                                <small>
                                                    JPG, PNG, WEBP, GIF
                                                </small>
                                            </span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={openPdfPicker}
                                        >
                                            <span className="attachment-menu-icon">
                                                📄
                                            </span>

                                            <span>
                                                <strong>PDF</strong>
                                                <small>
                                                    PDF document
                                                </small>
                                            </span>
                                        </button>

                                    </div>
                                )}

                                {/* PLUS BUTTON */}

                                <button
                                    type="button"
                                    className={`attach-btn ${
                                        loading ? "disabled" : ""
                                    }`}
                                    onClick={toggleAttachMenu}
                                    disabled={loading}
                                    title="Attach file"
                                    aria-label="Attach file"
                                >
                                    <span>+</span>
                                </button>

                            </div>

                            {/* =================================================
                                TEXTAREA
                            ================================================= */}

                            <textarea
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    attachment
                                        ? "Ask something about this file..."
                                        : "Message your AI companion..."
                                }
                                rows="1"
                                disabled={loading}
                            />

                            {/* =================================================
                                SEND
                            ================================================= */}

                            <button
                                type="button"
                                className="send-btn"
                                onClick={sendMessage}
                                disabled={
                                    loading ||
                                    (!message.trim() &&
                                        !attachment)
                                }
                                aria-label="Send message"
                            >
                                {loading ? (
                                    <span className="send-loader">
                                        ...
                                    </span>
                                ) : (
                                    <span>↑</span>
                                )}
                            </button>

                        </div>

                        <div className="input-footer">

                            <span>
                                Your AI companion can make mistakes.
                                Verify important information.
                            </span>

                            <span className="input-hint">
                                Enter ↵ to send
                            </span>

                        </div>

                    </div>

                </div>
            </main>
        </>
    );
}

export default Chat;