const chai = require('chai')

// Locally global variables.
const assert = chai.assert

// Unit under test
const AVAXLib = require('../../lib/avax')
const uut = new AVAXLib()

describe('#avax.js', () => {
  describe('#mintToken', () => {
    it('should complete successfully and mint the tokens', async () => {
      try {
        const num = 10
        const txid = await uut.mintToken(num)

        assert.typeOf(txid, 'string')
      } catch (err) {
        console.log(err)
        assert.fail('unexpected result')
      }
    })
  })
})
