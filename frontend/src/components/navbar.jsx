import { Link, useNavigate } from "react-router-dom";

function Navbar() {

    const navigate = useNavigate();

    const handleLogout = async () => {

        const token = localStorage.getItem("token");

        try {

            /*
             * Tumhara current backend:
             * PUT /api/logout/:id
             *
             * Abhi frontend me token remove kar rahe hain.
             * Backend logout ko baad me properly token-based kar sakte hain.
             */

            localStorage.removeItem("token");

            navigate("/login");

        } catch (error) {

            console.error(error);

            localStorage.removeItem("token");

            navigate("/login");
        }
    };

    return (
        <nav className="navbar">

            <h2>AI User App</h2>

            <div className="nav-links">

                <Link to="/">Dashboard</Link>

                <Link to="/chat">AI Chat</Link>

                <Link to="/profile">Profile</Link>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;