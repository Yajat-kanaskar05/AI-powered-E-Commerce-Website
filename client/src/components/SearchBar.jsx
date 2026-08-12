import { useState } from "react";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("ai");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query, mode);
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Try 'something for exercise at home'..."
      />
      <div className="search-mode-toggle">
        <button
          type="button"
          className={`search-mode-btn ${mode === "ai" ? "active" : ""}`}
          onClick={() => setMode("ai")}
        >
          AI
        </button>
        <button
          type="button"
          className={`search-mode-btn ${mode === "keyword" ? "active" : ""}`}
          onClick={() => setMode("keyword")}
        >
          Keyword
        </button>
      </div>
      <button type="submit" className="search-submit">Search</button>
    </form>
  );
}