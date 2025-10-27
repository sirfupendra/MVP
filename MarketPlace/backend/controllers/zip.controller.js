const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

exports.zipAndUploadToIPFS = async (req, res) => {
  try {
    const dockerFile = req.files["dockerizedFile"]?.[0];
    const dataFile = req.files["dataFile"]?.[0];

    if (!dockerFile || !dataFile) {
      return res.status(400).json({ error: "Both dockerizedFile and dataFile are required." });
    }

    // ✅ Create a zip file
    const zipPath = path.join("uploads", `package_${Date.now()}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.file(dockerFile.path, { name: "Dockerfile" });
    archive.file(dataFile.path, { name: dataFile.originalname });
    await archive.finalize();

    await new Promise((resolve) => output.on("close", resolve));

    // ✅ Upload to Pinata
    const pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const fileStream = fs.createReadStream(zipPath);
    const formData = new FormData();
    formData.append("file", fileStream, "package.zip");

    const response = await axios.post(pinataUrl, formData, {
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`, // 🔑 Add your JWT from Pinata
        ...formData.getHeaders(),
      },
    });

    const cid = response.data.IpfsHash;
    console.log("✅ Uploaded to IPFS:", cid);

    res.json({ cid });

    // 🧹 Cleanup
    [dockerFile.path, dataFile.path, zipPath].forEach((p) => {
      fs.unlink(p, (err) => {
        if (err) console.warn("⚠️ Cleanup failed for", p);
      });
    });
  } catch (error) {
    console.error("❌ IPFS upload error:", error.message);
    res.status(500).json({ error: "IPFS upload failed", details: error.message });
  }
};
