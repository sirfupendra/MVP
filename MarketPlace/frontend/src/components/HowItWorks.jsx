import React from "react";

const steps = [
  {
    title: "Phase 1 — Foundation",
    desc: "Deploy smart contract, run local IPFS and message broker. This is the rules & escrow."
  },
  {
    title: "Phase 2 — Control Plane",
    desc: "Backend coordinates jobs, splits data, uploads chunks to IPFS and queues tasks for providers."
  },
  {
    title: "Phase 3 — Provider Daemon",
    desc: "GPU providers run a small daemon/CLI that consumes jobs, runs docker containers, uploads weights to IPFS."
  },
  {
    title: "Phase 4 — Aggregation",
    desc: "Backend collects weights, runs FedAvg, evaluates and iterates if needed."
  },
  {
    title: "Phase 5 — Finalize & Payout",
    desc: "Final model uploaded to IPFS, client confirms and smart contract releases payment."
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="how container">
      <h2>How it works — 5 phases</h2>
      <div className="steps">
        {steps.map((s, i) => (
          <div key={i} className="step">
            <div className="step-number">{i + 1}</div>
            <div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
