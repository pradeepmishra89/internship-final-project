import { useState, useEffect } from "react";
import Navbar from "../components/navbar.jsx";

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        contact: "",
        age: "",
    });

    const [message, setMessage] = useState("");
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        password: "",
        confirmPassword: "",
    });

    const [passwordMessage, setPasswordMessage] = useState("");

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "https://internship-final-project-production.up.railway.app";


    // =========================================
    // FETCH PROFILE
    // =========================================

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/profile`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch profile"
                );
            }

            setProfile(data.data);
            setFormData({
                name: data.data.name || "",
                email: data.data.email || "",
                contact: data.data.contact || "",
                age: data.data.age || "",
            });

        } catch (error) {
            console.error("Profile Error:", error);
            setMessage("Unable to load profile.");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchProfile();
    }, []);


    // =========================================
    // PROFILE FORM
    // =========================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        if (message) {
            setMessage("");
        }
    };


    // =========================================
    // UPDATE PROFILE
    // =========================================

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to update profile"
                );
            }

            setMessage("Profile updated successfully!");
            setProfile({
                ...profile,
                ...formData,
            });

            setEditing(false);

        } catch (error) {
            console.error("Update Error:", error);
            setMessage(error.message);
        }
    };


    // =========================================
    // PASSWORD FORM
    // =========================================

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });

        if (passwordMessage) {
            setPasswordMessage("");
        }
    };


    // =========================================
    // CHANGE PASSWORD
    // =========================================

    const handleChangePassword = async () => {
        setPasswordMessage("");

        if (
            !passwordData.oldPassword ||
            !passwordData.password ||
            !passwordData.confirmPassword
        ) {
            setPasswordMessage(
                "Please fill all required fields."
            );
            return;
        }

        if (
            passwordData.password !==
            passwordData.confirmPassword
        ) {
            setPasswordMessage(
                "New password and confirm password do not match."
            );
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_URL}/api/change-password/${profile.id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                        oldPassword: passwordData.oldPassword,
                        password: passwordData.password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Failed to change password"
                );
            }

            setPasswordMessage(
                "Password changed successfully!"
            );

            setPasswordData({
                oldPassword: "",
                password: "",
                confirmPassword: "",
            });

            setShowPasswordForm(false);

        } catch (error) {
            console.error(
                "Change Password Error:",
                error
            );

            setPasswordMessage(error.message);
        }
    };


    // =========================================
    // HELPERS
    // =========================================

    const getInitial = (name) => {
        return name
            ? name.charAt(0).toUpperCase()
            : "?";
    };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {
        return (
            <>
                <Navbar />

                <main className="profile-page">

                    <div className="profile-loading">

                        <div className="profile-loading-spinner"></div>

                        <p>
                            Loading your profile...
                        </p>

                    </div>

                </main>
            </>
        );
    }


    // =========================================
    // PROFILE UI
    // =========================================

    return (
        <>
            <Navbar />

            <main className="profile-page">

                <div className="profile-container">

                    {/* =================================
                        PAGE HEADER
                    ================================== */}

                    <div className="profile-page-header">

                        <div>
                            <span className="profile-eyebrow">
                                NEXA ACCOUNT
                            </span>

                            <h1>
                                Your Profile
                            </h1>

                            <p>
                                Manage your personal information
                                and account security.
                            </p>
                        </div>

                        <div className="profile-header-icon">
                            ✦
                        </div>

                    </div>


                    {/* =================================
                        PROFILE CARD
                    ================================== */}

                    <section className="profile-card">

                        <div className="profile-card-top">

                            <div className="profile-identity">

                                <div className="profile-avatar">
                                    {getInitial(profile?.name)}
                                </div>

                                <div>

                                    <span className="profile-member-label">
                                        NEXA MEMBER
                                    </span>

                                    <h2>
                                        {profile?.name || "User"}
                                    </h2>

                                    <p>
                                        {profile?.email}
                                    </p>

                                </div>

                            </div>


                            {!editing && (
                                <button
                                    className="profile-edit-btn"
                                    onClick={() => {
                                        setEditing(true);
                                        setMessage("");
                                    }}
                                >
                                    <span>✎</span>
                                    Edit Profile
                                </button>
                            )}

                        </div>


                        {/* =================================
                            MESSAGE
                        ================================== */}

                        {message && (
                            <div
                                className={`profile-message ${
                                    message.toLowerCase().includes("success")
                                        ? "profile-message-success"
                                        : "profile-message-error"
                                }`}
                            >
                                <span className="profile-message-icon">
                                    {message
                                        .toLowerCase()
                                        .includes("success")
                                        ? "✓"
                                        : "!"}
                                </span>

                                <span>
                                    {message}
                                </span>
                            </div>
                        )}


                        {/* =================================
                            VIEW PROFILE
                        ================================== */}

                        {!editing ? (
                            <>

                                <div className="profile-info-grid">

                                    <div className="profile-info-item">

                                        <div className="profile-info-icon">
                                            ◉
                                        </div>

                                        <div>
                                            <span>
                                                Full Name
                                            </span>

                                            <strong>
                                                {profile?.name || "Not provided"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="profile-info-item">

                                        <div className="profile-info-icon">
                                            @
                                        </div>

                                        <div>
                                            <span>
                                                Email Address
                                            </span>

                                            <strong>
                                                {profile?.email || "Not provided"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="profile-info-item">

                                        <div className="profile-info-icon">
                                            ☎
                                        </div>

                                        <div>
                                            <span>
                                                Contact
                                            </span>

                                            <strong>
                                                {profile?.contact || "Not provided"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="profile-info-item">

                                        <div className="profile-info-icon">
                                            #
                                        </div>

                                        <div>
                                            <span>
                                                Age
                                            </span>

                                            <strong>
                                                {profile?.age || "Not provided"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            </>
                        ) : (

                            /* =================================
                               EDIT PROFILE
                            ================================== */

                            <div className="profile-form">

                                <div className="profile-form-header">

                                    <div>
                                        <span>
                                            EDIT DETAILS
                                        </span>

                                        <h3>
                                            Update your information
                                        </h3>
                                    </div>

                                </div>


                                <div className="profile-form-grid">

                                    <div className="profile-form-group">

                                        <label htmlFor="profile-name">
                                            Full Name
                                        </label>

                                        <input
                                            id="profile-name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Enter your name"
                                        />

                                    </div>


                                    <div className="profile-form-group">

                                        <label htmlFor="profile-email">
                                            Email Address
                                        </label>

                                        <input
                                            id="profile-email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email"
                                        />

                                    </div>


                                    <div className="profile-form-group">

                                        <label htmlFor="profile-contact">
                                            Contact
                                        </label>

                                        <input
                                            id="profile-contact"
                                            name="contact"
                                            value={formData.contact}
                                            onChange={handleChange}
                                            placeholder="Enter contact number"
                                        />

                                    </div>


                                    <div className="profile-form-group">

                                        <label htmlFor="profile-age">
                                            Age
                                        </label>

                                        <input
                                            id="profile-age"
                                            type="number"
                                            name="age"
                                            value={formData.age}
                                            onChange={handleChange}
                                            placeholder="Enter your age"
                                        />

                                    </div>

                                </div>


                                <div className="profile-action-row">

                                    <button
                                        className="profile-save-btn"
                                        onClick={handleUpdate}
                                    >
                                        <span>✓</span>
                                        Save Changes
                                    </button>

                                    <button
                                        className="profile-cancel-btn"
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData({
                                                name: profile?.name || "",
                                                email: profile?.email || "",
                                                contact: profile?.contact || "",
                                                age: profile?.age || "",
                                            });
                                            setMessage("");
                                        }}
                                    >
                                        Cancel
                                    </button>

                                </div>

                            </div>
                        )}


                        {/* =================================
                            SECURITY SECTION
                        ================================== */}

                        <div className="profile-security">

                            <div className="security-header">

                                <div className="security-icon">
                                    ◈
                                </div>

                                <div>
                                    <span>
                                        ACCOUNT SECURITY
                                    </span>

                                    <h3>
                                        Password & Security
                                    </h3>

                                    <p>
                                        Keep your account secure with
                                        a strong password.
                                    </p>
                                </div>

                            </div>


                            {!showPasswordForm ? (

                                <button
                                    className="change-password-btn"
                                    onClick={() => {
                                        setShowPasswordForm(true);
                                        setPasswordMessage("");
                                    }}
                                >
                                    Change Password
                                    <span>→</span>
                                </button>

                            ) : (

                                <div className="password-form">

                                    <div className="password-form-title">
                                        Update your password
                                    </div>


                                    {passwordMessage && (
                                        <div
                                            className={`profile-message ${
                                                passwordMessage
                                                    .toLowerCase()
                                                    .includes("success")
                                                    ? "profile-message-success"
                                                    : "profile-message-error"
                                            }`}
                                        >
                                            <span className="profile-message-icon">
                                                {passwordMessage
                                                    .toLowerCase()
                                                    .includes("success")
                                                    ? "✓"
                                                    : "!"}
                                            </span>

                                            <span>
                                                {passwordMessage}
                                            </span>
                                        </div>
                                    )}


                                    <div className="profile-form-group">

                                        <label htmlFor="old-password">
                                            Current Password
                                        </label>

                                        <input
                                            id="old-password"
                                            type="password"
                                            name="oldPassword"
                                            value={
                                                passwordData.oldPassword
                                            }
                                            onChange={
                                                handlePasswordChange
                                            }
                                            placeholder="Enter current password"
                                        />

                                    </div>


                                    <div className="profile-form-grid">

                                        <div className="profile-form-group">

                                            <label htmlFor="new-password">
                                                New Password
                                            </label>

                                            <input
                                                id="new-password"
                                                type="password"
                                                name="password"
                                                value={
                                                    passwordData.password
                                                }
                                                onChange={
                                                    handlePasswordChange
                                                }
                                                placeholder="Enter new password"
                                            />

                                        </div>


                                        <div className="profile-form-group">

                                            <label htmlFor="confirm-password">
                                                Confirm Password
                                            </label>

                                            <input
                                                id="confirm-password"
                                                type="password"
                                                name="confirmPassword"
                                                value={
                                                    passwordData.confirmPassword
                                                }
                                                onChange={
                                                    handlePasswordChange
                                                }
                                                placeholder="Confirm new password"
                                            />

                                        </div>

                                    </div>


                                    <div className="profile-action-row">

                                        <button
                                            className="profile-save-btn"
                                            onClick={
                                                handleChangePassword
                                            }
                                        >
                                            <span>✓</span>
                                            Update Password
                                        </button>

                                        <button
                                            className="profile-cancel-btn"
                                            onClick={() => {
                                                setShowPasswordForm(false);
                                                setPasswordMessage("");

                                                setPasswordData({
                                                    oldPassword: "",
                                                    password: "",
                                                    confirmPassword: "",
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                    </section>


                    {/* =================================
                        FOOTER NOTE
                    ================================== */}

                    <div className="profile-footer-note">

                        <span>✦</span>

                        <p>
                            Your information is securely managed
                            within your Nexa account.
                        </p>

                    </div>

                </div>

            </main>
        </>
    );
}

export default Profile;