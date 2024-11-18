const redis = require('redis');

const redisClient = redis.createClient({
  host: 'localhost', // ou a URL do seu servidor Redis
  port: 6379,        // porta padrão do Redis
});

redisClient.on('connect', () => {
  console.log('Conectado ao Redis');
});

redisClient.on('error', (err) => {
  console.error('Erro no Redis:', err);
});

module.exports = redisClient;
