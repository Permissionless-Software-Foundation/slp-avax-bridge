module.exports = {
  env: 'dev',
  networkURL: process.env.RESTURL ? process.env.RESTURL : 'https://testnet3.fullstack.cash/v4/',
  network: 'testnet',
  tokenID: process.env.TOKENID,
  WIF: process.env.WIF
}
