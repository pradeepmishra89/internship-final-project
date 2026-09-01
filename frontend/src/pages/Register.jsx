import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        contact: "",
        password: "",
        age: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Backend URL
    const API_URL = import.meta.env.VITE_API_URL;

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {

        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                `${API_URL}/api/user`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        ...form,
                        age: Number(form.age)
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                setError(
                    data.message || "Registration failed"
                );

                return;
            }

            setMessage(
                "Registration successful. Redirecting..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {

            console.error(error);

            setError(
                "Unable to connect to backend server"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Create Account</h1>

                <p className="auth-subtitle">
                    Register a new account
                </p>

                <form onSubmit={handleRegister}>

                    <label>Name</label>

                    <input
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>

                    <input
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Contact</label>

                    <input
                        name="contact"
                        placeholder="Enter contact number"
                        value={form.contact}
                        onChange={handleChange}
                        required
                    />

                    <label>Age</label>

                    <input
                        name="age"
                        type="number"
                        placeholder="Enter age"
                        value={form.age}
                        onChange={handleChange}
                        required
                    />

                    <label>Password</label>

                    <input
                        name="password"
                        type="password"
                        placeholder="Enter password"
                        value={form.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Register"}
                    </button>

                </form>

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="success">
                        {message}
                    </p>
                )}

                <p className="auth-footer">

                    Already have an account?

                    <Link to="/login">
                        Login
                    </Link>

                </p>

            </div>

        </div>
    );
}

export default Register;

