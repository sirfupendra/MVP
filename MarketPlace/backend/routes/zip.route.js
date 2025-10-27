const express = require("express");
const multer = require("multer");
const { zipAndUploadToIPFS } = require("../controllers/zip.controller");

const router = express.Router();

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

router.post(
  "/zipAndUpload",
  upload.fields([
    { name: "dockerizedFile", maxCount: 1 },
    { name: "dataFile", maxCount: 1 },
  ]),
  zipAndUploadToIPFS
);

module.exports = router;
