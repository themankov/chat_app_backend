module.exports = class CharacterDto {
  constructor(model) {
    this.user_id = model.user_id;
    this.fullname = model.fullname;
    this.avatar = model.avatar;
    this.last_seen = model.last_seen;
  }
};
