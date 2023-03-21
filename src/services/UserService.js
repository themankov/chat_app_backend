const db = require('./../db');
const UserDto = require('./../dto/UserDto');
const bcrypt = require('bcrypt');
const MailService = require('./MailService');
const uuid = require('uuid');
const TokenService = require('./TokenService');
const ApiError = require('../exceptions/api-error');
class UserService {
  async registration(email, fullname, password) {
    const candidate = await db.query('SELECT * FROM users WHERE email=$1', [
      email,
    ]);

    if (candidate.rows.length !== 0) {
      throw ApiError.BadRequest('Пользователь с таким email уже существует');
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const activationLink = uuid.v4();
    const user = await db.query(
      'INSERT INTO users(fullname,email,hashpassword,activationLink) VALUES($1,$2,$3,$4) RETURNING *',
      [fullname, email, hashpassword, activationLink]
    );
    await MailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/users/activate/${activationLink}`
    );
    const userDto = new UserDto(user.rows[0]);

    const tokens = TokenService.generateToken({ ...userDto });

    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }
  async activate(activationLink) {
    const user = await db.query('SELECT * FROM users WHERE activationLink=$1', [
      activationLink,
    ]);
    if (user.rows.length === 0) {
      throw ApiError.BadRequest('Некорректная ссылка активации');
    }
    await db.query(
      'UPDATE users SET isActivated = true WHERE activationLink =$1',
      [activationLink]
    );
  }
  async login(email, password) {
    const user = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    if (user.rows.length === 0) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }
    // const hashpassword = await bcrypt.hash(password, 10);
    // console.log(hashpassword);
    // console.log(user.rows);
    const isPassEqual = await bcrypt.compare(
      password,
      user.rows[0].hashpassword
    );
    if (!isPassEqual) {
      throw ApiError.BadRequest('Неверный пароль');
    }
    const userDto = new UserDto(user.rows[0]);

    const tokens = TokenService.generateToken({ ...userDto });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: { ...userDto } };
  }
  async logout(refreshToken) {
    const token = TokenService.removeToken(refreshToken);
    return token;
  }
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = TokenService.validateRefreshToken(refreshToken);

    const tokenFromDb = await TokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb.rows[0]) {
      throw ApiError.UnauthorizedError();
    }

    const user = await db.query('SELECT * FROM users WHERE user_id=$1', [
      tokenFromDb.rows[0].user_id,
    ]);

    const userDto = new UserDto(user.rows[0]);

    const tokens = TokenService.generateToken({ ...userDto });
    await TokenService.saveToken(userDto.id, tokens.refreshToken);
    return { ...tokens, user: userDto };
  }
  async getAllUsers() {
    const users = await db.query('SELECT * FROM users');
    return users.rows;
  }
  async onlineMode(user_id) {
    const updateUser = await db.query(
      "UPDATE users SET last_seen='Online' WHERE user_id=$1 RETURNING*",
      [user_id]
    );

    const userDto = new UserDto(updateUser.rows[0]);

    return userDto;
  }
  async offlineMode(user_id, last_seen) {
    const updateUser = await db.query(
      'UPDATE users SET last_seen=$1 WHERE user_id=$2 RETURNING*',
      [last_seen, user_id]
    );
    const userDto = new UserDto(updateUser.rows[0]);
    return userDto;
  }
  async getAllUsersExceptMe(user_id) {
    const users = await db.query('SELECT * FROM users WHERE user_id!=$1', [
      user_id,
    ]);
    const usersDto = users.rows.map((item) => ({ ...new UserDto(item) }));

    return usersDto;
  }
}
module.exports = new UserService();
