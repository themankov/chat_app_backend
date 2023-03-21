const CharacterDto = require('../dto/CharacterDto');
const ApiError = require('../exceptions/api-error');
const db = require('./../db');
class DialogService {
  async getAllDialogs() {
    const dialogs = await db.query('SELECT * FROM dialogs');
    return dialogs.rows;
  }
  async getDialogsById(user_id) {
    const data = await db.query(
      'SELECT * FROM dialogs WHERE authorid=$1 OR partnerid=$2',
      [user_id, user_id]
    );
    const result = [];

    await Promise.all(
      data.rows.map(async (item) => {
        const author = await db.query('SELECT * FROM users WHERE user_id=$1', [
          item.authorid,
        ]);
        const authorDto = new CharacterDto(author.rows[0]);

        const partner = await db.query('SELECT * FROM users WHERE user_id=$1', [
          item.partnerid,
        ]);
        const partnerDto = new CharacterDto(partner.rows[0]);
        result.push({
          ...item,
          partnerid: { ...partnerDto },
          authorid: { ...authorDto },
        });
      })
    );
    console.log;
    return result;
  }
  async updateTextDialog(dialogid, newText, updatedat) {
    const updatedDialog = await db.query(
      'UPDATE dialogs SET textData=$1, updatedAt=$2 WHERE dialog_id=$3 RETURNING*',
      [newText, updatedat, dialogid]
    );
    return updatedDialog.rows[0];
  }
  async deleteDialog(dialogid) {
    const deletedDialog = await db.query(
      'DELETE FROM dialogs WHERE dialog_id=$1 RETURNING*',
      [dialogid]
    );
    return deletedDialog.rows[0];
  }
  async updateUnreadedMessages(dialogid) {
    const unreadedCount = await db.query(
      'SELECT * FROM messages WHERE dialogid=$1 AND isread=false',
      [dialogid]
    );
    await db.query(
      'UPDATE dialogs SET unreadedmessages=$1 WHERE dialog_id=$2',
      [unreadedCount.rows.length, dialogid]
    );

    return { count: unreadedCount.rows.length, dialogid };
  }
  async createDialog(textData, authorId, partnerId, updatedAt, userId) {
    const author = await db.query('SELECT * FROM users WHERE user_id=$1', [
      authorId,
    ]);

    if (author.rows.length === 0) {
      throw ApiError.BadRequest('Некорректные данные отправителя');
    }
    const autorData = new CharacterDto(author.rows[0]);

    const partner = await db.query('SELECT * FROM users WHERE user_id=$1', [
      partnerId,
    ]);
    if (partner.rows.length === 0) {
      throw ApiError.BadRequest('Некорректные данные получателя');
    }
    const partnerData = new CharacterDto(partner.rows[0]);
    const dialog = await db.query(
      'INSERT INTO dialogs(textData,authorId,partnerId,updatedAt,userId) VALUES($1,$2,$3,$4,$5) RETURNING*',
      [textData, authorId, partnerId, updatedAt, userId]
    );
    return {
      ...dialog.rows[0],
      partnerid: partnerData,
      authorid: autorData,
      hashpassword: '',
    };
  }
}
module.exports = new DialogService();
