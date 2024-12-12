const express = require('express');
const router = express.Router();
const upload = require('../middleware/user-profile-file-upload'); 


const { createUserController, login, forgotPassword, resetPassword, verifyEmailCode, resendVerificationCode ,updateUserProfileController} = require('../controller/userManagementController');
const { auth, authorizeRoles } = require('../middleware/authentication');

router.post('/createUser', createUserController);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);
router.post('/verifyEmailCode', verifyEmailCode);
router.post('/resendVerificationCode', resendVerificationCode);
router.patch('/update-profile/:userId', upload.single('profileImage'), updateUserProfileController);


module.exports = router;