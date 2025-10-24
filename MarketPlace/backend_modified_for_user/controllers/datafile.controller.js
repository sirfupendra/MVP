const { divideFile } = require('../utility/FileDivision');
const fs = require('fs');

exports.DivideAndUploadFileChunksToIPFS = async (req, res) => {
    try {
        const file = req.file;
        const { chunksize } = req.body;

        if (!file) {
            return res.status(400).json({ message: "File is required" });
        }

        const chunkSize = parseInt(chunksize);
        if (!chunkSize || isNaN(chunkSize) || chunkSize <= 0) {
            return res.status(400).json({ message: "Valid chunksize is required" });
        }

        // Use the buffer data from multer
        
const fileBuffer = fs.readFileSync(file.path);
const fileChunks = divideFile(fileBuffer, chunkSize);

        

        return res.status(200).json({
            message: "File divided successfully",
            totalChunks: fileChunks.length,
            chunksArray:fileChunks
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
};
