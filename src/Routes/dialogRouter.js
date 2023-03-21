const authMiddleware = require('./../middleware/auth-middleware');
const express = require('express');
const DialogController = require('../controllers/DialogController');
const router = express.Router();
router.post('/create', DialogController.createDialog);
router.post('/getDialogById', DialogController.getDialogsById);
router.get('/getdialogs', DialogController.getAllDialogs);
module.exports = router;
