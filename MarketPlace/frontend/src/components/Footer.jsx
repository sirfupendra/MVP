import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div>© {new Date().getFullYear()} Decentralized Compute Marketplace</div>
        <div className="muted">Built for learning distributed training & on-chain payments</div>
      </div>
    </footer>
  );
}
