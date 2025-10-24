import { useState } from "react";
import { ethers } from "ethers";
import abi from "./abi.json";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [jobHash, setJobHash] = useState("");
  const [jobId, setJobId] = useState("");
  const [resultHash, setResultHash] = useState("");

  // 🧩 New States for Dockerization Flow
  const [modelFile, setModelFile] = useState(null);
  const [dockerizedFile, setDockerizedFile] = useState(null);
  const [dataFile, setDataFile] = useState(null);
  const [zipCID, setZipCID] = useState("");
  const [message, setMessage] = useState("");

  // 🔁 Ensure MetaMask is connected to Hardhat Localhost
  async function switchToHardhat() {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }
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
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      }
    } catch (error) {
      console.error("❌ Failed to switch network:", error);
    }
  }

  // 🔗 Connect Wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      await switchToHardhat();
      await new Promise((res) => setTimeout(res, 1000));
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setAccount(address);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
      setContract(contractInstance);
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  // -----------------------
  // 🧮 Contract Functions
  // -----------------------
  const postJob = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    try {
      const tx = await contract.postJob(jobHash, { value: ethers.parseEther("1") });
      await tx.wait();
      alert("✅ Job posted successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Error posting job");
    }
  };

  const acceptJob = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    try {
      const tx = await contract.acceptJob(jobId);
      await tx.wait();
      alert("✅ Job accepted!");
    } catch (err) {
      console.error(err);
      alert("❌ Error accepting job");
    }
  };

  const completeJob = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    try {
      const tx = await contract.completeJob(jobId, resultHash);
      await tx.wait();
      alert("✅ Job completed!");
    } catch (err) {
      console.error(err);
      alert("❌ Error completing job");
    }
  };

  const confirmPay = async () => {
    if (!contract) return alert("Please connect your wallet first!");
    try {
      const tx = await contract.confirmAndPay(jobId);
      await tx.wait();
      alert("✅ Payment released!");
    } catch (err) {
      console.error(err);
      alert("❌ Error confirming payment");
    }
  };

  // -----------------------
  // 🐳 Dockerization Flow
  // -----------------------

  // Step 1: Upload model file and get Dockerized version
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Dockerization failed");
      }

      const blob = await response.blob();
      setDockerizedFile(blob);
      setMessage("✅ Model Dockerized successfully! Now upload data file.");
    } catch (err) {
      console.error("❌ Dockerization error:", err);
      setMessage("❌ " + err.message);
    }
  };

  // Step 2: Upload data file, zip both, and send to backend for IPFS upload
  const handleZipAndUpload = async () => {
    if (!dockerizedFile || !dataFile)
      return alert("Please ensure both Dockerized file and data file are ready!");

    const formData = new FormData();
    formData.append("dockerizedFile", dockerizedFile, "Dockerfile");
    formData.append("dataFile", dataFile);

    try {
      setMessage("📦 Zipping and uploading to IPFS...");
      const response = await fetch("http://localhost:3000/api/zipAndUpload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload to IPFS");
      }

      const { cid } = await response.json();
      setZipCID(cid);
      setMessage("✅ Files uploaded to IPFS. CID: " + cid);
    } catch (err) {
      console.error(err);
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🧮 Decentralized Compute Marketplace</h1>

      {!account ? (
        <button onClick={connectWallet}>🔗 Connect Wallet</button>
      ) : (
        <p>Connected: {account}</p>
      )}

      <hr />

      {/* 🧠 MODEL DOCKERIZATION SECTION */}
      <h2>🐳 Model Dockerization</h2>

      <input type="file" accept=".py" onChange={(e) => setModelFile(e.target.files[0])} />
      <button onClick={handleDockerize}>Dockerize Model</button>

      <br /><br />

      <input type="file" onChange={(e) => setDataFile(e.target.files[0])} />
      <button onClick={handleZipAndUpload}>Zip & Upload to IPFS</button>

      {zipCID && <p>✅ IPFS CID: {zipCID}</p>}
      {message && <p>{message}</p>}

      <hr />

      {/* Existing Blockchain Job System */}
      <h2>Post Job</h2>
      <input placeholder="IPFS Job Hash" value={jobHash} onChange={(e) => setJobHash(e.target.value)} />
      <button onClick={postJob} disabled={!contract}>Post</button>

      <hr />

      <h2>Accept Job</h2>
      <input placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
      <button onClick={acceptJob} disabled={!contract}>Accept</button>

      <hr />

      <h2>Complete Job</h2>
      <input placeholder="Result IPFS Hash" value={resultHash} onChange={(e) => setResultHash(e.target.value)} />
      <button onClick={completeJob} disabled={!contract}>Complete</button>

      <hr />

      <h2>Confirm & Pay</h2>
      <input placeholder="Job ID" value={jobId} onChange={(e) => setJobId(e.target.value)} />
      <button onClick={confirmPay} disabled={!contract}>Confirm & Pay</button>
    </div>
  );
}

export default App;