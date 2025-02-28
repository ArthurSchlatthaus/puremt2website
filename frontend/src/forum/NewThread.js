import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import apiClient from "./../axios-config";

function NewThread() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            navigate("/");
        }

        apiClient.get("/forum/get_categories.php", {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setCategories(response.data.categories || []);
        }).catch(error => {
            console.error("Error fetching categories:", error);
        });
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await apiClient.post("/forum/create_thread.php",
                { title, categories: selectedCategories },
                { headers: { Authorization: `Bearer ${token}` } });

            setMessage({ type: "success", text: response.data.message });
            setTimeout(() => navigate("/forum"), 2000);
        } catch (error) {
            setMessage({ type: "danger", text: error.response?.data?.error || "Failed to create thread" });
        }
    };

    return (
        <div className="container container-dark">
            <h2>Create New Thread</h2>
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input type="text" className="form-control" placeholder="Thread Title"
                           value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="mb-3">
                    <label>Select Categories</label>
                    <select multiple className="form-control"
                            value={selectedCategories}
                            onChange={(e) => setSelectedCategories([...e.target.selectedOptions].map(o => o.value))}>
                        {categories
                            .filter(category => !(category.is_admin_only && !user?.is_admin))
                            .map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name} {category.is_admin_only ? "(Admin-Only)" : ""}
                                </option>
                            ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-success">Create</button>
            </form>
        </div>
    );
}

export default NewThread;
