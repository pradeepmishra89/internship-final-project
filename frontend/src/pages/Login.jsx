import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // =====================================================
    // BACKEND URL
    // =====================================================

    const API_URL = import.meta.env.VITE_API_URL;

    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const responseText = await response.text();

            let data;

            try {
                data = JSON.parse(responseText);
            } catch (jsonError) {
                console.error(
                    "Server returned non-JSON response:",
                    responseText
                );

                throw new Error(
                    `Server returned invalid response. Status: ${response.status}`
                );
            }

            console.log("Login Response:", data);

            if (!response.ok) {
                setError(
                    data.message ||
                    data.error ||
                    "Email or password is incorrect."
                );

                return;
            }

            if (!data.token) {
                setError(
                    "Token was not received from server."
                );

                return;
            }

            // Save JWT
            localStorage.setItem(
                "token",
                data.token
            );

            // Login successful
            navigate("/");

        } catch (error) {
            console.error(
                "LOGIN ERROR:",
                error
            );

            setError(
                error.message ||
                "Unable to connect to the server."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <main className="auth-page">

            {/* =============================================
                LEFT / BRANDING SECTION
            ============================================== */}

            <section className="auth-showcase">

                <div className="showcase-content">

                    <Link
                        to="/login"
                        className="auth-logo"
                    >
                        <span className="auth-logo-icon">
                            ♥
                        </span>

                        <span>
                            Nexa AI
                        </span>
                    </Link>

                    <div className="showcase-message">

                        <span className="showcase-label">
                            YOUR AI COMPANION
                        </span>

                        <h1>
                            A smarter way
                            <br />
                            <span>to connect.</span>
                        </h1>

                        <p>
                            Talk, learn, explore and create with
                            an intelligent companion that's always
                            ready to listen.
                        </p>

                    </div>

                    <div className="showcase-features">

                        <div className="showcase-feature">
                            <span>✦</span>
                            <div>
                                <strong>
                                    Intelligent conversations
                                </strong>
                                <small>
                                    Natural and helpful responses
                                </small>
                            </div>
                        </div>

                        <div className="showcase-feature">
                            <span>◈</span>
                            <div>
                                <strong>
                                    Understand your files
                                </strong>
                                <small>
                                    Analyze PDFs and images
                                </small>
                            </div>
                        </div>

                        <div className="showcase-feature">
                            <span>♥</span>
                            <div>
                                <strong>
                                    Always by your side
                                </strong>
                                <small>
                                    Your personal AI companion
                                </small>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Decorative elements */}

                <div className="auth-decoration">
                    <div className="decoration-orb orb-a"></div>
                    <div className="decoration-orb orb-b"></div>
                    <div className="decoration-orb orb-c"></div>

                    <div className="decoration-heart">
                        ♥
                    </div>
                </div>

                <div className="showcase-footer">
                    © {new Date().getFullYear()} Nexa AI
                </div>

            </section>


            {/* =============================================
                LOGIN SECTION
            ============================================== */}

            <section className="auth-form-section">

                <div className="auth-card">

                    {/* Mobile Logo */}

                    <Link
                        to="/login"
                        className="mobile-auth-logo"
                    >
                        <span>
                            ♥
                        </span>

                        Nexa AI
                    </Link>


                    {/* Heading */}

                    <div className="auth-heading">

                        <span className="auth-welcome">
                            WELCOME BACK
                        </span>

                        <h2>
                            Sign in to your
                            <span> companion.</span>
                        </h2>

                        <p>
                            Continue your conversation with
                            Nexa AI.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (
                        <div className="auth-error">
                            <span>!</span>

                            <p>
                                {error}
                            </p>
                        </div>
                    )}


                    {/* FORM */}

                    <form
                        onSubmit={handleLogin}
                        className="auth-form"
                    >

                        {/* Email */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    @
                                </span>

                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    autoComplete="email"
                                    required
                                />

                            </div>

                        </div>


                        {/* Password */}

                        <div className="form-group">

                            <div className="password-label-row">

                                <label htmlFor="password">
                                    Password
                                </label>

                            </div>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ◆
                                </span>

                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    required
                                />

                            </div>

                        </div>


                        {/* Login Button */}

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="button-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <span>→</span>
                                </>
                            )}

                        </button>

                    </form>


                    {/* Divider */}

                    <div className="auth-divider">
                        <span></span>
                        <small>OR</small>
                        <span></span>
                    </div>


                    {/* Register */}

                    <p className="auth-footer">

                        Don't have an account?

                        <Link to="/register">
                            Create an account
                        </Link>

                    </p>


                    {/* Bottom note */}

                    <div className="auth-security">
                        <span>🔒</span>

                        <span>
                            Your conversations are private and secure.
                        </span>
                    </div>

                </div>

            </section>

        </main>
    );
}

export default Login;