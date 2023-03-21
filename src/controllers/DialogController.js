const DialogService = require('../services/DialogService');

class DialogController {
  async getAllDialogs(req, res, next) {
    const data = await DialogService.getAllDialogs();
    return res.json(data);
  }
  async deleteDialog(data) {
    const { dialogid } = data;
    const data2 = await DialogService.deleteDialog(dialogid);
    return data2;
  }
  async getDialogsById(req, res, next) {
    const { user_id } = req.body;
    const getDialogs = await DialogService.getDialogsById(user_id);
    return res.json(getDialogs);
  }
  async updateTextDialog(data) {
    const { dialogid, newText, updatedat } = data;
    const updateTextDialog = await DialogService.updateTextDialog(
      dialogid,
      newText,
      updatedat
    );
    return updateTextDialog;
  }
  async updateUnreadMessages(data) {
    const { dialogid } = data;

    const unreadedCount = await DialogService.updateUnreadedMessages(dialogid);
    return unreadedCount;
  }
  async createDialog(data) {
    const { textData, authorId, partnerId, updatedAt, userId } = data;
    const createdDialog = await DialogService.createDialog(
      textData,
      authorId,
      partnerId,
      updatedAt,
      userId
    );

    return createdDialog;
  }
}
module.exports = new DialogController();
