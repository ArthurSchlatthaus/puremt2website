import React, {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import Editor from "../components/Editor";
import DOMPurify from "dompurify";
import "../styles/Forum.css";
import apiClient from "./../axios-config";
import {jwtDecode} from "jwt-decode";

function Thread() {
    const navigate = useNavigate();
    const {id} = useParams();
    const [posts, setPosts] = useState([]);
    const [thread, setThread] = useState(null);
    const [message, setMessage] = useState(null);
    const [content, setContent] = useState("");
    const [clearEditor, setClearEditor] = useState(false);
    const [user, setUser] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!id) {
            console.error("Invalid thread ID, skipping API call.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found in localStorage");
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

        apiClient.get(`/forum/get_posts.php?thread_id=${id}`, {headers: {Authorization: `Bearer ${token}`}})
            .then(response => {
                setPosts(response.data.posts || []);
                setThread(response.data.thread || null);
            })
            .catch(error => console.error("Error fetching posts:", error));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await apiClient.post("/forum/add_reply.php", {
                thread_id: id, content
            }, {headers: {Authorization: `Bearer ${token}`}});

            setMessage({type: "success", text: response.data.message});
            setContent("");
            setClearEditor(true);
            setPosts([...posts, {username: "You", content, created_at: new Date().toISOString()}]);

            setTimeout(() => setClearEditor(false), 100);
        } catch (error) {
            if (error.response?.status === 401) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
                window.location.href = "/";
            } else if (error.response?.status === 429) {
                setMessage({type: "danger", text: error.response.data.error || "Too many requests, please wait."});
            } else {
                setMessage({type: "danger", text: "Failed to post reply, you have to wait"});
            }
        }
    };

    function unescapeHTML(html) {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    return (<div className="container container-dark mt-4">
        <h2 className="mb-4">
            {thread ? thread.title : "Loading..."}
        </h2>
        <h5>
            Posted
            by {thread ? thread.username : "Unknown"} on {thread ? new Date(thread.created_at).toLocaleString() : ""}
        </h5>
        <h5>Categories:
            {thread && thread.categories && thread.categories.length > 0 ? (
                thread.categories.map((category) => (
                    <span key={category.id} style={{
                        backgroundColor: category.color,
                        padding: "5px",
                        marginLeft: "5px",
                        borderRadius: "4px"
                    }}>
                {category.name}
            </span>
                ))
            ) : (
                " None"
            )}
        </h5>
        <div className="list-group mb-4">
            {posts.length === 0 ? (<p>No replies yet.</p>) : (posts.map((post, index) => (
                <div key={index} className="card mb-3">
                    <div className="card-body">
                        <h5 className="card-title">
                            {user && user.username === post.username ? "You" : post.username}
                        </h5>
                        <h6 className="card-subtitle mb-2">{new Date(post.created_at).toLocaleString()}</h6>
                        <p className="card-text"
                           dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(unescapeHTML(post.content))}}/>
                    </div>
                </div>)))}
        </div>

        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {thread && thread.is_admin && user.is_admin === 0 ? (<p>Replies are disabled for admin threads.</p>) : (
            <form onSubmit={handleSubmit}>
                <Editor value={content} onChange={setContent} clearContent={clearEditor}/>
                <button type="submit" className="btn btn-primary mt-3">Reply</button>
            </form>)}

    </div>);
}

export default Thread;
