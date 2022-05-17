const cors = require('cors')
const morgan = require('morgan');

const express = require('express');
const app = express();

const queues = require('./routes/queues');

app.disable('x-powered-by');

app.use(cors({
    origin: '*',
}));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(morgan('combined'));

app.get('/', (_req, res) => {
  res.send('initium-api running port 9021!').sendStatus(200);
});

app.use('/queues', queues);

module.exports = app;
