import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import apiClient from "./../axios-config";

function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [downloads, setDownloads] = useState([]);
    const [name, setName] = useState("");
    const [link, setLink] = useState("");
    const [message, setMessage] = useState(null);
    const [editDownload, setEditDownload] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token");
                setUser(null);
                navigate("/");
            }
        } else {
            console.error("No token found in localStorage");
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        if (user) {
            if (user.is_admin !== 1) {
                console.error("Access denied: User is not an admin");
                navigate("/");
                return;
            }

            const token = localStorage.getItem("token");

            // Fetch logs
            apiClient.get("/admin/get_logs.php", {
                headers: {Authorization: `Bearer ${token}`},
            })
                .then((response) => {
                    setLogs(response.data.logs || []);
                })
                .catch((error) => console.error("Error fetching logs:", error.response?.data?.error || "Unauthorized"));

            // Fetch users
            apiClient.get("/admin/get_users.php", {
                headers: {Authorization: `Bearer ${token}`},
            })
                .then((response) => {
                    setUsers(response.data.data.users || []);
                })
                .catch((error) => console.error("Error fetching users:", error.response?.data?.error || "Unauthorized"));

            // Fetch downloads
            apiClient.get("/public/get_downloads.php", {
                headers: {Authorization: `Bearer ${token}`},
            })
                .then((response) => {
                    setDownloads(response.data.downloads || []);
                })
                .catch((error) => console.error("Error fetching downloads:", error.response?.data?.error || "Unauthorized"));
        }
    }, [navigate, user]);


    const disableUser = async (userId) => {
        if (window.confirm("Are you sure you want to disable this user?")) {
            try {
                await apiClient.put(`/admin/disable_user.php`, {
                    user_id: userId,
                }, {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
                });

                setUsers((prevUsers) => prevUsers.map((u) => u.id === userId ? {...u, is_active: 0} : u));
            } catch (error) {
                console.error("Error disabling user:", error.response?.data?.error || "Unauthorized");
            }
        }
    };

    const enableUser = async (userId) => {
        if (window.confirm("Are you sure you want to enable this user?")) {
            try {
                await apiClient.put(`/admin/enable_user.php`, {
                    user_id: userId,
                }, {
                    headers: {Authorization: `Bearer ${localStorage.getItem("token")}`},
                });

                setUsers((prevUsers) => prevUsers.map((u) => u.id === userId ? {...u, is_active: 1} : u));
            } catch (error) {
                console.error("Error enabling user:", error.response?.data?.error || "Unauthorized");
            }
        }
    };

    const handleEdit = (download) => {
        setEditDownload(download);
        setName(download.name);
        setLink(download.link);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this download?")) return;

        const token = localStorage.getItem("token");
        try {
            await apiClient.post("/admin/delete_download.php", { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setDownloads(prevDownloads => prevDownloads.filter(download => download.id !== id));
        } catch (error) {
            console.error("Failed to delete download:", error.response?.data?.error || "Server error");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            if (editDownload) {
                await apiClient.post("/admin/update_download.php", {
                    id: editDownload.id,
                    name,
                    link
                }, { headers: { Authorization: `Bearer ${token}` } });

                setMessage({ type: "success", text: "Download updated successfully!" });
            } else {
                await apiClient.post("/admin/add_download.php", {
                    name,
                    link
                }, { headers: { Authorization: `Bearer ${token}` } });

                setMessage({ type: "success", text: "Download added successfully!" });
            }

            setName("");
            setLink("");
            setEditDownload(null);
            fetchDownloads();
        } catch (error) {
            setMessage({ type: "danger", text: "Failed to save download" });
        }
    };
    return (<div className="container text-center">
        <h1>Admin Dashboard</h1>
        <Link to="/admin/categories" className="btn btn-primary mb-3">Manage Categories</Link>
        <h2>Logs</h2>
        <ul className="list-group">
            {logs.map((log, index) => (<li key={index} className="list-group-item text-white">
                <strong>[{log.timestamp}]</strong> {log.message}
            </li>))}
        </ul>

        <div className="container container-dark">
            <h2>Manage Downloads</h2>
            {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>File Name</label>
                    <input type="text" className="form-control" value={name}
                           onChange={(e) => setName(e.target.value)} required/>
                </div>
                <div className="mb-3">
                    <label>Download Link</label>
                    <input type="text" className="form-control" value={link}
                           onChange={(e) => setLink(e.target.value)} required/>
                </div>
                <button type="submit" className="btn btn-success">Add Download</button>
            </form>

            <h3 className="mt-4">Existing Downloads</h3>
            <ul className="list-group">
                {downloads.map((file) => (
                    <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                        <a href={file.link} target="_blank" rel="noopener noreferrer">
                            {file.name}
                        </a>
                        <div>
                            <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(file)}>Edit
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(file.id)}>Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        <h2>Users</h2>
        <table className="table table-striped">
            <thead>
            <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Admin</th>
                <th>Active</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user) => (<tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.is_admin ? "Yes" : "No"}</td>
                <td>{user.is_active ? "Yes" : "No"}</td>
                <td>
                    <button
                        className={`btn btn-sm ${user.is_active ? "btn-danger" : "btn-success"}`}
                        onClick={() => (user.is_active ? disableUser(user.id) : enableUser(user.id))}
                    >
                        {user.is_active ? "Disable" : "Enable"}
                    </button>
                </td>
            </tr>))}
            </tbody>
        </table>
    </div>);
}

export default AdminDashboard;
