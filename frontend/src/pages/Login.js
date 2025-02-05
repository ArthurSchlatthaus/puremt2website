import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import apiClient from "./../axios-config";
import ReCAPTCHA from "react-google-recaptcha";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState(null);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const navigate = useNavigate();

    const validateForm = () => {
        let errors = {};
        if (!username.trim()) errors.username = "Username is required";
        if (password.length < 6) errors.password = "Password must be at least 6 characters";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (!recaptchaToken) {
            setServerMessage({type: "error", text: "Please verify the reCAPTCHA"});
            return;
        }

        setErrors({});
        setServerMessage(null);
        setLoading(true);

        try {
            const response = await apiClient.post("/login.php", {
                username, password, recaptchaToken
            });

            localStorage.setItem("token", response.data.token);
            setServerMessage({type: "success", text: "Login successful! Redirecting..."});

            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (error) {
            setLoading(false);
            if (error.response) {
                setServerMessage({type: "error", text: error.response.data.error || "Server error"});
            } else if (error.request) {
                setServerMessage({type: "error", text: "No response from server"});
            } else {
                setServerMessage({type: "error", text: "An unknown error occurred"});
            }
        }
    };

    return (<form className="text-center" onSubmit={handleSubmit}>
        {serverMessage && (
            <div className={`alert ${serverMessage.type === "success" ? "alert-success" : "alert-danger"}`}>
                {serverMessage.text}
            </div>)}

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
            <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={setRecaptchaToken}
            />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
        </button>
    </form>);
}

export default Login;
