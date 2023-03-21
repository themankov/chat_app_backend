const express = require('express');

const bcrypt = require('bcrypt');
const authMiddleware = require('./../middleware/auth-middleware');
const UserController = require('../controllers/UserController.js');
const router = express.Router();
const { body } = require('express-validator');

router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  UserController.registration
);
router.post('/login', UserController.login);
router.get('/refresh', UserController.refresh);
router.post('/logout', UserController.logout);
router.post('/getUsersExceptMe', UserController.getUsersExceptMe);
router.get('/activate/:link', UserController.activate);
router.get('/', authMiddleware, UserController.getUsers);
module.exports = router;
