module.exports = {
  env: 'dev',
  networkURL: process.env.RESTURL ? process.env.RESTURL : 'https://api.fullstack.cash/v4/',
  network: 'mainnet',
  tokenID: process.env.TOKENID ? process.env.TOKENID : '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
  WIF: process.env.WIF ? process.env.WIF : 'L5EDpCV9UURj6FhMo7CZk4QsH95orcVsm2qjKirngaXgeA3A6ZhZ'
}
