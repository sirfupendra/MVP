import React, { useState } from "react";

/**
 * Simple provider signup form.
 * In a full app, submit to backend endpoint like POST /api/provider/register
 */
export default function ProviderForm() {
  const [form, setForm] = useState({
    name: "",
    gpuModel: "",
    endpoint: "",
    pricePerJob: "",
  });
  const [status, setStatus] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    try {
      // Placeholder — replace with actual POST to your backend
      // await fetch("/api/provider/register", { method: "POST", body: JSON.stringify(form) })
      setTimeout(() => setStatus("Registered (mock). Your provider is now 'Available'."), 800);
    } catch (err) {
      setStatus("Error registering provider.");
      console.error(err);
    }
  };

  return (
    <section id="provider" className="provider container">
      <h2>Join as a GPU Provider</h2>
      <p className="muted">Tell us about your GPU & how to reach you — your daemon will consume jobs from our queue.</p>
      <form className="provider-form" onSubmit={submit}>
        <input placeholder="Provider name / alias" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
        <input placeholder="GPU model (e.g., RTX 4090)" value={form.gpuModel} onChange={(e)=>setForm({...form,gpuModel:e.target.value})} required />
        <input placeholder="Public endpoint / returnUrl" value={form.endpoint} onChange={(e)=>setForm({...form,endpoint:e.target.value})} required />
        <input placeholder="Price per job (ETH)" value={form.pricePerJob} onChange={(e)=>setForm({...form,pricePerJob:e.target.value})} />
        <div className="form-actions">
          <button className="btn primary" type="submit">Register</button>
          <span className="muted">{status}</span>
        </div>
      </form>
    </section>
  );
}
