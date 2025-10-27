import React from "react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";


const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [jobHash, setJobHash] = useState("");
  const [jobId, setJobId] = useState("");
  const [resultHash, setResultHash] = useState("");

  // Dockerization Flow
  const [modelFile, setModelFile] = useState(null);
  const [dockerizedFile, setDockerizedFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [zipCID, setZipCID] = useState("");
  const [message, setMessage] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  // Switch to Hardhat network (chainId 0x7A69)
  async function switchToHardhat() {
    if (!window.ethereum) return;
    try {
      const currentChain = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChain !== "0x7a69" && currentChain !== "0x7A69") {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7A69",
              chainName: "Hardhat Localhost",
              rpcUrls: ["http://localhost:8545"],
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      }
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  }

  // Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      await switchToHardhat();
      // small delay to allow network switch
      await new Promise((r) => setTimeout(r, 800));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setAccount(address);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      setContract(contractInstance);
      setMessage("✅ Wallet connected");
    } catch (err) {
      console.error("Connection failed:", err);
      setMessage("❌ Connection failed");
    }
  };

  // Contract functions
  const postJob = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    if (!jobHash) return alert("Please provide job IPFS hash");
    try {
      setMessage("⏳ Posting job on-chain...");
     const tx = await contract.postJob(jobHash, { value: ethers.parseEther("1") });
      await tx.wait();
      setMessage("✅ Job posted successfully!");
      setJobHash("");
      // refresh jobs after a short delay to allow event processing
      setTimeout(fetchJobs, 1200);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error posting job: " + (err?.message || err));
    }
  };

  const acceptJob = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    if (!jobId) return alert("Please provide job ID");
    try {
      setMessage("⏳ Accepting job...");
      const tx = await contract.acceptJob(jobId);
      await tx.wait();
      setMessage("✅ Job accepted!");
      setTimeout(fetchJobs, 1200);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error accepting job: " + (err?.message || err));
    }
  };

  const completeJob = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    if (!jobId || !resultHash) return alert("Please provide job ID and result hash");
    try {
      setMessage("⏳ Marking job complete on-chain...");
      const tx = await contract.completeJob(jobId, resultHash);
      await tx.wait();
      setMessage("✅ Job marked complete!");
      setResultHash("");
      setTimeout(fetchJobs, 1200);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error completing job: " + (err?.message || err));
    }
  };

  const confirmPay = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    if (!jobId) return alert("Please provide job ID");
    try {
      setMessage("⏳ Confirming & releasing payment...");
      const tx = await contract.confirmAndPay(jobId);
      await tx.wait();
      setMessage("✅ Payment released!");
      setTimeout(fetchJobs, 1200);
    } catch (err) {
      console.error(err);
      setMessage("❌ Error confirming payment: " + (err?.message || err));
    }
  };

  // Dockerize model (calls backend)
  const handleDockerize = async () => {
    if (!modelFile) return alert("Please upload a model file first!");
    const formData = new FormData();
    formData.append("file", modelFile);
    try {
      setMessage("⏳ Dockerizing model...");
      const response = await fetch("http://localhost:3000/api/dockfile/generateDockFile", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Dockerization failed");
      }
      const blob = await response.blob();
      setDockerizedFile(new File([blob], "DockerizedModel.tar.gz"));
      setMessage("✅ Model Dockerized successfully! Now upload data file.");
    } catch (err) {
      console.error("Dockerization error:", err);
      setMessage("❌ " + err.message);
    }
  };

  // Zip and upload to IPFS (backend endpoint corrected)
  const handleZipAndUpload = async () => {
    if (!dockerizedFile || !dataFile)
      return alert("Please ensure both Dockerized file and data file are ready!");
    const formData = new FormData();
    formData.append("dockerizedFile", dockerizedFile, dockerizedFile.name);
    formData.append("dataFile", dataFile);
    try{
      setMessage("📦 Zipping and uploading to IPFS...");
      const response = await fetch("http://localhost:3000/api/zipAndUpload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to upload to IPFS");
      }
      const { cid } = await response.json();
      setZipCID(cid);
      setMessage("✅ Files uploaded to IPFS. CID: " + cid);
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  // Fetch jobs from backend
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await fetch("http://localhost:3000/api/jobs");
      const data = await res.json();
      setJobs(data || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoadingJobs(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h1>🧮 Decentralized Compute Marketplace</h1>

      {!account ? (
        <button onClick={connectWallet}>🔗 Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <hr />

      <section>
        <h2>🐳 Model Dockerization</h2>

        <label>Upload model (.py):</label><br />
        <input type="file" accept=".py,.ipynb" onChange={(e) => setModelFile(e.target.files[0])} />
        <button onClick={handleDockerize}>Dockerize Model</button>

        <br /><br />

        <label>Upload data file:</label><br />
        <input type="file" onChange={(e) => setDataFile(e.target.files[0])} />
        <button onClick={handleZipAndUpload}>Zip & Upload to IPFS</button>

        {zipCID && <p>✅ IPFS CID: {zipCID}</p>}
        {message && <p>{message}</p>}
      </section>

      <hr />

      <section>
        <h2>Post Job</h2>
        <input style={{ width: "60%" }} placeholder="IPFS Job Hash (CID)" value={jobHash} onChange={(e) => setJobHash(e.target.value)} />
        <button onClick={postJob} disabled={!contract}>Post</button>
      </section>

      <hr />

      <section style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h3>Accept Job</h3>
          <input placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
          <button onClick={acceptJob} disabled={!contract}>Accept</button>
        </div>

        <div>
          <h3>Complete Job</h3>
          <input placeholder="Result IPFS Hash" value={resultHash} onChange={(e) => setResultHash(e.target.value)} />
          <button onClick={completeJob} disabled={!contract}>Complete</button>
        </div>

        <div>
          <h3>Confirm & Pay</h3>
          <input placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
          <button onClick={confirmPay} disabled={!contract}>Confirm & Pay</button>
        </div>
      </section>

      <hr />

      <section>
        <h2>Available Jobs</h2>
        <button onClick={fetchJobs}>Refresh Jobs</button>
        {loadingJobs ? <p>Loading...</p> : (
          <table border="1" cellPadding="8" style={{ marginTop: "1rem", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Status</th>
                <th>Client</th>
                <th>Price (wei)</th>
                <th>Job Hash</th>
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 && <tr><td colSpan="5">No jobs found</td></tr>}
              {jobs.map((j) => (
                <tr key={j.jobId}>
                  <td>{j.jobId}</td>
                  <td>{j.status}</td>
                  <td style={{ fontFamily: "monospace" }}>{j.client}</td>
                  <td>{j.price || j.reward || "-"}</td>
                  <td style={{ fontFamily: "monospace" }}>{j.jobHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default App;
