const fs = require('fs');
const path = require('path');
const { generateRequirementsFile, generateDockerFile } = require('../services/dockfile.service');

exports.generateDockFile = async (req, res) => {
  try {
    // ✅ 1. Validate file upload
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const uploadedFilePath = path.resolve(file.path);

    // ✅ 2. Generate requirements.txt from the uploaded Python file
    const [requirements,requirementsFilePath]  = await generateRequirementsFile(uploadedFilePath);
    console.log('[INFO] Requirements file generated:', requirements);

    // ✅ 3. Generate Dockerfile using the requirements
    const dockerFilePath = await generateDockerFile(requirements, uploadedFilePath);
    console.log('[INFO] Dockerfile generated at:', dockerFilePath);

    // ✅ 4. Read Dockerfile content safely
    if (!fs.existsSync(dockerFilePath)) {
      throw new Error('Dockerfile generation failed: file not found.');
    }

    const dockerBuffer = fs.readFileSync(dockerFilePath);

    // ✅ 5. Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename="Dockerfile"');
    res.setHeader('Content-Type', 'text/plain');

    // ✅ 6. Send the file buffer to the client
    res.status(200).send(dockerBuffer);

    // ✅ 7. (Optional) Cleanup temporary files after sending
    setTimeout(() => {
      [uploadedFilePath, requirementsFilePath, dockerFilePath].forEach(f => {
         fs.unlink(f, err => {
           if (err) console.warn('[WARN] Temp file cleanup failed for', f);
        });
      });
    }, 5000);

  } catch (error) {
    console.error('[ERROR] Dockerfile generation failed:', error.message);
    res.status(500).json({
      error: 'Dockerfile generation failed',
      details: error.message,
    });
  }
};
