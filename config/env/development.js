module.exports = {
  env: 'dev',
  network: 'mainnet',
  networkURL: process.env.RESTURL || 'https://api.fullstack.cash/v4/',
  tokenID: process.env.TOKENID || '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
  WIF: process.env.WIF || 'L5EDpCV9UURj6FhMo7CZk4QsH95orcVsm2qjKirngaXgeA3A6ZhZ',

  AVAX_IP: process.env.AVAX_IP || '78.47.131.51',
  AVAX_PORT: process.env.AVAX_PORT || '9650',
  AVAX_TOKEN: process.env.AVAX_TOKEN || 'fKqrfqzrXtb853zq8UrtX7kjtoBgjVZVTg2xQXpwy8bcLWDoy',
  AVAX_USER: process.env.AVAX_USER || 'avalanche_test',
  AVAX_PASSWORD: process.env.AVAX_PASSWORD || 'XAE12*'
}
