// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ComputeMarketplaceMVP
 * @dev A minimal contract to handle job posting, escrow, and payment.
 * NOTE: For an MVP, we skip complex verification (like ZKPs) and rely on
 * client confirmation.
 */
contract ComputeMarketplaceMVP {
    address payable public owner;
    uint256 public nextJobId = 1;
    uint256 public constant COMMISSION_RATE = 5; // 5% commission for the platform

    constructor() payable {
        owner = payable(msg.sender);
    }

    enum JobStatus { Pending, Assigned, Complete, Paid }

    struct Job {
        uint256 id;
        address payable client;
        address payable provider;
        uint256 price; // The total amount paid by the client
        uint256 fee;   // Commission amount
        string jobHash; // IPFS hash of the job/model files
        string resultHash; // IPFS hash of the output results
        JobStatus status;
    }

    mapping(uint256 => Job) public jobs;

    event JobPosted(uint256 indexed jobId, address client, uint256 price, string jobHash);
    event JobAccepted(uint256 indexed jobId, address provider);
    event JobCompleted(uint256 indexed jobId, string resultHash);
    event JobPaid(uint256 indexed jobId);

    // --- Core Functions ---

    /**
     * @dev Allows a client to post a new computation job.
     * @param _jobHash The IPFS hash pointing to the AI job files (code/data).
     */
    function postJob(string memory _jobHash) public payable {
        require(msg.value > 0, "Price must be greater than zero");

        Job storage newJob = jobs[nextJobId];
        newJob.id = nextJobId;
        newJob.client = payable(msg.sender);
        newJob.price = msg.value;
        newJob.fee = (msg.value * COMMISSION_RATE) / 100; // Calculate 5% fee
        newJob.jobHash = _jobHash;
        newJob.status = JobStatus.Pending;

        emit JobPosted(nextJobId, msg.sender, msg.value, _jobHash);
        nextJobId++;
    }

    /**
     * @dev Allows a compute provider to accept a pending job.
     * @param _jobId The ID of the job to accept.
     */
    function acceptJob(uint256 _jobId) public {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Pending, "Job is not pending");

        job.provider = payable(msg.sender);
        job.status = JobStatus.Assigned;

        emit JobAccepted(_jobId, msg.sender);
    }

    /**
     * @dev Allows the current provider to mark a job as complete.
     * @param _jobId The ID of the job.
     * @param _resultHash The IPFS hash pointing to the output result files.
     */
    function completeJob(uint256 _jobId, string memory _resultHash) public {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Assigned, "Job is not assigned to you");
        require(job.provider == msg.sender, "Only the assigned provider can complete the job");

        job.resultHash = _resultHash;
        job.status = JobStatus.Complete;

        emit JobCompleted(_jobId, _resultHash);
    }

    /**
     * @dev Allows the client to confirm the result and release payment.
     * NOTE: This is the critical "trust" step in the MVP.
     * @param _jobId The ID of the job.
     */
    function confirmAndPay(uint256 _jobId) public {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Complete, "Job is not ready for payment");
        require(job.client == msg.sender, "Only the client can confirm and pay");

        uint256 payout = job.price - job.fee;

        // 1. Send the commission (fee) to the platform owner
        (bool feeSuccess, ) = owner.call{value: job.fee}("");
        require(feeSuccess, "Fee transfer failed");

        // 2. Send the rest of the payment to the provider
        (bool providerSuccess, ) = job.provider.call{value: payout}("");
        require(providerSuccess, "Provider payment failed");

        job.status = JobStatus.Paid;

        emit JobPaid(_jobId);
    }

    // Fallback function to allow the contract to receive funds
    receive() external payable {}
}
