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

            link.click();

            // Cleanup
            link.remove();
            window.URL.revokeObjectURL(url);

            setPrompt("");
            setSuccess(
                "Your PDF has been generated and downloaded successfully."
            );

        } catch (error) {
            console.error("PDF Generation Error:", error);

            setError(
                error?.message ||
                "Something went wrong while generating the PDF."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="pdf-page">

            <div className="pdf-container">

                {/* =========================================
                    HEADER
                ========================================== */}

                <div className="pdf-header">

                    <div className="pdf-icon">
                        <span>✦</span>
                    </div>

                    <div>
                        <span className="pdf-label">
                            NEXA AI
                        </span>

                        <h1>
                            AI PDF Generator
                        </h1>

                        <p>
                            Turn your ideas into beautifully structured
                            documents with the power of AI.
                        </p>
                    </div>

                </div>


                {/* =========================================
                    MAIN CARD
                ========================================== */}

                <div className="pdf-card">

                    <div className="pdf-card-header">

                        <div>
                            <span className="pdf-section-label">
                                CREATE DOCUMENT
                            </span>

                            <h2>
                                What would you like to create?
                            </h2>
                        </div>

                        <div className="pdf-file-badge">
                            <span>PDF</span>
                        </div>

                    </div>


                    {/* =====================================
                        PROMPT
                    ====================================== */}

                    <div className="pdf-form-group">

                        <label htmlFor="pdf-prompt">
                            Describe your document
                        </label>

                        <textarea
                            id="pdf-prompt"
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
                            rows={9}
                            disabled={loading}
                        />

                        <div className="pdf-input-footer">

                            <span>
                                ✦ AI-powered document generation
                            </span>

                            <span>
                                {prompt.length} characters
                            </span>

                        </div>

                    </div>


                    {/* =====================================
                        ERROR
                    ====================================== */}

                    {error && (
                        <div className="pdf-message pdf-error">

                            <div className="message-status-icon">
                                !
                            </div>

                            <div>
                                <strong>
                                    Generation failed
                                </strong>

                                <p>
                                    {error}
                                </p>
                            </div>

                        </div>
                    )}


                    {/* =====================================
                        SUCCESS
                    ====================================== */}

                    {success && (
                        <div className="pdf-message pdf-success">

                            <div className="message-status-icon">
                                ✓
                            </div>

                            <div>
                                <strong>
                                    PDF ready
                                </strong>

                                <p>
                                    {success}
                                </p>
                            </div>

                        </div>
                    )}


                    {/* =====================================
                        GENERATE BUTTON
                    ====================================== */}

                    <button
                        type="button"
                        onClick={generatePDF}
                        disabled={loading}
                        className="pdf-generate-btn"
                    >

                        {loading ? (
                            <>
                                <span className="pdf-spinner"></span>

                                <span>
                                    Creating your PDF...
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="pdf-btn-icon">
                                    ↓
                                </span>

                                <span>
                                    Generate PDF
                                </span>

                                <span className="pdf-btn-arrow">
                                    →
                                </span>
                            </>
                        )}

                    </button>


                    {/* =====================================
                        FEATURES
                    ====================================== */}

                    <div className="pdf-features">

                        <div className="pdf-feature">

                            <span className="pdf-feature-icon">
                                ✦
                            </span>

                            <div>
                                <strong>
                                    AI structured
                                </strong>

                                <small>
                                    Clean and organized content
                                </small>
                            </div>

                        </div>


                        <div className="pdf-feature">

                            <span className="pdf-feature-icon">
                                ◈
                            </span>

                            <div>
                                <strong>
                                    Instant generation
                                </strong>

                                <small>
                                    Your document is ready in seconds
                                </small>
                            </div>

                        </div>


                        <div className="pdf-feature">

                            <span className="pdf-feature-icon">
                                ↓
                            </span>

                            <div>
                                <strong>
                                    Easy download
                                </strong>

                                <small>
                                    Download directly as PDF
                                </small>
                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================================
                    EXAMPLES
                ========================================== */}

                <div className="pdf-examples">

                    <span className="pdf-examples-label">
                        NEED INSPIRATION?
                    </span>

                    <div className="pdf-example-list">

                        <button
                            type="button"
                            onClick={() =>
                                setPrompt(
                                    "Create a professional resume for a Java Backend Developer with 2 years of experience."
                                )
                            }
                        >
                            Professional Resume
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setPrompt(
                                    "Create a detailed project report for a full-stack web application."
                                )
                            }
                        >
                            Project Report
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setPrompt(
                                    "Create a professional business proposal for a software development company."
                                )
                            }
                        >
                            Business Proposal
                        </button>

                    </div>

                </div>

            </div>

        </main>
    );
};

export default PDFGenerator;