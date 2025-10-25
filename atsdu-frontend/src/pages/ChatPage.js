import React, { useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState(["Welcome to chat!"]);
  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input) return;
    setMessages(msgs => [...msgs, input]);
    setInput("");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Chat</h2>
      <div style={{ border: "1px solid #ccc", height: 200, padding: 10, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((m, i) => <div key={i}>{m}</div>)}
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ width: "70%" }}
        />
        <button type="submit" style={{ marginLeft: 10 }}>Send</button>
      </form>
    </div>
  );
}
