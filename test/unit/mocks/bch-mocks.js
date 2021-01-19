'use strict'

const mockUtxos = {
  success: true,
  utxos: []
}

const mockInvalidUtxos = {
  success: true,
  utxos: [
    {
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 2,
      value: 546,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      vout: 2,
      utxoType: 'minting-baton',
      transactionType: 'mint',
      tokenId:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
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
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 3,
      value: 994032,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      vout: 3,
      isValid: true
    }
  ]
}

const mockTokenlessUtxos = {
  success: true,
  utxos: [
    {
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 3,
      value: 994032,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      vout: 3,
      isValid: false
    }
  ]
}

const mockNotEnoughBalance = {
  success: true,
  utxos: [
    {
      height: 670660,
      tx_hash:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
      tx_pos: 1,
      value: 546,
      txid: '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
      vout: 1,
      utxoType: 'token',
      tokenQty: '100',
      tokenId:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      tokenType: 1,
      isValid: true
    },
    {
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 2,
      value: 546,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      vout: 2,
      utxoType: 'minting-baton',
      transactionType: 'mint',
      tokenId:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
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
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 3,
      value: 250,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      vout: 3,
      isValid: false
    }
  ]
}

const mockValidUtxos = {
  success: true,
  utxos: [
    {
      height: 670660,
      tx_hash:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
      tx_pos: 1,
      value: 546,
      txid: '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
      vout: 1,
      utxoType: 'token',
      tokenQty: '100',
      tokenId:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
      tokenTicker: 'TEST',
      tokenName: 'TESTCOIN',
      tokenDocumentUrl: '',
      tokenDocumentHash: '',
      decimals: 1,
      tokenType: 1,
      isValid: true
    },
    {
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 2,
      value: 546,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      vout: 2,
      utxoType: 'minting-baton',
      transactionType: 'mint',
      tokenId:
        '600ee24d0f208aebc2bdd2c4ee1b9acb6d57343561442e8676b5bbea311d5a0f',
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
      height: 670660,
      tx_hash:
        'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
      tx_pos: 3,
      value: 994032,
      txid: 'c44339a29b5e01658def2f018394629cc9cb13de32060245f89a6c9466b8edc7',
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
