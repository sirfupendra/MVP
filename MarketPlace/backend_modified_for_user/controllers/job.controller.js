const Job = require('../models/job.model');

/**
 * Get all jobs
 */
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get jobs by status
 */
const getJobsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const jobs = await Job.find({ status }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get single job by ID
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({ jobId: req.params.id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllJobs,
  getJobsByStatus,
  getJobById
};