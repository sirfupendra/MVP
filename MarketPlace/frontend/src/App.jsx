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
      // Only log, don't alert repeatedly
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
      // Ensure on Hardhat network
      await switchToHardhat();
      await new Promise((res) => setTimeout(res, 1000));
      // Request account access
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];
      setAccount(address);
      // Create signer and contract instance
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, signer);
      setContract(contractInstance);
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  // ...rest of your code (contract functions and JSX)...

  // 🧮 Contract Functions
  const postJob = async () => {
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }
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
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }
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
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }
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
    if (!contract) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      const tx = await contract.confirmAndPay(jobId);
      await tx.wait();
      alert("✅ Payment released!");
    } catch (err) {
      console.error(err);
      alert("❌ Error confirming payment");
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

      <h2>Post Job</h2>
      <input
        placeholder="IPFS Job Hash"
        value={jobHash}
        onChange={(e) => setJobHash(e.target.value)}
      />
      <button onClick={postJob} disabled={!contract}>Post</button>

      <hr />

      <h2>Accept Job</h2>
      <input
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />
      <button onClick={acceptJob} disabled={!contract}>Accept</button>

      <hr />

      <h2>Complete Job</h2>
      <input
        placeholder="Result IPFS Hash"
        value={resultHash}
        onChange={(e) => setResultHash(e.target.value)}
      />
      <button onClick={completeJob} disabled={!contract}>Complete</button>

      <hr />

      <h2>Confirm & Pay</h2>
      <input
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
      />
      <button onClick={confirmPay} disabled={!contract}>Confirm & Pay</button>
    </div>
  );
}

export default App;