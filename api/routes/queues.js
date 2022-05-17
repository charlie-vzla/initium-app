const QueueService = require('../services/QueueService.js');

const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
  const queues = QueueService.getCustomerQueues();

  res.status(200).json({ queues });
})

router.post('/customer', async (req, res) => {
  let result;

  try {
    result = await QueueService.addCustomerToQueue(req);
  } catch (error) {
    return res.status(500).json({ statusCode: 500, error});
  }

  res.status(200).json(result);
});

module.exports = router;
