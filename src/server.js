var restify = require('restify');
const mongoose = require('mongoose');

restify.plugins = require('restify-plugins');
const config = require('./config');

const rjwt = require('restify-jwt-community');
const jwt = require('jsonwebtoken');
const corsMiddleware = require('restify-cors-middleware')

var server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.fullResponse());
server.use(rjwt(config.jwt).unless({
  path: [
  '/login',
  '/signup',
  '/',
  /\/css/i,
  /\/img/i,
  /\/js/i,
  '/favicon.ico'
  ]
}));

const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['http://localhost:8080', 'http://localhost:8081'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
})

server.pre(cors.preflight)
server.use(cors.actual)

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
  mongoose.Promise = global.Promise;
  mongoose.connect(config.db.uri, { useNewUrlParser: true });

  const db = mongoose.connection;

  db.on('error', (err) => {
    console.error(err);
    process.exit(1);
  });

  db.once('open', () => {
    require('./routes')(server);
    console.log(`Server is listening on port ${config.port}`);
  });
});

