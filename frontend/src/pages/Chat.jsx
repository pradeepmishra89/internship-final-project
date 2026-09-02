import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar.jsx";

function Chat() {

    // =====================================================
    // STATES
    // =====================================================

    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState(() => {
        try {
            const saved =
                sessionStorage.getItem("chatMessages");

            return saved
                ? JSON.parse(saved)
                : [];

        } catch (error) {

            console.error(
                "Unable to load chat messages:",
                error
            );

            return [];
        }
    });

    const [loading, setLoading] =
        useState(false);

    const [attachment, setAttachment] =
        useState(null);

    const fileInputRef =
        useRef(null);


    // =====================================================
    // BACKEND URL
    // =====================================================

    const API_URL =
        "https://internship-final-project-production.up.railway.app/api/chat";


    // =====================================================
    // FILE SIZE LIMIT
    // =====================================================

    // 10 MB
    const MAX_FILE_SIZE =
        10 * 1024 * 1024;


    // =====================================================
    // SAVE CHAT IN SESSION STORAGE
    // =====================================================

    useEffect(() => {

        try {

            sessionStorage.setItem(
                "chatMessages",
                JSON.stringify(messages)
            );

        } catch (error) {

            console.error(
                "Unable to save chat:",
                error
            );

        }

    }, [messages]);


    // =====================================================
    // HANDLE FILE SELECT
    // =====================================================

    const handleFileSelect = (e) => {

        const file =
            e.target.files?.[0];

        if (!file) {
            return;
        }


        // -------------------------------------------------
        // CHECK FILE TYPE
        // -------------------------------------------------

        const isImage =
            file.type.startsWith("image/");

        const isPdf =
            file.type === "application/pdf";


        if (!isImage && !isPdf) {

            alert(
                "Only images and PDF files are supported."
            );

            e.target.value = "";

            return;
        }


        // -------------------------------------------------
        // CHECK FILE SIZE
        // -------------------------------------------------

        if (file.size > MAX_FILE_SIZE) {

            alert(
                "File size must be less than 10 MB."
            );

            e.target.value = "";

            return;
        }


        // -------------------------------------------------
        // READ FILE
        // -------------------------------------------------

        const reader =
            new FileReader();


        reader.onload = () => {

            const result =
                reader.result;


            if (
                typeof result !== "string" ||
                !result
            ) {

                alert(
                    "Unable to read the selected file."
                );

                return;
            }


            setAttachment({

                type:
                    isImage
                        ? "image"
                        : "pdf",

                data: result,

                name:
                    file.name,

                mimeType:
                    file.type,

                size:
                    file.size

            });

        };


        reader.onerror = () => {

            alert(
                "Unable to read the selected file."
            );

        };


        reader.readAsDataURL(file);
    };


    // =====================================================
    // REMOVE ATTACHMENT
    // =====================================================

    const removeAttachment = () => {

        setAttachment(null);

        if (fileInputRef.current) {

            fileInputRef.current.value =
                "";

        }
    };


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const sendMessage = async () => {

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (
            !message.trim() &&
            !attachment
        ) {
            return;
        }


        if (loading) {
            return;
        }


        // -------------------------------------------------
        // SAVE CURRENT VALUES
        // -------------------------------------------------

        const userMessage =
            message.trim();

        const currentAttachment =
            attachment;


        // -------------------------------------------------
        // SHOW USER MESSAGE
        // -------------------------------------------------

        setMessages((prev) => [

            ...prev,

            {
                role: "user",

                content:
                    currentAttachment
                        ? `${userMessage
                            ? userMessage + " "
                            : ""
                        }${
                            currentAttachment.type === "image"
                                ? "📷"
                                : "📄"
                        } ${
                            currentAttachment.name
                        }`

                        : userMessage
            }

        ]);


        // -------------------------------------------------
        // CLEAR INPUT
        // -------------------------------------------------

        setMessage("");

        setAttachment(null);


        if (fileInputRef.current) {

            fileInputRef.current.value =
                "";

        }


        setLoading(true);


        // =================================================
        // API REQUEST
        // =================================================

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                throw new Error(
                    "Authentication token not found. Please login again."
                );

            }


            // -------------------------------------------------
            // REQUEST BODY
            // -------------------------------------------------

            const requestBody = {

                message:
                    userMessage,

                attachment:
                    currentAttachment
                        ? {
                            type:
                                currentAttachment.type,

                            data:
                                currentAttachment.data,

                            name:
                                currentAttachment.name,

                            mimeType:
                                currentAttachment.mimeType,

                            size:
                                currentAttachment.size
                        }

                        : null

            };


            // -------------------------------------------------
            // SEND TO BACKEND
            // -------------------------------------------------

            const response =
                await fetch(
                    API_URL,
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(
                                requestBody
                            )

                    }
                );


            // =================================================
            // RESPONSE
            // =================================================

            let data;

            try {

                data =
                    await response.json();

            } catch (error) {

                throw new Error(
                    "Invalid response received from server."
                );

            }


            // -------------------------------------------------
            // API ERROR
            // -------------------------------------------------

            if (!response.ok) {

                throw new Error(

                    data?.message ||
                    "Chat request failed."

                );

            }


            // -------------------------------------------------
            // AI RESPONSE
            // -------------------------------------------------

            const aiResponse =
                data?.data?.aiResponse;


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

                    role:
                        "assistant",

                    content:
                        aiResponse

                }

            ]);


        } catch (error) {

            console.error(
                "Chat Error:",
                error
            );


            // -------------------------------------------------
            // SHOW ACTUAL ERROR
            // -------------------------------------------------

            setMessages((prev) => [

                ...prev,

                {

                    role:
                        "assistant",

                    content:
                        `❌ ${
                            error?.message ||
                            "Unable to get response from AI."
                        }`

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

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            sendMessage();

        }

    };


    // =====================================================
    // CLEAR CHAT
    // =====================================================

    const clearChat = () => {

        if (loading) {
            return;
        }


        setMessages([]);

        sessionStorage.removeItem(
            "chatMessages"
        );

    };


    // =====================================================
    // UI
    // =====================================================

    return (

        <>

            <Navbar />


            <main className="chat-page">

                <div className="chat-container">


                    {/* =====================================
                        HEADER
                    ====================================== */}

                    <div className="chat-header">

                        <div>

                            <h2>
                                🤖 AI Assistant
                            </h2>

                            <span>
                                Groq AI
                            </span>

                        </div>


                        {messages.length > 0 && (

                            <button
                                onClick={clearChat}
                                disabled={loading}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
                                    color: "#dc2626",
                                    fontWeight: "600"
                                }}
                            >
                                Clear Chat
                            </button>

                        )}

                    </div>


                    {/* =====================================
                        MESSAGES
                    ====================================== */}

                    <div className="messages">


                        {/* Empty Chat */}

                        {messages.length === 0 && (

                            <div className="empty-chat">

                                <div className="big-icon">
                                    🤖
                                </div>

                                <h2>
                                    How can I help you?
                                </h2>

                                <p>
                                    Ask me anything, or attach
                                    an image/PDF.
                                </p>

                            </div>

                        )}


                        {/* Messages */}

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


                        {/* Loading */}

                        {loading && (

                            <div className="message assistant">

                                <div className="message-content">

                                    Thinking...

                                </div>

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        ATTACHMENT PREVIEW
                    ====================================== */}

                    {attachment && (

                        <div
                            style={{
                                padding: "8px 16px",
                                background: "#eef2ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                fontSize: "13px"
                            }}
                        >

                            <span>

                                {attachment.type === "image"
                                    ? "📷"
                                    : "📄"
                                }

                                {" "}

                                {attachment.name}

                            </span>


                            <button
                                onClick={
                                    removeAttachment
                                }
                                disabled={loading}
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: loading
                                        ? "not-allowed"
                                        : "pointer",
                                    color: "#4338ca",
                                    fontWeight: "600"
                                }}
                            >

                                Remove

                            </button>

                        </div>

                    )}


                    {/* =====================================
                        CHAT INPUT
                    ====================================== */}

                    <div className="chat-input">


                        {/* File Input */}

                        <input

                            type="file"

                            accept="
                                image/jpeg,
                                image/png,
                                image/webp,
                                image/gif,
                                application/pdf
                            "

                            ref={
                                fileInputRef
                            }

                            onChange={
                                handleFileSelect
                            }

                            style={{
                                display: "none"
                            }}

                            id="fileAttach"

                            disabled={
                                loading
                            }

                        />


                        {/* Attachment Button */}

                        <label

                            htmlFor="fileAttach"

                            style={{
                                cursor:
                                    loading
                                        ? "not-allowed"
                                        : "pointer",

                                display:
                                    "flex",

                                alignItems:
                                    "center",

                                padding:
                                    "0 8px",

                                fontSize:
                                    "20px",

                                opacity:
                                    loading
                                        ? 0.5
                                        : 1
                            }}
                        >

                            📎

                        </label>


                        {/* Textarea */}

                        <textarea

                            value={
                                message
                            }

                            onChange={
                                (e) =>
                                    setMessage(
                                        e.target.value
                                    )
                            }

                            onKeyDown={
                                handleKeyDown
                            }

                            placeholder={
                                attachment
                                    ? "Ask something about this file..."
                                    : "Message AI..."
                            }

                            rows="1"

                            disabled={
                                loading
                            }

                        />


                        {/* Send Button */}

                        <button

                            onClick={
                                sendMessage
                            }

                            disabled={
                                loading ||
                                (
                                    !message.trim() &&
                                    !attachment
                                )
                            }

                        >

                            {loading
                                ? "..."
                                : "➤"
                            }

                        </button>

                    </div>

                </div>

            </main>

        </>

    );
}


export default Chat;