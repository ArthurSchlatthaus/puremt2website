import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import apiClient from "./../axios-config";

function Forum() {
    const [threads, setThreads] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        apiClient.get("/forum/get_threads.php", {headers: {Authorization: `Bearer ${token}`}})
            .then(response => setThreads(response.data.threads))
            .catch(error => console.error("Error fetching threads:", error));
    }, []);

    return (<div className="container">
        <h1>Forum</h1>
        <Link to="/forum/new-thread" className="btn btn-primary">New Thread</Link>
        <ul className="list-group mt-3">
            {Array.isArray(threads) && threads.length > 0 ? (
                threads.map(thread => (
                    thread && thread.id && thread.title ? (
                        <li key={thread.id} className="list-group-item">
                            {typeof thread.id === "number" && thread.id > 0 ? (
                                <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>
                            ) : (
                                <span>{thread.title} (Invalid ID)</span>
                            )}
                            <span className="text-muted"> by {thread.username} at {thread.created_at}</span>
                        </li>
                    ) : null // Skip invalid thread objects
                ))
            ) : (
                <p className="text-muted">No threads available.</p>
            )}
        </ul>
    </div>);
}

export default Forum;
