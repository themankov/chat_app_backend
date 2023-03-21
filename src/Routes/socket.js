const { Server } = require('socket.io');

const ioServer = (server) => {
  const io = new Server(server);
  io.on('connection', (socket) => {
    console.log('a user connected');
  });
  return io;
};
module.exports = ioServer;
