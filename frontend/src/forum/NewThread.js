import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import apiClient from "./../axios-config";

function NewThread() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            const response = await apiClient.post("/forum/create_thread.php", {title}, {headers: {Authorization: `Bearer ${token}`}});

            console.log(response)
            setMessage({type: "success", text: response.data.message});
            setTimeout(() => navigate("/forum"), 2000);
        } catch (error) {
            setMessage({type: "error", text: error.response?.data?.error || "Failed to create thread"});
        }
    };

    return (<div className="container">
            <h2>Create New Thread</h2>
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input type="text" className="form-control" placeholder="Thread Title"
                           value={title} onChange={(e) => setTitle(e.target.value)}/>
                </div>
                <button type="submit" className="btn btn-success">Create</button>
            </form>
        </div>);
}

export default NewThread;
