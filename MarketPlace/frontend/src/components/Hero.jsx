import React from "react";

export default function Hero() {
  return (
    <section className="hero container">
      <div className="hero-left">
        <h2>Train models using remote GPUs — trustlessly and on-chain.</h2>
        <p className="lead">
          Submit your model & data, dispatch work to GPU providers, aggregate results (FedAvg),
          and pay via a smart contract escrow when you're satisfied.
        </p>
        <div className="cta-row">
          <a href="#market" className="btn primary">Post a Job</a>
          <a href="#provider" className="btn ghost">Become a Provider</a>
        </div>
        <ul className="kpis">
          <li><strong>Escrow payments</strong><span>On-chain trust</span></li>
          <li><strong>IPFS</strong><span>Immutable model & data storage</span></li>
          <li><strong>Federated</strong><span>Distributed training</span></li>
        </ul>
      </div>
      <div className="hero-right">
        <div className="card">
          <h3>Current Status</h3>
          <p>Local Hardhat / IPFS / Queue ready — connect wallet to start.</p>
        </div>
      </div>
    </section>
  );
}
