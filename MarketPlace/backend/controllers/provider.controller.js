import Provider from '../models/provider.model.js';

export const registerProvider = async (req, res) => {
  try {
    const { providerId, name, email, gpuModel, gpuMemoryGB, location, ip } = req.body;
    if (!providerId || !gpuModel) return res.status(400).json({ message: 'providerId and gpuModel are required' });

    const existing = await Provider.findOne({ providerId });
    if (existing) return res.status(400).json({ message: 'Provider already registered' });

    const provider = new Provider({ providerId, name, email, gpuModel, gpuMemoryGB, location, ip, status: 'Available' });
    await provider.save();
    res.status(201).json({ message: 'Provider registered successfully', provider });
  } catch (err) {
    console.error('registerProvider error', err);
    res.status(500).json({ message: 'Error registering provider', error: err.message });
  }
};

export const getAvailableProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ status: 'Available' });
    res.json(providers);
  } catch (err) {
    console.error('getAvailableProviders error', err);
    res.status(500).json({ message: err.message });
  }
};
