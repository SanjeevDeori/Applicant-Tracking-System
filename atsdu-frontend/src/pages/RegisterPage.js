import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Later, import axios from '../api/axios'
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('User may already exist');
      alert('Registration successful! Please sign in.');
      navigate('/');
    } catch (err) {
      alert('Registration failed: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: '2rem auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <br />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required type="email" />
        <br />
        <input name="password" placeholder="Password" value={form.password} onChange={handleChange} required type="password" />
        <br />
        <button type="submit">Register</button>
      </form>
      <div style={{ marginTop: 10 }}>
        <Link to="/">Back to login</Link>
      </div>
    </div>
  );
}
