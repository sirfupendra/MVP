import React, { useState } from "react";
import { ethers } from "ethers";
import abi from "../abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function Marketplace() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  // job blockchain fields
  const [jobHash, setJobHash] = useState("");
  const [jobId, setJobId] = useState("");
  const [resultHash, setResultHash] = useState("");

  // dockerization flow files
  const [modelFile, setModelFile] = useState(null);
  const [dockerizedFile, setDockerizedFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [zipCID, setZipCID] = useState("");
  const [message, setMessage] = useState("");

  // wallet + provider
  async function switchToHardhat() {
    if (!window.ethereum) { alert("MetaMask not found!"); return; }
    try {
      const currentChain = await window.ethereum.request({ method: "eth_chainId" });
      if (currentChain !== "0x7a69" && currentChain !== "0x7A69") {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x7A69",
            chainName: "Hardhat Localhost",
            rpcUrls: ["http://localhost:8545"],
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          }],
        });
      }
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  }

  const connectWallet = async () => {
    if (!window.ethereum) { alert("Please install MetaMask!"); return; }
    try {
      await switchToHardhat();
      // small wait to allow metamask to switch
      await new Promise(r => setTimeout(r, 600));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setAccount(address);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
      setContract(contractInstance);
    } catch (err) {
      console.error("Connection failed:", err);
      alert("Connection failed — see console.");
    }
  };

  // Contract actions (kept same semantics)
  const postJob = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.postJob(jobHash, { value: ethers.parseEther("1") });
      await tx.wait();
      alert("Job posted!");
    } catch (err) {
      console.error(err); alert("Error posting job");
    }
  };

  const acceptJob = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.acceptJob(jobId);
      await tx.wait();
      alert("Job accepted!");
    } catch (err) {
      console.error(err); alert("Error accepting job");
    }
  };

  const completeJob = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.completeJob(jobId, resultHash);
      await tx.wait();
      alert("Job completed!");
    } catch (err) {
      console.error(err); alert("Error completing job");
    }
  };

  const confirmPay = async () => {
    if (!contract) return alert("Connect wallet first!");
    try {
      const tx = await contract.confirmAndPay(jobId);
      await tx.wait();
      alert("Payment released!");
    } catch (err) {
      console.error(err); alert("Error confirming payment");
    }
  };

  // Dockerization flow
  const handleDockerize = async () => {
    if (!modelFile) return alert("Upload model file first!");
    const formData = new FormData();
    formData.append("file", modelFile);
    try {
      setMessage("Dockerizing model...");
      const response = await fetch("http://localhost:3000/api/dockfile/generateDockFile", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Dockerization failed");
      }
      const blob = await response.blob();
      setDockerizedFile(blob);
      setMessage("Model dockerized — ready to zip & upload.");
    } catch (err) {
      console.error(err);
      setMessage("Dockerize error: " + err.message);
    }
  };

  const handleZipAndUpload = async () => {
    if (!dockerizedFile || !dataFile) return alert("Ensure dockerized file and data file are ready!");
    const formData = new FormData();
    formData.append("dockerizedFile", dockerizedFile, "Dockerfile");
    formData.append("dataFile", dataFile);
    try {
      setMessage("Zipping & uploading to IPFS...");
      const response = await fetch("http://localhost:3000/api/zipAndUpload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "IPFS upload failed");
      }
      const { cid } = await response.json();
      setZipCID(cid);
      setMessage("Uploaded to IPFS. CID: " + cid);
    } catch (err) {
      console.error(err);
      setMessage("Upload error: " + err.message);
    }
  };

  return (
    <section id="market" className="market container">
      <h2>Marketplace — Post / Accept / Complete Jobs</h2>

      <div className="wallet-row">
        {!account ? (
          <button className="btn primary" onClick={connectWallet}>Connect Wallet</button>
        ) : (
          <div className="connected">
            <small className="muted">Connected</small>
            <div className="acct">{account}</div>
          </div>
        )}
      </div>

      <div className="grid two-col">

        <div className="card">
          <h3>Model Dockerization → IPFS</h3>
          <p className="muted">Upload your model, dockerize (server), upload with data to IPFS.</p>

          <label className="file">
            <span>Model (.py)</span>
            <input type="file" accept=".py,.ipynb" onChange={(e) => setModelFile(e.target.files[0])} />
          </label>
          <button className="btn" onClick={handleDockerize}>Dockerize Model</button>

          <label className="file">
            <span>Data file (csv, zip)</span>
            <input type="file" onChange={(e) => setDataFile(e.target.files[0])} />
          </label>
          <button className="btn" onClick={handleZipAndUpload}>Zip & Upload to IPFS</button>

          {zipCID && <p className="result">IPFS CID: <code>{zipCID}</code></p>}
          {message && <p className="muted">{message}</p>}
        </div>

        <div className="card">
          <h3>Blockchain Job Actions</h3>
          <div className="form">
            <input placeholder="IPFS Job Hash" value={jobHash} onChange={(e)=>setJobHash(e.target.value)} />
            <button className="btn" onClick={postJob} disabled={!contract}>Post Job (1 ETH)</button>

            <hr />

            <input placeholder="Job ID" value={jobId} onChange={(e)=>setJobId(e.target.value)} />
            <button className="btn" onClick={acceptJob} disabled={!contract}>Accept Job</button>

            <hr />

            <input placeholder="Result IPFS Hash" value={resultHash} onChange={(e)=>setResultHash(e.target.value)} />
            <button className="btn" onClick={completeJob} disabled={!contract}>Complete Job</button>

            <hr />

            <input placeholder="Job ID (confirm)" value={jobId} onChange={(e)=>setJobId(e.target.value)} />
            <button className="btn primary" onClick={confirmPay} disabled={!contract}>Confirm & Pay</button>
          </div>
        </div>
      </div>
    </section>
  );
}
