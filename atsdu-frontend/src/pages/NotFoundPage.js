import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h2>404 – Page Not Found</h2>
      <p>Try another page or <Link to="/">go to login</Link>.</p>
    </div>
  );
}
