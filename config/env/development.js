module.exports = {
  env: 'dev',
  networkURL: process.env.RESTURL ? process.env.RESTURL : 'https://api.fullstack.cash/v4/',
  network: 'mainnet',
  tokenID: process.env.TOKENID ? process.env.TOKENID : '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
  WIF: process.env.WIF ? process.env.WIF : 'L5EDpCV9UURj6FhMo7CZk4QsH95orcVsm2qjKirngaXgeA3A6ZhZ'
}
