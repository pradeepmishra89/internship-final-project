import { Link } from "react-router-dom";
import Navbar from "../components/navbar.jsx";

function Dashboard() {

    return (

        <>
            <Navbar />

            <div className="dashboard">

                <h1>Dashboard</h1>

                <p>
                    Welcome to your User Management System.
                </p>

                <div className="dashboard-cards">

                    <Link to="/chat" className="dashboard-card">
                        <h2>🤖 AI Chat</h2>
                        <p>
                            Chat with your AI assistant.
                        </p>
                    </Link>

                    <Link to="/profile" className="dashboard-card">
                        <h2>👤 Profile</h2>
                        <p>
                            View and update your profile.
                        </p>
                    </Link>

                </div>

            </div>
        </>

    );
}

export default Dashboard;