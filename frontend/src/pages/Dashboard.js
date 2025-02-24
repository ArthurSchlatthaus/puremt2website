import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import apiClient from "./../axios-config";

function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [threads, setThreads] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found in localStorage");
            navigate("/");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUser(decoded);

            apiClient.get("/forum/get_threads.php", {
                params: {user_id: decoded.id}, headers: {Authorization: `Bearer ${token}`}
            })
                .then(response => {
                    setThreads(response.data.threads || []);
                })
                .catch(error => {
                    console.error("Error fetching threads:", error.response?.data?.error || "Unauthorized");
                })
                .finally(() => setLoading(false));

        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
            navigate("/");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    if (loading) return <div className="container container-dark text-center"><h2>Loading...</h2></div>;

    return (
        <div className="container container-dark text-center">
            <h1>Welcome, {user?.username}!</h1>
            <br/>
            <h2>Your Threads</h2>
            <br/>
            {threads.length === 0 ? (
                <p>No threads available.</p>
            ) : (
                <ul className="list-group">
                    {threads.map(thread => (
                        <li key={thread.id} className="list-group-item text-white">
                            {typeof thread.id === "number" && thread.id > 0 ? (
                                <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                            ) : (
                                <span>{thread.title} (Invalid ID)</span>
                            )}
                            <span> by {thread.username} at {thread.created_at}</span>
                            <div>
                                {thread.categories && Array.isArray(thread.categories) && thread.categories.length > 0 ? (
                                    thread.categories.map(category => (
                                        <span key={category.id} style={{
                                            backgroundColor: category.color,
                                            padding: "5px",
                                            margin: "5px",
                                            borderRadius: "4px"
                                        }}>
                                        {category.name}
                                    </span>
                                    ))
                                ) : (
                                    <span> No Categories</span>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <br/>
            <Link to="/forum/new-thread" className="btn btn-primary mb-3">New Thread</Link>
        </div>
    );
}

export default Dashboard;
