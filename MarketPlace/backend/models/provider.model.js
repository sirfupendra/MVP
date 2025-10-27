import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema({
  providerId: { type: String, required: true, unique: true }, // wallet address
  name: { type: String },
  email: { type: String },
  gpuModel: { type: String, required: true },
  gpuMemoryGB: { type: Number },
  location: { type: String },
  ip: { type: String },
  status: { type: String, enum: ['Available','Busy','Offline'], default: 'Available' },
  totalJobsCompleted: { type: Number, default: 0 },
  ratings: { type: Number, default: 5 },
  joinedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Provider', providerSchema);
