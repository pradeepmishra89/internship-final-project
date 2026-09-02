import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        contact: "",
        password: "",
        age: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL;


    // =========================================
    // HANDLE INPUT
    // =========================================

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

        if (error) {
            setError("");
        }

        if (message) {
            setMessage("");
        }
    };


    // =========================================
    // REGISTER
    // =========================================

    const handleRegister = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        // Basic validation
        if (
            !form.name.trim() ||
            !form.email.trim() ||
            !form.contact.trim() ||
            !form.age ||
            !form.password
        ) {
            setError("Please fill in all fields.");
            return;
        }

        if (Number(form.age) <= 0) {
            setError("Please enter a valid age.");
            return;
        }

        if (form.password.length < 6) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/user`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        ...form,
                        age: Number(form.age),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    "Registration failed"
                );

                return;
            }

            setMessage(
                "Account created successfully. Redirecting to login..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1200);

        } catch (error) {
            console.error(
                "Registration Error:",
                error
            );

            setError(
                "Unable to connect to backend server."
            );

        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="auth-page">

            {/* =========================================
                LEFT SHOWCASE
            ========================================== */}

            <section className="auth-showcase">

                <div className="auth-showcase-content">

                    {/* BRAND */}

                    <Link
                        to="/login"
                        className="auth-brand"
                    >
                        <span className="auth-brand-icon">
                            ✦
                        </span>

                        <span className="auth-brand-text">
                            NEXA
                        </span>
                    </Link>


                    {/* MAIN CONTENT */}

                    <div className="auth-showcase-main">

                        <span className="auth-showcase-label">
                            YOUR AI COMPANION
                        </span>

                        <h1>
                            Begin your
                            <br />
                            <span>AI journey.</span>
                        </h1>

                        <p>
                            Create your Nexa account and unlock
                            a smarter, more personal way to
                            interact with AI.
                        </p>


                        {/* FEATURES */}

                        <div className="auth-features">

                            <div className="auth-feature">

                                <span className="auth-feature-icon">
                                    ✦
                                </span>

                                <div>
                                    <strong>
                                        Intelligent conversations
                                    </strong>

                                    <small>
                                        Chat naturally with your AI companion.
                                    </small>
                                </div>

                            </div>


                            <div className="auth-feature">

                                <span className="auth-feature-icon">
                                    ◈
                                </span>

                                <div>
                                    <strong>
                                        Understand your files
                                    </strong>

                                    <small>
                                        Upload PDFs and images for AI analysis.
                                    </small>
                                </div>

                            </div>


                            <div className="auth-feature">

                                <span className="auth-feature-icon">
                                    ∞
                                </span>

                                <div>
                                    <strong>
                                        Built around you
                                    </strong>

                                    <small>
                                        Your personal AI experience, all in one place.
                                    </small>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* DECORATIVE ELEMENT */}

                    <div className="auth-decoration auth-decoration-one"></div>
                    <div className="auth-decoration auth-decoration-two"></div>

                    <div className="auth-heart">
                        <span>♡</span>
                    </div>


                    {/* FOOTER */}

                    <div className="auth-showcase-footer">
                        <span>
                            © {new Date().getFullYear()} Nexa AI
                        </span>

                        <span>
                            A companion that understands.
                        </span>
                    </div>

                </div>

            </section>


            {/* =========================================
                REGISTER FORM
            ========================================== */}

            <section className="auth-form-section">

                {/* MOBILE BRAND */}

                <div className="auth-mobile-brand">

                    <span className="auth-brand-icon">
                        ✦
                    </span>

                    <span>
                        NEXA
                    </span>

                </div>


                <div className="auth-form-wrapper">

                    <div className="auth-card">

                        {/* HEADER */}

                        <div className="auth-form-header">

                            <span className="auth-form-eyebrow">
                                CREATE YOUR ACCOUNT
                            </span>

                            <h2>
                                Welcome to Nexa.
                            </h2>

                            <p>
                                Create your account and meet
                                your AI companion.
                            </p>

                        </div>


                        {/* ERROR */}

                        {error && (
                            <div className="auth-alert auth-alert-error">

                                <span className="auth-alert-icon">
                                    !
                                </span>

                                <span>
                                    {error}
                                </span>

                            </div>
                        )}


                        {/* SUCCESS */}

                        {message && (
                            <div className="auth-alert auth-alert-success">

                                <span className="auth-alert-icon">
                                    ✓
                                </span>

                                <span>
                                    {message}
                                </span>

                            </div>
                        )}


                        {/* FORM */}

                        <form
                            onSubmit={handleRegister}
                            className="auth-form"
                            autoComplete="off"
                        >

                            {/* NAME */}

                            <div className="auth-form-group">

                                <label htmlFor="register-name">
                                    Full Name
                                </label>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        ◉
                                    </span>

                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={form.name}
                                        onChange={handleChange}
                                        autoComplete="off"
                                        required
                                    />

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="auth-form-group">

                                <label htmlFor="register-email">
                                    Email Address
                                </label>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        @
                                    </span>

                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={form.email}
                                        onChange={handleChange}
                                        autoComplete="new-email"
                                        required
                                    />

                                </div>

                            </div>


                            {/* CONTACT + AGE */}

                            <div className="auth-form-row">

                                <div className="auth-form-group">

                                    <label htmlFor="register-contact">
                                        Contact
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            ☎
                                        </span>

                                        <input
                                            id="register-contact"
                                            name="contact"
                                            type="tel"
                                            placeholder="Contact number"
                                            value={form.contact}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            required
                                        />

                                    </div>

                                </div>


                                <div className="auth-form-group">

                                    <label htmlFor="register-age">
                                        Age
                                    </label>

                                    <div className="auth-input-wrapper">

                                        <span className="auth-input-icon">
                                            #
                                        </span>

                                        <input
                                            id="register-age"
                                            name="age"
                                            type="number"
                                            min="1"
                                            placeholder="Age"
                                            value={form.age}
                                            onChange={handleChange}
                                            autoComplete="off"
                                            required
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="auth-form-group">

                                <div className="auth-label-row">

                                    <label htmlFor="register-password">
                                        Password
                                    </label>

                                    <span>
                                        Min. 6 characters
                                    </span>

                                </div>

                                <div className="auth-input-wrapper">

                                    <span className="auth-input-icon">
                                        ◈
                                    </span>

                                    <input
                                        id="register-password"
                                        name="password"
                                        type="password"
                                        placeholder="Create a secure password"
                                        value={form.password}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        required
                                    />

                                </div>

                            </div>


                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >

                                {loading ? (
                                    <>
                                        <span className="auth-spinner"></span>

                                        <span>
                                            Creating your account...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span>
                                            Create Account
                                        </span>

                                        <span className="auth-submit-arrow">
                                            →
                                        </span>
                                    </>
                                )}

                            </button>

                        </form>


                        {/* DIVIDER */}

                        <div className="auth-divider">
                            <span></span>
                            <small>OR</small>
                            <span></span>
                        </div>


                        {/* LOGIN */}

                        <div className="auth-switch">

                            <span>
                                Already have an account?
                            </span>

                            <Link to="/login">
                                Sign in
                                <span> →</span>
                            </Link>

                        </div>


                        {/* SECURITY */}

                        <div className="auth-security">

                            <span className="auth-security-icon">
                                ◇
                            </span>

                            <span>
                                Your account information is
                                securely protected.
                            </span>

                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Register;