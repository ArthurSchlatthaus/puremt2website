import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Forum from "./forum/Forum";
import Thread from "./forum/Thread";
import NewThread from "./forum/NewThread";

function App() {
    return (
        <Router>
            <Navbar/>
            <div className="container mt-3">
                <Routes>
                    <Route path="/" element={<Home/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/forum"
                        element={
                            <ProtectedRoute>
                                <Forum/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/forum/new-thread"
                        element={
                            <ProtectedRoute>
                                <NewThread/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/forum/thread/:id"
                        element={
                            <ProtectedRoute>
                                <Thread/>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
