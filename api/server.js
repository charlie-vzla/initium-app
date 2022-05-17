const { createServer } = require('http');

const { startSocket, emit } = require('./utils/socket');
const logger = require('./utils/logger');

const QueueService = require('./services/QueueService');

const app = require("./app");
const httpServer = createServer(app);

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

eventEmitter.on('notify-queue', () => {
  console.log('notifying client!');

  emit('customer-queues', QueueService.getCustomerQueues());
});

QueueService.startQueues().then(() => {
  startSocket(httpServer, eventEmitter);
})
.catch((error) => console.error(error))
.finally(() => {
  if (httpServer) {
    httpServer.listen(9021, () => logger.info('Listening on por 9021'));
  }
});