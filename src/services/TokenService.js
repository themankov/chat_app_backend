const jwt = require('jsonwebtoken');
const db = require('./../db');
class TokenService {
  generateToken(payload) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '30min',
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '30days',
    });
    return {
      accessToken,
      refreshToken,
    };
  }
  async saveToken(userId, refreshToken) {
    const [refreshKeyHeader, refreshKeyPayload, refreshKeySignature] =
      refreshToken.split('.');

    const tokenData = await db.query(
      'SELECT * FROM userToken where user_id=$1',
      [userId]
    );

    if (tokenData.rows.length !== 0) {
      const token = await db.query(
        'UPDATE userToken SET refreshKeyHeader=$1, refreshKeyPayload=$2, refreshKeySignature = $3 WHERE user_id=$4',
        [refreshKeyHeader, refreshKeyPayload, refreshKeySignature, userId]
      );
      return;
    }
    await db.query('INSERT INTO userToken VALUES($1,$2,$3,$4) RETURNING*', [
      refreshKeyHeader,
      refreshKeyPayload,
      refreshKeySignature,
      userId,
    ]);

    tokenData.rows[0] = refreshToken;
    return;
  }
  async removeToken(refreshToken) {
    const [refreshKeyHeader, refreshKeyPayload, refreshKeySignature] =
      refreshToken.split('.');
    const tokenData = await db.query(
      'DELETE FROM userToken WHERE refreshkeyheader=$1 AND refreshkeypayload=$2 AND refreshkeysignature=$3 RETURNING*',
      [refreshKeyHeader, refreshKeyPayload, refreshKeySignature]
    );
    return tokenData;
  }
  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return userData;
    } catch (e) {
      console.log(e);
    }
  }
  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      return userData;
    } catch (e) {
      return null;
    }
  }
  async findToken(refreshToken) {
    const [refreshKeyHeader, refreshKeyPayload, refreshKeySignature] =
      refreshToken.split('.');

    const tokenData = await db.query(
      'SELECT * FROM userToken WHERE refreshkeysignature=$1',
      [refreshKeySignature]
    );

    return tokenData;
  }
}
module.exports = new TokenService();
