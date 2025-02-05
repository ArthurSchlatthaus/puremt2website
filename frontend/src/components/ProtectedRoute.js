import {useEffect} from "react";
import {Navigate} from "react-router-dom";
import apiClient from "./../axios-config";

const ProtectedRoute = ({children}) => {
    const token = localStorage.getItem("token");

    const isTokenValid = async () => {
        if (!token) {
            return false;
        }

        try {
            const response = await apiClient.post("/validate_token.php", null, {
                headers: {Authorization: `Bearer ${token}`},
            });

            return response.data.isValid;
        } catch (error) {
            console.error("Token validation failed:", error);
            return false;
        }
    };

    useEffect(() => {
        const handleTokenValidation = async () => {
            const isValid = await isTokenValid();
            if (!isValid) {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        };

        handleTokenValidation();
    }, []);

    if (!token) {
        return <Navigate to="/"/>;
    }
    return children;
};

export default ProtectedRoute;
