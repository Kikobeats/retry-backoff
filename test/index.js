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
      result.should.be.eql({foo: 'bar'})
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
      err.should.be.eql({code: 'ENOTFOUND'})
      result.should.be.eql({foo: 'bar'})
      done()
    })
  })

  it('handle retriable errors', function (done) {
    function fn (cb) {
      setTimeout(function () {
        return cb({code: 'ETIMEDOUT'}, {foo: 'bar'})
      }, 0)
    }

    const retryBackoff = createRetryBackoff({
      retries: 1
    })

    const timestamp = Date.now()

    retryBackoff(fn, function (err, result) {
      const now = Date.now()
      const diff = now - timestamp

      diff.should.be.within(2000, 2100)
      err.should.be.eql({code: 'ETIMEDOUT'})
      result.should.be.eql({foo: 'bar'})
      done()
    })
  })

  it('be possible reset counter dynamically', function (done) {
    function fn (cb) {
      setTimeout(function () {
        return cb({code: 'ETIMEDOUT'}, {foo: 'bar'})
      }, 0)
    }

    const retryBackoff = createRetryBackoff({
      retries: 1
    })

    const timestamp = Date.now()

    retryBackoff(fn, function (err, result) {
      retryBackoff.reset()

      retryBackoff(fn, function (err, result) {
        const now = Date.now()
        const diff = now - timestamp

        diff.should.be.within(4000, 4200)
        err.should.be.eql({code: 'ETIMEDOUT'})
        result.should.be.eql({foo: 'bar'})
        done()
      })
    })
  })
})
