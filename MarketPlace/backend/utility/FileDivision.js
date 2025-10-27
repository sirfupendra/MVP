// Utility function to divide a file buffer into chunks
const divideFile = (fileBuffer, chunkSize) => {
    const fileChunks = [];
    for (let i = 0; i < fileBuffer.length; i += chunkSize) {
        fileChunks.push(fileBuffer.slice(i, i + chunkSize));
    }
    return fileChunks;
};

module.exports = { divideFile };
