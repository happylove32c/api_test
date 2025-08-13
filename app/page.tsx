"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // full conversation
  const [loading, setLoading] = useState(false);

  // Function to strip markdown symbols
  const stripMarkdown = (text) => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
      .replace(/(\*|_)(.*?)\1/g, "$2") // italics
      .replace(/(#+)\s/g, "") // headings
      .replace(/`([^`]+)`/g, "$1") // inline code
      .replace(/- /g, "• ") // list bullets
      .replace(/\n{3,}/g, "\n\n"); // remove big line gaps
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message to local state
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/createMsg", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }), // send full history
    });

    const data = await res.json();

    // Add AI reply to state
    setMessages([
      ...newMessages,
      { role: "assistant", content: stripMarkdown(data.reply) },
    ]);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg flex flex-col">
        <h1 className="text-2xl font-bold text-purple-600 mb-4 text-center">
          ChatGPT API Demo
        </h1>

        {/* Chat history */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] mb-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg whitespace-pre-line ${
                msg.role === "user"
                  ? "bg-purple-100 text-purple-800 self-end"
                  : "bg-purple-50 border border-purple-200 text-gray-700 self-start"
              }`}
            >
              <strong>
                {msg.role === "user" ? "You" : "AI"}:
              </strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition mb-4 resize-none"
          rows={3}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg shadow transition disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}
