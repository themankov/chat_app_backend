require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { dirname, join } = require('path');
const { fileURLToPath } = require('url');
const userRouter = require('./Routes/userRoutes.js');
const dialogRouter = require('./Routes/dialogRouter');
const messageRouter = require('./Routes/MessageRouter');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middleware/error-middleware.js');
const PORT = process.env.PORT || 5000;
const app = express();
const http = require('http');
const DialogController = require('./controllers/DialogController.js');
const MessageController = require('./controllers/MessageController.js');
const UserController = require('./controllers/UserController.js');
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

const io = require('socket.io')(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
    methods: ['GET', 'POST'],

    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.on('USER_ONLINE', async (user_id) => {
    console.log('here', user_id);
    const res = await UserController.onlineMode(user_id);
    console.log('cur', res);
    io.emit('GET_USER_ONLINE', res);
  });
  socket.on('ROOMS', (data) => {
    console.log(`We joined room: ${data}`);
    socket.join(data);
  });
  socket.on('JOIN_ROOM', (data) => {
    console.log(`We joined room: ${data.room}`);
    socket.join(data.room);
  });
  socket.on('LOGOUT', async ({ currentUser, last_seen }) => {
    const res = await UserController.offlineMode(currentUser, last_seen);
    io.emit('USER_OFFLINE', res);
  });
  socket.on('disconnect', async (socket) => {
    console.log(socket);
    // const res = await UserController.offlineMode(user_id);
    // const res = await UserController.offlineMode(user_id); // the Set contains at least the socket ID
  });
  socket.on('DELETE_MESSAGE', async (data) => {
    const res = await MessageController.deleteMessage(data);

    io.emit('GET_DELETED_MESSAGE', res);
  });
  socket.on('DELETE_DIALOG', async (data) => {
    const res = await DialogController.deleteDialog(data);
    const res2 = await DialogController.updateUnreadMessages({
      dialogid: data.dialog_id,
    });
    io.emit('GET_DELETED_DIALOG', res);
    io.emit('GET_UNREADED_MESSAGES', res2);
  });
  // socket.on('UPDATE_DIALOG_UNREAD_MESSAGES', async (data) => {
  //   const res = await DialogController.updateUnreadMessages(data);
  //   io.emit('GET_UNREADED_MESSAGES', res);
  // });
  socket.on('UPDATE_DIALOG_LAST_MESSAGE', async (data) => {
    const res = await DialogController.updateTextDialog(data);

    io.to(data.dialogid).emit('GET_DIALOG_LAST_MESSAGE', res);
  });
  socket.on('CREATE_DIALOG', async (data) => {
    const res = await DialogController.createDialog(data);
    io.emit('GET_CREATED_DIALOG', res);
  });
  socket.on('MESSAGE_READ_UPDATE', async (data) => {
    const res = await MessageController.updateMessageRead(data);
    const res2 = await DialogController.updateUnreadMessages({
      dialogid: data.dialog_id,
    });
    io.emit('UPDATE_READ_MESSAGE', res);
    io.emit('GET_UNREADED_MESSAGES', res2);
  });
  socket.on('SEND_MESSAGE', async (data) => {
    const res = await MessageController.createMessage(data);
    const res2 = await DialogController.updateUnreadMessages(data);

    io.to(data.dialogid).emit('UPDATE_MESSAGE', res);
    io.emit('GET_UNREADED_MESSAGES', res2);
  });
});

app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRouter);
app.use('/api/dialogs', dialogRouter);
app.use('/api/message', messageRouter);
app.use(errorMiddleware);
server.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
module.exports = io;
