const express = require('express');
const MessageController = require('../controllers/MessageController');

const authMiddleware = require('./../middleware/auth-middleware');

const router = express.Router();

router.post('/createMessage', MessageController.createMessage);
router.post('/getMessagesByDialogId', MessageController.getMessagesByDialogId);
module.exports = router;
