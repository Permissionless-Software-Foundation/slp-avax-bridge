/*
  An example of a typical utility library. Things to notice:
  - This library is exported as a Class.
  - External dependencies are embedded into the class 'this' object: this.bitbox
  - `_this` maintains top-level context for `this`.
*/

'use strict'

// npm libraries
const BCHJS = require('@psf/bch-js')

// Locally global variables.
let _this
const bchjs = new BCHJS()

class UtilLib {
  constructor () {
    // Embed external libraries into the class, for easy mocking.
    this.bchjs = bchjs

    _this = this
  }

  async getBchData (addr) {
    try {
      // Validate Input
      if (typeof addr !== 'string') throw new Error('Address must be a string')

      const balance = await _this.bchjs.Electrumx.balance(addr)

      const utxos = await _this.bchjs.Electrumx.utxo(addr)

      const bchData = {
        balance: balance.balance,
        utxos: utxos.utxos
      }
      // console.log(`bchData: ${JSON.stringify(bchData, null, 2)}`)

      return bchData
    } catch (err) {
      // Optional log to indicate the source of the error. This would normally
      // be written with a logging app like Winston.
      console.log('Error in util.js/getBalance()')
      throw err
    }
  }
}

module.exports = UtilLib
