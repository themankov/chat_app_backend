const jwt = require('jsonwebtoken');
const jwtToken = ({ user_id, user_name, user_email }) => {
  const user = { user_id, user_name, user_email };
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15min',
  });
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '15days',
  });
};
module.exports = jwtToken;
