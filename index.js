/*
  An npm JavaScript library for front end web apps. Implements a minimal
  Bitcoin Cash wallet.
*/

/* eslint-disable no-async-promise-executor */

'use strict'

const BCHJS = require('@psf/bch-js')

const Util = require('./lib/util')
const BCHLib = require('./lib/bch')
const util = new Util()
const bch = new BCHLib()

let _this // local global for 'this'.

class BoilplateLib {
  constructor () {
    _this = this

    _this.bchjs = new BCHJS()
    _this.util = util
    _this.bch = bch
  }
}

module.exports = BoilplateLib
