import React, { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  // Admin endpoint may require admin token/user to access
  useEffect(() => {
    fetch("http://localhost:3000/admin", {
      headers: { Authorization: "Bearer " + localStorage.getItem("token") }
    })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Admin Panel</h2>
      <h4>User List</h4>
      <ul>
        {users.length ? users.map(user =>
          <li key={user._id || user.id}>{user.name} ({user.email})</li>
        ) : <li>No users or not authorized.</li>}
      </ul>
    </div>
  );
}
