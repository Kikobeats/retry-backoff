'use strict'

var isRetryAllowed = require('is-retry-allowed')
var debug = require('debug')('retry-backoff')
var timeout = require('callback-timeout')

var DEFAULT = {
  timeout: 0,
  retries: 5,
  backoff: function (seed) {
    var noise = Math.random() * 100
    return (1 << seed) * 1000 + noise
  }
}

function retryBackoff (opts) {
  opts = Object.assign(DEFAULT, opts)

  var retryCount = 0

  function backoff (fn, cb) {
    var args = arguments

    function handleCallback (err) {
      if (!err) return cb.apply(cb, arguments)

      ++retryCount
      var retry

      if (retryCount > opts.retries || !isRetryAllowed(err)) retry = 0
      else retry = opts.backoff(retryCount)

      if (!retry) return cb.apply(cb, arguments)

      setTimeout(function () {
        debug('retry: %sms', retry)
        return backoff.apply(fn, args)
      }, retry)
    }

    return fn(timeout(handleCallback, opts.timeout))
  }

  backoff.reset = function reset () {
    retryCount = 0
  }

  return backoff
}

module.exports = retryBackoff
