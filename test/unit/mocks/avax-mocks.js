const config = require('../../../config')

const { BN, BinTools } = require('avalanche')
const avm = require('avalanche/dist/apis/avm')
const binTools = BinTools.getInstance()

const addressStrings = ['X-avax13c29zyftvjfs4un7aekjm8yn6vpsn3czug7l6e']
const addresses = [binTools.cb58Decode('DxFHsGqRDGW77gmLYCEWvoWkZUkvUTLj5')]

const avaxString = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
const avaxID = binTools.cb58Decode(avaxString)
const assetId = binTools.cb58Decode(config.AVAX_TOKEN)

const txid = 'aCvBmRoD6ARCXjCVJqEHWnrVeH6Ax5Mon5pYgRuz18RnZtWrw'

// UTXOS and UTXOSets
const emptyUTXOSet = new avm.UTXOSet()

const codecID = binTools.fromBNToBuffer(new BN(0))

const UTXOWithoutFee = new avm.UTXOSet()
const smallUTXO = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('1111XiaYg'),
  avaxID,
  new avm.SECPTransferOutput(new BN(200), addresses)
)
UTXOWithoutFee.add(smallUTXO)

const UTXOWithoutToken = new avm.UTXOSet()
const UTXOwithFounds = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('1111XiaYg'),
  avaxID,
  new avm.SECPTransferOutput(new BN(10000000000), addresses)
)
UTXOWithoutToken.add(UTXOwithFounds)

const UTXOWithMintToken = new avm.UTXOSet()
const UTXOMintToken = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('111AZw1it'),
  assetId,
  new avm.SECPMintOutput(addresses)
)
UTXOWithMintToken.add(UTXOwithFounds)
UTXOWithMintToken.add(UTXOMintToken)

const UTXOWithToken = new avm.UTXOSet()
const UTXOToken = new avm.UTXO(
  codecID,
  binTools.cb58Decode('2TKfT1LrPbHYLdjiZYXRfLJ2L7yeELSyGykBikMji3mP92oW1h'),
  binTools.cb58Decode('111KgrGRw'),
  assetId,
  new avm.SECPTransferOutput(new BN(5), addresses)
)
UTXOWithToken.add(UTXOwithFounds)
UTXOWithToken.add(UTXOMintToken)
UTXOWithToken.add(UTXOToken)

module.exports = {
  txid,
  addresses,
  addressStrings,
  emptyUTXOSet,
  UTXOWithoutFee,
  UTXOWithoutToken,
  UTXOWithMintToken,
  UTXOWithToken
}
