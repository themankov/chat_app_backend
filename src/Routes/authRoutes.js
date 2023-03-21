const express = require('express');
const pool = require('../db.js');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtToken = require('../utils/jwt-helper.js');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await pool.query('SELECT * FROM users WHERE user_email= $1', [
      email,
    ]);
    if (users.rows.length === 0)
      return res.status(401).json({ error: 'Email is incorrect' });

    //PASSWORD CHECK
    const validPassword = await bcrypt.compare(
      password,
      users.rows[0].user_password
    );
    if (!validPassword)
      return res.status(401).json({ error: 'Incorrect password' });
    //JWT
    const tokens = jwtToken(users.rows[0]);
    res.cookies('refresh_token', tokens.refreshToken, { httpOnly: true });
    res.json(tokens);
  } catch (err) {
    return res.json('Not right password');
  }
});
router.get('/refresh_token', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken === null)
      return res.status(401).json({ error: 'Null refresh token' });
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (error, user) => {
        if (error) return res.status(403).json({ error: error.message });
        let tokens = jwtToken(user);
        res.cookie('refresh_token', token.refreshToken, { httpOnly: true });
        res.json(tokens);
      }
    );
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
router.delete('/refresh_token', (req, res) => {
  try {
    res.clearCookie('refresh_token');
    return res.status(200).json({ message: 'Refresh token delete' });
  } catch (e) {}
});
module.exports = router;
