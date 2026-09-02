import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setMenuOpen(false);
        navigate("/login");
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">

                {/* Logo */}
                <Link to="/" className="navbar-brand" onClick={closeMenu}>
                    <div className="brand-icon">
                        ✨
                    </div>

                    <div className="brand-text">
                        <span className="brand-title">AI User</span>
                        <span className="brand-subtitle">APP</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="nav-links">

                    <Link
                        to="/"
                        className={`nav-link ${isActive("/") ? "active" : ""}`}
                    >
                        <span className="nav-icon">⌂</span>
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/chat"
                        className={`nav-link ${isActive("/chat") ? "active" : ""}`}
                    >
                        <span className="nav-icon">💬</span>
                        <span>AI Chat</span>
                    </Link>

                    <Link
                        to="/profile"
                        className={`nav-link ${isActive("/profile") ? "active" : ""}`}
                    >
                        <span className="nav-icon">◉</span>
                        <span>Profile</span>
                    </Link>

                    <button
                        type="button"
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        <span>Logout</span>
                    </button>

                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    className={`menu-toggle ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={menuOpen}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

            </div>

            {/* Mobile Navigation */}
            <div className={`mobile-nav ${menuOpen ? "show" : ""}`}>

                <Link
                    to="/"
                    className={`mobile-nav-link ${
                        isActive("/") ? "active" : ""
                    }`}
                    onClick={closeMenu}
                >
                    <span>⌂</span>
                    <span>Dashboard</span>
                </Link>

                <Link
                    to="/chat"
                    className={`mobile-nav-link ${
                        isActive("/chat") ? "active" : ""
                    }`}
                    onClick={closeMenu}
                >
                    <span>💬</span>
                    <span>AI Chat</span>
                </Link>

                <Link
                    to="/profile"
                    className={`mobile-nav-link ${
                        isActive("/profile") ? "active" : ""
                    }`}
                    onClick={closeMenu}
                >
                    <span>◉</span>
                    <span>Profile</span>
                </Link>

                <button
                    type="button"
                    className="mobile-logout-btn"
                    onClick={handleLogout}
                >
                    <span>↪</span>
                    <span>Logout</span>
                </button>

            </div>
        </nav>
    );
}

export default Navbar;