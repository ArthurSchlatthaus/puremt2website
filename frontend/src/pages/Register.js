import React, {useState} from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import {useNavigate} from "react-router-dom";
import apiClient from "./../axios-config";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateForm = () => {
        let errors = {};
        if (!username.trim()) errors.username = "Username is required";
        if (password.length < 6) errors.password = "Password must be at least 6 characters";
        if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setServerMessage(null);
        setLoading(true);

        try {
            const response = await apiClient.post("/register.php", {
                username,
                password,
            });

            setServerMessage({type: "success", text: "Registration successful! Logging in..."});
            localStorage.setItem("token", response.data.token);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setServerMessage({
                type: "error",
                text: error.response?.data?.error || "Registration failed",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="text-center" onSubmit={handleSubmit}>
            {serverMessage && (
                <div className={`alert ${serverMessage.type === "success" ? "alert-success" : "alert-danger"}`}>
                    {serverMessage.text}
                </div>
            )}

            <div className="mb-3">
                <input
                    type="text"
                    className={`form-control ${errors.username ? "is-invalid" : ""}`}
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>

            <div className="mb-3">
                <input
                    type="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="mb-3">
                <input
                    type="password"
                    className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
            </div>

            <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Registering..." : "Register"}
            </button>
        </form>
    );
}

export default Register;
