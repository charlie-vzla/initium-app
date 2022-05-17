const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');


dayjs.extend(utc);

const { query, getClient } = require('../db');

const { emit } = require('../utils/socket');
const logger = require('../utils/logger');

/**
 * Handles all the operations of the queues.
 * @author cabreu
 */
class QueueService {
  constructor() {
    this.queueA = [];
    this.queueB = [];
  }

  /**
   * Initialize the queues to manague them
   *
   * @returns {void} .
   */
  async startQueues() {
    logger.debug('Start startQueues@QueueService');

    await this.setListener();

    const { rows } = await query("SELECT * FROM waiting_list ORDER BY expire_at ASC");

    rows.forEach((row) => {
      if (row.queue === '2') {
        this.queueA.push(row);
      } else {
        this.queueB.push(row);
      }
    });

    logger.debug('Finish startQueues@QueueService');
  }

  /**
   * Sets the queue of the new customer
   *
   * @param {{ id: number, name: string}} customer
   * @returns {{ id: number, name: string, queue: string, expire_at: string }}.
   */
  setCustomerQueue(customer) {
    logger.debug('Start setCustomerQueue@QueueService');

    let queue = '2';

    if (!this.queueA.length) {
      customer.expire_at = dayjs.utc().add(2, 'minute');
    } else if ( !this.queueB.length) {
      queue = '3';
      customer.expire_at = dayjs.utc().add(3, 'minute');
    } else {
      const customersA = this.queueA.length;
      const lastCustomerA = this.queueA[customersA - 1];
      const timeA = dayjs.utc(lastCustomerA.expire_at).add(2, 'minute');

      const customersB = this.queueB.length;
      const lastCustomerB = this.queueB[customersB - 1];
      const timeB = dayjs.utc(lastCustomerB.expire_at).add(3, 'minute');

      if (timeA.isBefore(timeB) || timeA.isSame(timeB)) {
        customer.expire_at = timeA;
      } else {
        queue = '3';
        customer.expire_at = timeB;
      }
    }

    customer.queue = queue;
    customer.expire_at = customer.expire_at.format();

    logger.debug(`Finish setCustomerQueue@QueueService queue selected is: ${customer.queue}`);

    return customer;
  }

  /**
   * Adds a customer to a queue.
   *
   * @param {Request} req
   * @returns {{ queue: string, customer: { id: number, name: string, queue: string, expire_at: string } }} .
   */
  async addCustomerToQueue(req) {
    logger.debug(`Start addCustomerToQueue@QueueService with: ${JSON.stringify(req.body)}`);

    let { body } = req;

    body = this.setCustomerQueue(body);

    if (body.queue === '2') {
      this.queueA.push(body);
    } else {
      this.queueB.push(body);
    }

    try {
      await query("INSERT INTO waiting_list VALUES ($1, $2, $3, $4)", [body.id, body.name, body.queue, body.expire_at]);
    } catch (error) {
      logger.error(`Failed addCustomerToQueue@QueueService: ${error}`);
      throw new Error('failed to add customer to a queue');
    }

    logger.debug(`Finish addCustomerToQueue@QueueService with: ${JSON.stringify(req.body)}`);

    return { queue: body.queue, customer: body };
  }

  /**
   * Gets the customer queues
   * @returns { {queueA: any[], queueB: any[]} } the queue of customers.
   */
  getCustomerQueues() {
    return { queueA: this.queueA , queueB: this.queueB };
  }

  /**
   * Moves the customer queue one position to the right, hence
   * "serving" the customer.
   *
   * @param {String} queue the name of the queue
   * @returns {void}.
   */
  serveCustomer(queue) {
    logger.info('Start serveCustomer@QueueService');
    let customer, customers;

    if (queue === '2') {
      [customer, ...customers] = this.queueA;
      this.queueA = customers;
    } else {
      [customer, ...customers] = this.queueB;
      this.queueB = customers;
    }

    // NOTIFY WITH WEBSOCKET TO FRONT OF CUSTOMER
    logger.info(`Finish serveCustomer@QueueService with: ${customer.name}`);

    emit('serve-customer', customer);
  }

  /**
   * Gets a client from the pool to set
   * a LISTEN in postgresql
   *
   * @returns {void} .
   */
  async setListener() {
    const client = await getClient();
    await client.query('LISTEN serve_customer');

    client.on('notification', (msg) => {
      this.serveCustomer(msg.payload);
    });
  }
}


module.exports = new QueueService();