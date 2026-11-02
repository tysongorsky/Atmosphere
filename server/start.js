const { config, createHttpServer } = require('./index');
const { startEspNetReceiver } = require('./espnet');

startEspNetReceiver(config.espnet || {}, Number(process.env.PORT || config.port || 3000));
createHttpServer();
