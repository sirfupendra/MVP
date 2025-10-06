const express = require('express');
const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const dockfileController = require('../controllers/dockfile.controller');


router.post('/generateDockFile',upload.single('file'), dockfileController.generateDockFile);

module.exports = router;