const CharacterDto = require('../dto/CharacterDto');
const db = require('./../db');
class MessageService {
  async getAllMessages() {
    const messages = await db.query('SELECT * FROM messages');
    return messages.rows;
  }
  async createMessage(
    textdata,
    userid,
    dialogid,
    sendedat,
    isRead,
    audio,
    attachments
  ) {
    const dialog = await db.query('SELECT * FROM dialogs WHERE dialog_id=$1', [
      dialogid,
    ]);

    const partner = await db.query('SELECT * FROM users WHERE user_id=$1', [
      dialog.rows[0].partnerid,
    ]);
    const partnerDto = new CharacterDto(partner.rows[0]);
    const author = await db.query('SELECT * FROM users WHERE user_id=$1', [
      dialog.rows[0].authorid,
    ]);
    //select c encode(data, 'base64')
    const authorDto = new CharacterDto(author.rows[0]);
    const message = await db.query(
      'INSERT INTO messages(textdata,userid,dialogid,sendedat,isread, audio,attachments) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING*',
      [textdata, userid, dialogid, sendedat, isRead, audio, attachments]
    );

    return {
      ...message.rows[0],
      dialogChar: {
        partner: { ...partnerDto },
        author: { ...authorDto },
      },
    };
  }
  async deleteMessage(id) {
    const message = await db.query(
      'DELETE FROM messages WHERE message_id=$1 RETURNING*',
      [id]
    );

    return message.rows[0];
  }
  async updateMessageRead(dialog_id, currentUser) {
    console.log('ghhhh', dialog_id, currentUser);
    const data = await db.query(
      'UPDATE messages SET isread=true WHERE dialogid=$1 AND userid!=$2 AND isread!=true RETURNING*',
      [dialog_id, currentUser]
    );
    return data.rows;
  }
  async getMessagesByDialogId(dialog_id) {
    const data = await db.query('SELECT * FROM messages WHERE dialogid=$1', [
      dialog_id,
    ]);

    const result = [];

    await Promise.all(
      data.rows.map(async (item) => {
        const authorId = await db.query(
          'SELECT authorid FROM dialogs WHERE dialog_id=$1',
          [item.dialogid]
        );

        const author = await db.query('SELECT * FROM users WHERE user_id=$1', [
          authorId.rows[0].authorid,
        ]);

        const authorDto = new CharacterDto(author.rows[0]);

        const partnerId = await db.query(
          'SELECT partnerid FROM dialogs WHERE dialog_id=$1',
          [item.dialogid]
        );
        const partner = await db.query('SELECT * FROM users WHERE user_id=$1', [
          partnerId.rows[0].partnerid,
        ]);

        const partnerDto = new CharacterDto(partner.rows[0]);
        result.push({
          ...item,

          partnerid: { ...partnerDto },
          authorid: { ...authorDto },
        });
      })
    );

    return result;
  }
}
module.exports = new MessageService();
