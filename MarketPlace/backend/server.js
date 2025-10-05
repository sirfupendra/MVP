const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Handles file uploads
const path = require('path');
const fs = require('fs'); // To manage the uploads directory

const app = express();
const port = 3001;

// --- Setup for file uploads (Multer) ---
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Use the current timestamp and original name to create a unique ID
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- Mock Database (MongoDB Simulation) ---
const mockDB = {
    providers: {},
    jobs: {},
    jobIdCounter: 1,
    marketplaceCommissionRate: 0.05 // 5%
};

// --- Middleware ---
app.use(cors());
app.use(express.json());
// Endpoint to serve uploaded files for the provider (simulated download)
app.use('/uploads', express.static(UPLOAD_DIR)); 

// --- Core Mock Blockchain Functions (Simplified) ---

const mockBlockchain = {
    registerProvider: (address, name, price) => {
        if (mockDB.providers[address]) return { error: 'Provider already registered.' };
        mockDB.providers[address] = { address, name, price, isActive: true };
        return mockDB.providers[address];
    },

    // Now uses the unique filename as the payload ID
    submitJob: (requester, budget, jobPayloadId) => {
        const providersList = Object.values(mockDB.providers).filter(p => p.isActive);
        if (providersList.length === 0) return { error: 'No active providers available.' };
        
        const assignedProvider = providersList[0];
        const finalPrice = assignedProvider.price;
        
        if (finalPrice > budget) return { error: 'Provider price exceeds budget.' };

        const jobId = mockDB.jobIdCounter++;
        
        const newJob = {
            jobId,
            requester,
            budget,
            agreedPrice: finalPrice,
            providerAddress: assignedProvider.address,
            jobPayloadId, // The unique filename from the upload
            status: 'Assigned',
            timestamp: Date.now(),
        };
        
        mockDB.jobs[jobId] = newJob;
        return newJob;
    },

    completeJob: (jobId, providerAddress) => {
        const job = mockDB.jobs[jobId];
        if (!job) return { error: 'Job not found.' };
        if (job.providerAddress !== providerAddress) return { error: 'Unauthorized provider.' };
        if (job.status !== 'Assigned') return { error: 'Job already completed.' };

        // Simulate payment calculation
        const agreedPrice = job.agreedPrice;
        const commission = agreedPrice * mockDB.marketplaceCommissionRate;
        const paymentToProvider = agreedPrice - commission;

        job.status = 'Completed';
        job.payment = paymentToProvider;
        job.commission = commission;

        return job;
    }
};

// --- MERN API Endpoints ---

// 1. **NEW: File Upload Endpoint** (Requester Action)
app.post('/api/upload-job-payload', upload.single('jobPayload'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    // Return the filename (which acts as the unique Payload ID/Hash for the contract)
    res.send({ 
        message: 'File uploaded successfully.', 
        jobPayloadId: req.file.filename,
        // Provide the download link for the Provider to use
        downloadUrl: `http://localhost:${port}/uploads/${req.file.filename}`
    });
});

// 2. Register Provider
app.post('/api/register-provider', (req, res) => {
    const { address, name, price } = req.body;
    const result = mockBlockchain.registerProvider(address, name, price);
    if (result.error) return res.status(400).send(result);
    res.send(result);
});

// 3. Submit Job (Now uses the payload ID from the file upload)
app.post('/api/submit-job', (req, res) => {
    const { requesterAddress, budget, jobPayloadId } = req.body;
    if (!jobPayloadId) {
        return res.status(400).send({ error: "Job Payload ID is missing. Please upload your file first." });
    }
    
    // Simulate passing the Payload ID to the smart contract logic
    const result = mockBlockchain.submitJob(requesterAddress, budget, jobPayloadId);
    if (result.error) return res.status(400).send(result);
    res.send(result);
});

// 4. Get User Jobs (Includes provider tasks with the download URL)
app.get('/api/jobs/:address', (req, res) => {
    const userAddress = req.params.address;
    const allJobs = Object.values(mockDB.jobs);
    
    const jobsAsRequester = allJobs.filter(j => j.requester === userAddress);
    const jobsAsProvider = allJobs.filter(j => j.providerAddress === userAddress);

    // This simulates the CLI's view: assigned, pending execution
    const providerTasks = allJobs
        .filter(j => j.providerAddress === userAddress && j.status === 'Assigned')
        .map(job => ({
            jobId: job.jobId,
            requester: job.requester,
            agreedPrice: job.agreedPrice,
            jobPayloadId: job.jobPayloadId,
            // Provide the actual download link for the provider's CLI to use
            downloadUrl: `http://localhost:${port}/uploads/${job.jobPayloadId}` 
        }));

    res.send({ 
        asRequester: jobsAsRequester.sort((a,b) => b.jobId - a.jobId), 
        asProvider: jobsAsProvider.sort((a,b) => b.jobId - a.jobId),
        providerTasks: providerTasks.sort((a,b) => b.jobId - a.jobId)
    });
});

// 5. Mark Job as Complete
app.post('/api/complete-job', (req, res) => {
    const { jobId, providerAddress } = req.body;
    const result = mockBlockchain.completeJob(jobId, providerAddress);
    if (result.error) return res.status(400).send(result);
    res.send(result);
});

// 6. Get all providers
app.get('/api/providers', (req, res) => {
    res.send(Object.values(mockDB.providers));
});

app.listen(port, () => {
    console.log(`API Gateway (server.js) running at http://localhost:${port}`);
    console.log(`Uploads are saved to: ${UPLOAD_DIR}`);
});
