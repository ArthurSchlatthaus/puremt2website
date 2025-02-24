import React, {useEffect, useState} from "react";
import apiClient from "../axios-config";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";

function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#000000");
    const [isAdminOnly, setIsAdminOnly] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [message, setMessage] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

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
            if (decoded.is_admin !== 1) {
                console.error("Access denied: User is not an admin");
                navigate(-1);
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem("token");
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
        }
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await apiClient.get("/forum/get_categories.php", {
                headers: {Authorization: `Bearer ${token}`}
            });
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        try {
            if (editCategory) {
                await apiClient.post("/admin/update_category.php", {
                    id: editCategory.id, name, color, is_admin_only: isAdminOnly ? 1 : 0
                }, {headers: {Authorization: `Bearer ${token}`}});

                setMessage({type: "success", text: "Category updated successfully!"});
            } else {
                await apiClient.post("/admin/add_category.php", {
                    name, color, is_admin_only: isAdminOnly ? 1 : 0
                }, {headers: {Authorization: `Bearer ${token}`}});

                setMessage({type: "success", text: "Category added successfully!"});
            }

            setName("");
            setColor("#000000");
            setIsAdminOnly(false);
            setEditCategory(null);
            fetchCategories();
        } catch (error) {
            setMessage({type: "danger", text: "Failed to save category"});
        }
    };

    const handleEdit = (category) => {
        setEditCategory(category);
        setName(category.name);
        setColor(category.color);
        setIsAdminOnly(category.is_admin_only);
    };

    return (<div className="container container-dark">
        <h2>Manage Categories</h2>
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label>Category Name</label>
                <input type="text" className="form-control" value={name}
                       onChange={(e) => setName(e.target.value)} required/>
            </div>
            <div className="mb-3">
                <label>Category Color</label>
                <input type="color" className="form-control" value={color}
                       onChange={(e) => setColor(e.target.value)} required/>
            </div>
            <div className="mb-3">
                <label>
                    <input type="checkbox" checked={isAdminOnly} onChange={() => setIsAdminOnly(!isAdminOnly)}/>
                    {" "} Admin Only
                </label>
            </div>
            <button type="submit" className="btn btn-success">
                {editCategory ? "Update Category" : "Add Category"}
            </button>
        </form>

        <h3 className="mt-4">Existing Categories</h3>
        <ul className="list-group">
            {categories.map(category => (
                <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center"
                    style={{backgroundColor: category.color}}>
                    {category.name} {category.is_admin_only ? "(Admin Only)" : ""}
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(category)}>Edit</button>
                </li>))}
        </ul>
    </div>);
}

export default AdminCategories;
