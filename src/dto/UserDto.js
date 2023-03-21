module.exports = class UserDto {
  constructor(model) {
    this.email = model.email;
    this.id = model.user_id;
    this.fullname = model.fullname;
    this.isactivated = model.isactivated;
    this.last_seen = model.last_seen;
  }
};
