const { Server } = require("socket.io");

let io;

module.exports = {
  /**
   * Start the server socket to let clients connect.
   * Once a client connects we return the custoner queues
   *
   * @param {Server} server
   * @param {EventEmitter} eventEmitter
   * @returns {void}.
   */
  startSocket: (server, eventEmitter) => {
    io = new Server(server, { cors: { origin: 'http://localhost:9022 '}});
    io.on('connection', (_socket) => {
      console.log('new client has connected!');
      console.log(`Did someone listen: ${eventEmitter.emit('notify-queue')}`);
    });
  },
  /**
   * Its a server broadcast to all client listening to the specified channel.
   *
   * @param {string} channel channel to notify
   * @param {JSON} payload payload to sent through the channel
   * @returns {void} .
   */
  emit: (channel, payload) => {
    if (!io) return;

    io.emit(channel, payload);
  }
}