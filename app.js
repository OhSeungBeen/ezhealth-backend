require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');

const mongoConnect = require('./models');

const app = express();
mongoConnect();

// middleware
if (process.env.NODE_ENV == 'production') {
  app.use(morgan('combined'));
  app.use(helmet());
} else {
  app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// server start
app.set('port', process.env.PORT);
app.listen(app.get('port'), () => {
  console.log(`listen port ${app.get('port')}..`);
});