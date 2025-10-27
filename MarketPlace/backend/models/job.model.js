const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: { type: String, required: true, unique: true },
  client: { type: String },
  modelHash: { type: String },
  reward: { type: String },
  status: { type: String, enum: ['Pending','In Progress','Completed','Awaiting Confirmation','Paid'], default: 'Pending' },
  acceptedBy: { type: String, default: null },
  resultHash: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports= mongoose.model('Job', jobSchema);
