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
                params: {user_id: decoded.id},
                headers: {Authorization: `Bearer ${token}`}
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    if (loading) return <div className="container text-center"><h2>Loading...</h2></div>;

    return (
        <div className="container text-center">
            <h1>Welcome, {user?.username}!</h1>
            <br/>
            <h2>Your Threads</h2>
            <br/>
            {threads.length === 0 ? (
                <p>No threads available.</p>
            ) : (
                <ul className="list-group">
                    {threads.map(thread => (
                        <li key={thread.id} className="list-group-item">
                            {typeof thread.id === "number" && thread.id > 0 ? (
                                <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                            ) : (
                                <span>{thread.title} (Invalid ID)</span>
                            )}
                            <span className="text-muted"> by {thread.username} at {thread.created_at}</span>
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
