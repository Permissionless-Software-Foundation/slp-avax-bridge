const { BN, BinTools } = require('avalanche')
const avm = require('avalanche/dist/apis/avm')
const binTools = BinTools.getInstance()

const fakeConfig = {
  AVAX_IP: 'localhost',
  AVAX_PORT: '4650',
  AVAX_PRIVATE_KEY:
    'PrivateKey-kXESwYRt4TkPXG4A9EXx1pXqP2aMUcGYTBpAGZxuKjyCwvVP',
  AVAX_TOKEN: '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'
}
const addressStrings = ['X-avax1d73xzy6tqchgxrdr0um3hjae0qzpyvp2x5j9as']
const addresses = [binTools.cb58Decode('BBGXbg6d3RGvxh5xGURCjNMo3pJTorfrF')]

const avaxString = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'
const avaxID = binTools.cb58Decode(avaxString)
const assetId = binTools.cb58Decode(fakeConfig.AVAX_TOKEN)

const txid = 'aCvBmRoD6ARCXjCVJqEHWnrVeH6Ax5Mon5pYgRuz18RnZtWrw'

const cb58Transaction =
  '111113Ky5vtkcKJm8fbCGdyTHaqpVnZv1zy6RrcZce7YgCZfYeH297zgyE5XQCkWeU' +
  'swpzQAaxiQb65pNX4U9kYQxsD6W58aoxFR7CoNN4j7eikZ7AM8s2XUUt5LvgAC9VNp' +
  'kBjcurMjninNgcH7KeXKNij6EVVNC6hrU6ZJZmP86tM1DE9ho2FukS5iaYSmkQrUqM' +
  'QvBaHDooU73wVZP9smUncU8KAHo4ii3CAhfxDfoZkYv3PHJ6mSeEznswWTVPEGDwc7' +
  'aNEToab2ExU59QXZ75Emq1D8FLr5jDVnhdjSCUqevqm2sbxJDU2iyxCpfjXhE5XG73' +
  '8igrBeuF2m5cvqheJ2ZW2S11hVkYr2GkCUroSzuf1RuYXk8YN8sz8qkb4MbjqHBQqw' +
  'wcx2rAw3iU7FyXvjmra36xK9WY9uTRDgdzhC4KnHDbzf7aogtbWYPpLU1gyJGqQUww' +
  '1iKBwHNdiVMRMY9KUcG7xCjCmWJsWzYzcFcAv71ZyxmmzNJFHEGnEkofqXLZwGyJQH' +
  'LDqhRtGD7jiJg2XBSTX6DH169vPVzkAid3xzFEo9GTgGEHYfzMB961Lv7EUkqD7SbJ' +
  '4ieA35NR7geNe8DQpqpELATpaDno4j9C98M8PCB4CEzQ6LRxyrtYuy5eqA9mpeYcKy' +
  '4vH8vmxw1soDTFgE5AsWcU2Ej5pZfJiZsMtRWaJvigmtpSrvrc8E8gnbnVqjBu52ga' +
  'py4t21SrMSM3ecsaJn6bzdVPFuZ95fJ99KJA8QyQ1M'

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
  UTXOWithToken,
  avaxID,
  cb58Transaction,
  fakeConfig
}
