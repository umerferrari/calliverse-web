const express = require('express');
const router = express.Router();
const upload = require('../middleware/file-upload'); 
const {newMessage,uploadFiles}=require('../controller/messageManagementController')
const { auth, authorizeRoles } = require('../middleware/authentication');

router.post('/upload', upload.array('media'), uploadFiles); 
router.post('/createMessage', upload.array('files', 5), newMessage);


module.exports = router;