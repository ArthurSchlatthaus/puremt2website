import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import apiClient from "./../axios-config";

function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);

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
                    setUsers(response.data.users || []);
                })
                .catch((error) => console.error("Error fetching users:", error.response?.data?.error || "Unauthorized"));
        }
    }, [navigate, user]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };


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

    return (<div className="container text-center">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-danger mb-3" onClick={handleLogout}>
            Logout
        </button>

        <h2>Logs</h2>
        <ul className="list-group">
            {logs.map((log, index) => (<li key={index} className="list-group-item">
                <strong>[{log.timestamp}]</strong> {log.message}
            </li>))}
        </ul>
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
                <td>{user.is_active ? "Yes" : "No"}</td>
                <td>{user.is_admin ? "Yes" : "No"}</td>
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
