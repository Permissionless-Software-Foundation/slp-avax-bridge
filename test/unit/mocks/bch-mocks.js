'use strict'

const mockUtxos = {
  success: true,
  utxos: []
}

const mockInvalidUtxos = {
  success: true,
  utxos: [
    {
      height: 1430015,
      tx_hash:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tx_pos: 2,
      value: 546,
      txid: '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      vout: 2,
      utxoType: 'minting-baton',
      transactionType: 'mint',
      tokenId:
        '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      tokenType: 1,
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      mintBatonVout: 2,
      isValid: true
    },
    {
      height: 1430015,
      tx_hash:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tx_pos: 3,
      value: 994032,
      txid: '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      vout: 3,
      isValid: true
    }
  ]
}

const mockTokenlessUtxos = {
  success: true,
  utxos: [
    {
      height: 1430015,
      tx_hash:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tx_pos: 3,
      value: 994032,
      txid: '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      vout: 3,
      isValid: false
    }
  ]
}

const mockNotEnoughBalance = {
  success: true,
  utxos: [
    {
      height: 1430015,
      tx_hash:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tx_pos: 1,
      value: 546,
      txid: '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      vout: 1,
      utxoType: 'token',
      tokenQty: '100',
      tokenId:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      tokenType: 1,
      isValid: null
    },
    {
      height: 1430015,
      tx_hash:
        '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      tx_pos: 2,
      value: 546,
      txid: '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      vout: 2,
      utxoType: 'minting-baton',
      transactionType: 'mint',
      tokenId:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tokenType: 1,
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      mintBatonVout: 2,
      isValid: null
    },
    {
      height: 1430015,
      tx_hash:
        '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      tx_pos: 3,
      value: 250,
      txid: '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      vout: 3,
      isValid: false
    }
  ]
}

const mockValidUtxos = {
  success: true,
  utxos: [
    {
      height: 1430015,
      tx_hash:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tx_pos: 1,
      value: 546,
      txid: '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      vout: 1,
      utxoType: 'token',
      tokenQty: '100',
      tokenId:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      tokenType: 1,
      isValid: null
    },
    {
      height: 1430015,
      tx_hash:
        '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      tx_pos: 2,
      value: 546,
      txid: '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      vout: 2,
      utxoType: 'minting-baton',
      transactionType: 'mint',
      tokenId:
        '622e97e82a13ee5bc2ab186b08449bd4be1bffae3feda6d47dc6e612791eb47b',
      tokenType: 1,
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      mintBatonVout: 2,
      isValid: null
    },
    {
      height: 1430015,
      tx_hash:
        '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      tx_pos: 3,
      value: 994032,
      txid: '91b3b1172bc04f82aa5b11cf3289b0eeff0f418ce1bd9f491496bf021cf38923',
      vout: 3,
      isValid: false
    }
  ]
}

const mockTxid =
  '59716f812630de3f740bbd59d7a669f7c5deb27ef186a1be3c745ff263595e8f'

module.exports = {
  mockInvalidUtxos,
  mockUtxos,
  mockTokenlessUtxos,
  mockNotEnoughBalance,
  mockValidUtxos,
  mockTxid
}
