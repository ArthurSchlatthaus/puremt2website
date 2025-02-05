import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";

function Home() {
  const [showRegister, setShowRegister] = useState(false);

  return (
      <div className="container text-center mt-5">
          <h1 className="mb-4">Welcome to PureMt2</h1>
          <div className="btn-group mb-4">
              <button className={`btn ${!showRegister ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setShowRegister(false)}>
                  Login
              </button>
              <button className={`btn ${showRegister ? "btn-success" : "btn-outline-success"}`}
                      onClick={() => setShowRegister(true)}>
                  Register
              </button>
          </div>
          <div className="card p-4 shadow">
              {showRegister ? <Register/> : <Login/>}
          </div>
      </div>
  );
}

export default Home;
