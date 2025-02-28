import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import apiClient from "./../axios-config";

function Forum() {
    const [threads, setThreads] = useState([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        apiClient.get("/forum/get_threads.php", {headers: {Authorization: `Bearer ${token}`}})
            .then(response => {
                setThreads(response.data.threads);
            })
            .catch(error => console.error("Error fetching threads:", error));
    }, []);

    return (<div className="container container-dark">
        <h1>Forum</h1>
        <Link to="/forum/new-thread" className="btn btn-primary">New Thread</Link>
        <ul className="list-group mt-3">
            {Array.isArray(threads) && threads.length > 0 ? (threads.map(thread => thread?.id && thread?.title ? (
                <li key={thread.id} className="list-group-item text-white">
                    {typeof thread.id === "number" && thread.id > 0 ? (
                        <Link to={`/forum/thread/${thread.id}`}>{thread.title}</Link>) : (
                        <span>{thread.title} (Invalid ID)</span>)}
                    <span> by {thread.username} at {thread.created_at}</span>
                    <div>
                        {thread.categories ? typeof thread.categories === "string" ? thread.categories.split(", ").map((category, index) => (
                            <span key={index} style={{
                                backgroundColor: "#ccc", padding: "5px", margin: "5px", borderRadius: "4px"
                            }}>
                                {category}
                            </span>)) : Array.isArray(thread.categories) && thread.categories.length > 0 ? thread.categories.map(category => (
                            <span key={category.id}
                                  style={{
                                      backgroundColor: category.color,
                                      padding: "5px",
                                      margin: "5px",
                                      borderRadius: "4px"
                                  }}>
                                {category.name}
                            </span>)) : <span> No Categories</span> : <span> No Categories</span>}
                    </div>
                </li>) : null)) : (<p>No threads available.</p>)}
        </ul>
    </div>);
}

export default Forum;
