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
        const num = 5
        const txid = await uut.mintSlp(num)

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.equal(true, false, 'unexpected result')
      }
    })
  })
})
