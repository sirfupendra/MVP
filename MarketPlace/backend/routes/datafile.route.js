const express= require('express');
const router= express.Router();


const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const datafileController= require('../controllers/datafile.controller');

router.post('/divideAndUploadFileChunksTOIPFS',upload.single('file'),datafileController.DivideAndUploadFileChunksToIPFS);

module.exports= router;