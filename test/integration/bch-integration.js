const chai = require('chai')

// Locally global variables.
const assert = chai.assert

// Unit under test
const BCHLib = require('../../lib/bch')
const uut = new BCHLib()

describe('#bch.js', () => {
  describe('#mintSlp', () => {
    it('should complete successfully and mint the tokens', async () => {
      try {
        const num = 10
        const txid = await uut.mintSlp(num)
        // console.log(`txid: ${JSON.stringify(txid, null, 2)}`)

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('unexpected result')
      }
    })
  })

  describe('#burnSlp', () => {
    it('should burn a given number of tokens', async () => {
      try {
        const num = 121
        const txid = await uut.burnSlp(num)
        // console.log(`txid: ${JSON.stringify(txid, null, 2)}`)f

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('unexpected result')
      }
    })
  })
})
