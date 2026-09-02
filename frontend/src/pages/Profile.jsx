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

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="page">
                    <div className="page-card">
                        <p>Loading...</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="page">

                <div className="page-card">

                    <h1>My Profile</h1>

                    {message && <p>{message}</p>}

                    {!editing ? (
                        <>
                            <p><strong>Name:</strong> {profile?.name}</p>
                            <p><strong>Email:</strong> {profile?.email}</p>
                            <p><strong>Contact:</strong> {profile?.contact}</p>
                            <p><strong>Age:</strong> {profile?.age}</p>

                            <button onClick={() => setEditing(true)}>
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <>
                            <label>Name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />

                            <label>Email</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <label>Contact</label>
                            <input
                                name="contact"
                                value={formData.contact}
                                onChange={handleChange}
                            />

                            <label>Age</label>
                            <input
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                            />

                            <button onClick={handleUpdate}>
                                Save
                            </button>

                            <button onClick={() => setEditing(false)}>
                                Cancel
                            </button>
                        </>
                    )}

                </div>

            </main>
        </>
    );
}

export default Profile;