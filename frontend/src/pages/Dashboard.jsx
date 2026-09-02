import { Link } from "react-router-dom";
import Navbar from "../components/navbar.jsx";

function Dashboard() {
    return (
        <>
            <Navbar />

            <main className="dashboard-page">

                {/* =========================================
                    HERO SECTION
                ========================================= */}

                <section className="dashboard-hero">

                    <div className="hero-content">

                        <span className="hero-badge">
                            ✦ NEXA AI COMPANION
                        </span>

                        <h1>
                            Welcome back,
                            <br />
                            <span>Let's create something amazing.</span>
                        </h1>

                        <p>
                            Your intelligent companion is ready to help
                            you explore ideas, understand information,
                            and get things done.
                        </p>

                    </div>

                    <div className="hero-decoration">
                        <div className="orb orb-one"></div>
                        <div className="orb orb-two"></div>
                        <div className="orb orb-three"></div>

                        <div className="hero-heart">
                            ♥
                        </div>
                    </div>

                </section>


                {/* =========================================
                    QUICK ACCESS
                ========================================= */}

                <section className="dashboard-section">

                    <div className="section-heading">

                        <div>
                            <span className="section-label">
                                QUICK ACCESS
                            </span>

                            <h2>
                                What would you like to do?
                            </h2>
                        </div>

                        <p>
                            Choose an option to get started.
                        </p>

                    </div>


                    <div className="dashboard-cards">

                        {/* =================================
                            AI COMPANION CARD
                        ================================= */}

                        <Link
                            to="/chat"
                            className="dashboard-card ai-card"
                        >

                            <div className="card-top">

                                <div className="card-icon ai-icon">
                                    ✦
                                </div>

                                <span className="card-arrow">
                                    ↗
                                </span>

                            </div>

                            <div className="card-content">

                                <span className="card-label">
                                    AI COMPANION
                                </span>

                                <h3>
                                    Talk to Nexa
                                </h3>

                                <p>
                                    Ask questions, brainstorm ideas,
                                    analyze documents and images, or
                                    simply have a conversation.
                                </p>

                            </div>

                            <div className="card-footer">
                                <span>
                                    Start a conversation
                                </span>

                                <span className="footer-arrow">
                                    →
                                </span>
                            </div>

                        </Link>


                        {/* =================================
                            PROFILE CARD
                        ================================= */}

                        <Link
                            to="/profile"
                            className="dashboard-card profile-card"
                        >

                            <div className="card-top">

                                <div className="card-icon profile-icon">
                                    ◉
                                </div>

                                <span className="card-arrow">
                                    ↗
                                </span>

                            </div>

                            <div className="card-content">

                                <span className="card-label">
                                    YOUR ACCOUNT
                                </span>

                                <h3>
                                    Your Profile
                                </h3>

                                <p>
                                    Manage your personal information
                                    and keep your account details
                                    up to date.
                                </p>

                            </div>

                            <div className="card-footer">
                                <span>
                                    View your profile
                                </span>

                                <span className="footer-arrow">
                                    →
                                </span>
                            </div>

                        </Link>

                    </div>

                </section>


                {/* =========================================
                    INFO STRIP
                ========================================= */}

                <section className="dashboard-info">

                    <div className="info-item">

                        <div className="info-icon">
                            💬
                        </div>

                        <div>
                            <strong>
                                Natural conversations
                            </strong>

                            <span>
                                Chat naturally with your companion
                            </span>
                        </div>

                    </div>


                    <div className="info-divider"></div>


                    <div className="info-item">

                        <div className="info-icon">
                            📄
                        </div>

                        <div>
                            <strong>
                                Understand your files
                            </strong>

                            <span>
                                Upload PDFs and images for analysis
                            </span>
                        </div>

                    </div>


                    <div className="info-divider"></div>


                    <div className="info-item">

                        <div className="info-icon">
                            ⚡
                        </div>

                        <div>
                            <strong>
                                Fast & intelligent
                            </strong>

                            <span>
                                Get helpful responses in seconds
                            </span>
                        </div>

                    </div>

                </section>

            </main>
        </>
    );
}

export default Dashboard;