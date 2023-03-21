const io = require('./../index');
const MessageService = require('./../services/MessageService');
class MessageController {
  constructor(io) {
    this.io = io;
  }
  async createMessage(data) {
    const { textdata, userid, dialogid, sendedat, isRead, audio, attachments } =
      data;
    const createdMessage = await MessageService.createMessage(
      textdata,
      userid,
      dialogid,
      sendedat,
      isRead,
      audio,
      attachments
    );

    return createdMessage;
  }
  async getMessagesByDialogId(req, res, next) {
    const { dialog_id } = req.body;

    const data = await MessageService.getMessagesByDialogId(dialog_id);
    const sortedData = data.sort((a, b) => a.message_id - b.message_id);
    // encode(data, 'base64')
    return res.json(sortedData);
  }
  async updateMessageRead(data) {
    const { dialog_id, currentUser } = data;
    const updatedData = await MessageService.updateMessageRead(
      dialog_id,
      currentUser
    );
    return updatedData;
  }
  async deleteMessage(data) {
    const { message_id } = data;
    const deletedMessage = await MessageService.deleteMessage(message_id);

    return deletedMessage;
  }
}
module.exports = new MessageController(io);
