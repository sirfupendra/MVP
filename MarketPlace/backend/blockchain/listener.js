import dotenv from "dotenv";
import { ethers } from "ethers";
import Job from "../models/job.model.js";

dotenv.config();

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
let CONTRACT_ABI = [];

try {
  CONTRACT_ABI = JSON.parse(process.env.CONTRACT_ABI || "[]");
} catch (e) {
  console.error("Failed to parse CONTRACT_ABI from .env:", e.message);
}

if (!RPC_URL || !CONTRACT_ADDRESS) {
  console.warn("⚠️ RPC_URL or CONTRACT_ADDRESS missing in .env — listener disabled");
} else {
  const setupEventListeners = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      console.log(`✅ Listening to contract ${CONTRACT_ADDRESS}...`);

      // ---- JobPosted ----
      contract.addListener("JobPosted", async (jobId, client, price, jobHash) => {
        try {
          const id = jobId.toString();
          console.log(`📦 New JobPosted: ID=${id}, client=${client}, price=${price.toString()}`);

          await Job.updateOne(
            { jobId: id },
            {
              $set: {
                client,
                price: price.toString(),
                jobHash,
                status: "Pending",
                createdAt: new Date(),
              },
            },
            { upsert: true }
          );
        } catch (err) {
          console.error("JobPosted handler error:", err);
        }
      });

      // ---- JobAccepted ----
      contract.addListener("JobAccepted", async (jobId, providerAddr) => {
        try {
          const id = jobId.toString();
          console.log(`🧑‍💻 JobAccepted: jobId=${id}, provider=${providerAddr}`);

          await Job.updateOne(
            { jobId: id },
            { $set: { acceptedBy: providerAddr, status: "In Progress" } }
          );
        } catch (err) {
          console.error("JobAccepted handler error:", err);
        }
      });

      // ---- JobCompleted ----
      contract.addListener("JobCompleted", async (jobId, resultHash) => {
        try {
          const id = jobId.toString();
          console.log(`✅ JobCompleted: jobId=${id}, resultHash=${resultHash}`);

          await Job.updateOne(
            { jobId: id },
            { $set: { resultHash, status: "Completed" } }
          );
        } catch (err) {
          console.error("JobCompleted handler error:", err);
        }
      });

      // ---- JobPaid ----
      contract.addListener("JobPaid", async (jobId) => {
        try {
          const id = jobId.toString();
          console.log(`💰 JobPaid: jobId=${id}`);

          await Job.updateOne({ jobId: id }, { $set: { status: "Paid" } });
        } catch (err) {
          console.error("JobPaid handler error:", err);
        }
      });

    } catch (error) {
      console.error("Failed to setup event listeners:", error);
      // Retry after 5 seconds
      setTimeout(setupEventListeners, 5000);
    }
  };

  // Start listening
  setupEventListeners();
}