import React from "react";

export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <h1>Decentralized Compute</h1>
          <span className="muted">AI Marketplace</span>
        </div>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#market">Marketplace</a>
          <a href="#provider">Join as Provider</a>
        </nav>
      </div>
    </header>
  );
}
