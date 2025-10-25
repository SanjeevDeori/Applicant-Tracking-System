import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const loggedIn = !!localStorage.getItem("token");
  return (
    <nav style={{ background: "#eef", padding: "1em" }}>
      {loggedIn && (
        <>
          <Link style={{ marginRight: 10 }} to="/dashboard">Dashboard</Link>
          <Link style={{ marginRight: 10 }} to="/jobs">Jobs</Link>
          <Link style={{ marginRight: 10 }} to="/tasks">Tasks</Link>
          <Link style={{ marginRight: 10 }} to="/chat">Chat</Link>
          <Link style={{ marginRight: 10 }} to="/admin">Admin</Link>
          <button
            style={{ marginLeft: 20 }}
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}>
            Logout
          </button>
        </>
      )}
      {!loggedIn && (
        <>
          <Link style={{ marginRight: 10 }} to="/">Login</Link>
          <Link style={{ marginRight: 10 }} to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}
