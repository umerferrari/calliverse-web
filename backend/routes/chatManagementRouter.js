const express = require("express");
const router = express.Router();
const upload = require("../middleware/file-upload");
const { createChat } = require("../controller/chatManagementController");
const { auth, authorizeRoles } = require("../middleware/authentication");

router.post("/createChat", createChat);

module.exports = router;
