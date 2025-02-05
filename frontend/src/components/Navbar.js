import React, {useEffect, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";

function Navbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

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
            }
        }
    }, [navigate]);

    const handleLogoClick = (e) => {
        e.preventDefault();
        if (user) {
            navigate("/dashboard");
        } else {
            navigate("/");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/");
    };

    return (<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
            <a className="navbar-brand" href="/" onClick={handleLogoClick}>
                PureMt2
            </a>
            {/* Burger menu button */}
            <button
                className="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#navbarNav"
                aria-controls="navbarNav"
                aria-expanded="false"
                aria-label="Toggle navigation"
            >
                <span className="navbar-toggler-icon"></span>
            </button>
            {/* Collapsible section */}
            <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item">
                        <Link className="nav-link" to="/forum">
                            Forum
                        </Link>
                    </li>
                    {user && user.is_admin && (<li className="nav-item">
                        <Link className="nav-link" to="/admin">
                            Admin
                        </Link>
                    </li>)}
                    {user ? (<li className="nav-item">
                        <button className="btn btn-danger nav-link" onClick={handleLogout}>
                            Logout
                        </button>
                    </li>) : (<li className="nav-item">
                        <Link className="nav-link" to="/">
                            Login
                        </Link>
                    </li>)}
                </ul>
            </div>
        </div>
    </nav>);
}

export default Navbar;
