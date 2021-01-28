const { BN } = require('avalanche')

const addresses = ['X-avax13c29zyftvjfs4un7aekjm8yn6vpsn3czug7l6e']

const txid = 'aCvBmRoD6ARCXjCVJqEHWnrVeH6Ax5Mon5pYgRuz18RnZtWrw'

const txFee = new BN(1000000)

const invalidBalance = { balance: '0', utxoIDs: [] }
const validBalance = {
  balance: '1963000000',
  utxoIDs: [
    {
      txID: 'un92aCRSdKMsyk7n2KAvTqzZXQ4ZcUobGCjzTEX9AxMa4ezet',
      outputIndex: 0
    },
    {
      txID: '2VTDrRde3kDJTmmFhd2ZvZYR2uKkgLWmepFKFK2zPz1mTF1Lha',
      outputIndex: 0
    }
  ]
}

module.exports = {
  addresses,
  txid,
  txFee,
  invalidBalance,
  validBalance
}
