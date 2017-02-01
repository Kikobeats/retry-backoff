'use strict'

const should = require('should')
const createRetryBackoff = require('..')
const pkg = require('../package.json')

describe(pkg.name, function () {
  it('non errors workflow', function (done) {
    function fn (cb) {
      setTimeout(function () {
        return cb(null, {foo: 'bar'})
      }, 0)
    }

    const retryBackoff = createRetryBackoff()

    retryBackoff(fn, function (err, result) {
      should(err).be.null()
      should(result).be.eql({foo: 'bar'})
      done()
    })
  })

  it('non handled non retriable errors', function (done) {
    function fn (cb) {
      setTimeout(function () {
        return cb({code: 'ENOTFOUND'}, {foo: 'bar'})
      }, 0)
    }

    const retryBackoff = createRetryBackoff()

    retryBackoff(fn, function (err, result) {
      should(err).be.eql({code: 'ENOTFOUND'})
      should(result).be.eql({foo: 'bar'})
      done()
    })
  })

  it('handle retriable errors', function (done) {
    function fn (cb) {
      setTimeout(() => cb({code: 'ETIMEDOUT'}, {foo: 'bar'}), 0)
    }

    const retryBackoff = createRetryBackoff({
      retries: 1
    })

    const timestamp = Date.now()

    retryBackoff(fn, function (err, result) {
      const now = Date.now()
      const diff = now - timestamp

      should(diff).be.within(2000, 2200)
      should(err).be.eql({code: 'ETIMEDOUT'})
      should(result).be.eql({foo: 'bar'})
      done()
    })
  })

  it('handle timeout', function (done) {
    function fn (cb) {
      setTimeout(() => cb(null, {foo: 'bar'}), 2000)
    }

    const retryBackoff = createRetryBackoff({
      retries: 2,
      timeout: 1000
    })

    const timestamp = Date.now()

    retryBackoff(fn, function (err, result) {
      const now = Date.now()
      const diff = now - timestamp

      diff.should.be.within(9000, 9200)
      should(err.code).be.equal('ETIMEDOUT')
      should(err.message).be.equal('timeout of 1000ms exceeded for callback fn')
      should(result).be.undefined()
      done()
    })
  })

  it('be possible reset counter dynamically', function (done) {
    function fn (cb) {
      return setTimeout(() => cb({code: 'ETIMEDOUT'}, {foo: 'bar'}), 0)
    }

    const retryBackoff = createRetryBackoff({
      retries: 1
    })

    const timestamp = Date.now()

    retryBackoff(fn, function (err, result) {
      should.exists(err)
      retryBackoff.reset()

      retryBackoff(fn, function (err, result) {
        const now = Date.now()
        const diff = now - timestamp

        should(diff).be.within(4000, 4200)
        should(err).be.eql({code: 'ETIMEDOUT'})
        should(result).be.eql({foo: 'bar'})
        done()
      })
    })
  })
})
