import {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import apiClient from "./../axios-config";

const ProtectedRoute = ({children}) => {
    const token = localStorage.getItem("token");
    const [isValid, setIsValid] = useState(null);
    const [user, setUser] = useState(null);

    const isTokenValid = async () => {
        if (!token) {
            return {isValid: false, user: null};
        }

        try {
            const response = await apiClient.post("/validate_token.php", null, {
                headers: {Authorization: `Bearer ${token}`},
            });

            return response.data || {isValid: false, user: null};
        } catch (error) {
            console.error("Token validation failed:", error);
            return {isValid: false, user: null};
        }
    };

    useEffect(() => {
        const handleTokenValidation = async () => {
            const response = await isTokenValid();
            const isValid = response?.data?.isValid || false;
            const user = response?.data?.user || null;

            setIsValid(isValid);

            if (isValid) {
                setUser(user);
            } else {
                localStorage.removeItem("token");
                window.location.href = "/";
            }
        };

        handleTokenValidation();
    }, []);

    // Prevent rendering until we verify token validity
    if (isValid === null) {
        return <div>Loading...</div>;
    }

    return isValid ? children : <Navigate to="/"/>;
};

export default ProtectedRoute;
