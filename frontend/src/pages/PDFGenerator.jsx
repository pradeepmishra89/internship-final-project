import { useState } from "react";

const PDFGenerator = () => {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const generatePDF = async () => {
        if (!prompt.trim()) {
            setError("Please enter a prompt");
            setSuccess("");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://internship-final-project-7v0x.onrender.com/api/pdf/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && {
                            Authorization: `Bearer ${token}`,
                        }),
                    },
                    body: JSON.stringify({
                        prompt: prompt.trim(),
                    }),
                }
            );

            if (!response.ok) {
                let errorMessage = "Failed to generate PDF";

                try {
                    const errorData = await response.json();

                    if (errorData?.message) {
                        errorMessage = errorData.message;
                    }
                } catch {
                    // Response JSON nahi hai
                }

                throw new Error(errorMessage);
            }

            // Backend se PDF Blob receive karo
            const blob = await response.blob();

            if (!blob || blob.size === 0) {
                throw new Error("Generated PDF is empty");
            }

            // Temporary download URL
            const url = window.URL.createObjectURL(blob);

            // Download link create karo
            const link = document.createElement("a");

            link.href = url;
            link.download = "AI-Generated-Document.pdf";

            document.body.appendChild(link);

            // Automatically download
            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);

            setPrompt("");
            setSuccess("PDF generated and downloaded successfully!");

        } catch (error) {
            console.error("PDF Generation Error:", error);

            setError(
                error?.message ||
                "Something went wrong while generating PDF"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                <h1 style={styles.heading}>
                    AI PDF Generator
                </h1>

                <p style={styles.subtitle}>
                    Enter your prompt and generate a professional PDF using AI.
                </p>

                <textarea
                    value={prompt}
                    onChange={(e) => {
                        setPrompt(e.target.value);

                        if (error) {
                            setError("");
                        }

                        if (success) {
                            setSuccess("");
                        }
                    }}
                    placeholder="Example: Create a professional resume for a Java Backend Developer with 2 years of experience..."
                    rows={8}
                    style={styles.textarea}
                    disabled={loading}
                />

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={styles.success}>
                        {success}
                    </div>
                )}

                <button
                    onClick={generatePDF}
                    disabled={loading}
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                        cursor: loading
                            ? "not-allowed"
                            : "pointer",
                    }}
                >
                    {loading
                        ? "Generating PDF..."
                        : "Generate PDF"}
                </button>

            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f7fb",
        padding: "20px",
        boxSizing: "border-box",
    },

    card: {
        width: "100%",
        maxWidth: "700px",
        background: "#ffffff",
        padding: "35px",
        borderRadius: "15px",
        boxShadow: "0 5px 25px rgba(0, 0, 0, 0.1)",
        boxSizing: "border-box",
    },

    heading: {
        margin: "0 0 10px",
        fontSize: "30px",
        textAlign: "center",
        color: "#222",
    },

    subtitle: {
        textAlign: "center",
        color: "#666",
        marginBottom: "25px",
        lineHeight: "1.5",
    },

    textarea: {
        width: "100%",
        padding: "15px",
        borderRadius: "10px",
        border: "1px solid #ccc",
        fontSize: "16px",
        resize: "vertical",
        outline: "none",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        lineHeight: "1.5",
    },

    button: {
        width: "100%",
        marginTop: "20px",
        padding: "14px",
        border: "none",
        borderRadius: "10px",
        background: "#2563eb",
        color: "#ffffff",
        fontSize: "17px",
        fontWeight: "600",
        transition: "0.2s",
    },

    error: {
        marginTop: "12px",
        padding: "10px 12px",
        borderRadius: "8px",
        background: "#fee2e2",
        color: "#b91c1c",
        fontSize: "14px",
    },

    success: {
        marginTop: "12px",
        padding: "10px 12px",
        borderRadius: "8px",
        background: "#dcfce7",
        color: "#15803d",
        fontSize: "14px",
    },
};

export default PDFGenerator;

