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
        age: ""
    });
    const [message, setMessage] = useState("");

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://internship-final-project-production.up.railway.app/api/profile",
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch profile");
            }

            setProfile(data.data);
            setFormData(data.data);

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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                "https://internship-final-project-production.up.railway.app/api/profile",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            setMessage("Profile updated successfully!");
            setProfile(formData);
            setEditing(false);

        } catch (error) {
            console.error("Update Error:", error);
            setMessage(error.message);
        }
    };

    const getInitial = (name) => {
        return name ? name.charAt(0).toUpperCase() : "?";
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main style={styles.page}>
                    <div style={styles.card}>
                        <p>Loading...</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main style={styles.page}>

                <div style={styles.card}>

                    <div style={styles.header}>
                        <div style={styles.avatar}>
                            {getInitial(profile?.name)}
                        </div>
                        <div>
                            <h1 style={styles.title}>My Profile</h1>
                            <p style={styles.subtitle}>
                                Manage your account information
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div style={styles.message}>
                            {message}
                        </div>
                    )}

                    {!editing ? (
                        <>
                            <div style={styles.infoGrid}>
                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Name</span>
                                    <span style={styles.value}>{profile?.name}</span>
                                </div>

                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Email</span>
                                    <span style={styles.value}>{profile?.email}</span>
                                </div>

                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Contact</span>
                                    <span style={styles.value}>{profile?.contact}</span>
                                </div>

                                <div style={styles.infoItem}>
                                    <span style={styles.label}>Age</span>
                                    <span style={styles.value}>{profile?.age}</span>
                                </div>
                            </div>

                            <button
                                style={styles.primaryButton}
                                onClick={() => setEditing(true)}
                            >
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <div style={styles.form}>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Name</label>
                                <input
                                    style={styles.input}
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Email</label>
                                <input
                                    style={styles.input}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Contact</label>
                                <input
                                    style={styles.input}
                                    name="contact"
                                    value={formData.contact}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Age</label>
                                <input
                                    style={styles.input}
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </div>

                            <div style={styles.buttonRow}>
                                <button
                                    style={styles.primaryButton}
                                    onClick={handleUpdate}
                                >
                                    Save Changes
                                </button>

                                <button
                                    style={styles.secondaryButton}
                                    onClick={() => setEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>

                        </div>
                    )}

                </div>

            </main>
        </>
    );
}

const styles = {
    page: {
        minHeight: "calc(100vh - 64px)",
        backgroundColor: "#f1f5f9",
        display: "flex",
        justifyContent: "center",
        padding: "48px 24px"
    },
    card: {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        padding: "40px",
        width: "100%",
        maxWidth: "560px",
        height: "fit-content"
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: "20px",
        marginBottom: "32px",
        paddingBottom: "24px",
        borderBottom: "1px solid #e2e8f0"
    },
    avatar: {
        width: "64px",
        height: "64px",
        borderRadius: "50%",
        backgroundColor: "#4f46e5",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "700",
        flexShrink: 0
    },
    title: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1e293b",
        margin: 0
    },
    subtitle: {
        fontSize: "14px",
        color: "#64748b",
        margin: "4px 0 0 0"
    },
    message: {
        backgroundColor: "#eef2ff",
        color: "#4338ca",
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        marginBottom: "20px"
    },
    infoGrid: {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        marginBottom: "28px"
    },
    infoItem: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "12px 16px",
        backgroundColor: "#f8fafc",
        borderRadius: "10px"
    },
    label: {
        fontSize: "12px",
        fontWeight: "600",
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    },
    value: {
        fontSize: "16px",
        color: "#1e293b",
        fontWeight: "500"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px"
    },
    formLabel: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#475569"
    },
    input: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        fontSize: "15px",
        outline: "none"
    },
    buttonRow: {
        display: "flex",
        gap: "12px",
        marginTop: "8px"
    },
    primaryButton: {
        backgroundColor: "#4f46e5",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "12px 24px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    },
    secondaryButton: {
        backgroundColor: "#f1f5f9",
        color: "#475569",
        border: "none",
        borderRadius: "8px",
        padding: "12px 24px",
        fontSize: "15px",
        fontWeight: "600",
        cursor: "pointer"
    }
};


export default Profile;