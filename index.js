'use strict'

const debug = require('debug')(require('./package.json').name)
const isRetryAllowed = require('is-retry-allowed')
const addTimeout = require('callback-timeout')

const DEFAULT = {
  timeout: 30000,
  retries: 5,
  backoff: (seed) => {
    const noise = Math.random() * 100
    return (1 << seed) * 1000 + noise
  }
}

function createRetryBackoff (opts) {
  opts = Object.assign(DEFAULT, opts)

  const {timeout, retries, backoff} = opts
  let retryCount = 0

  function getRetry (err) {
    if (retryCount > retries || !isRetryAllowed(err)) return 0
    backoff(retryCount)
  }

  function retryBackoff (fn, cb) {
    const args = arguments

    function handleCallback (err) {
      if (!err) return cb.apply(cb, arguments)

      ++retryCount
      const retry = getRetry(err)

      if (!retry) return cb.apply(cb, arguments)

      setTimeout(function () {
        debug('retry: %sms', retry)
        return retryBackoff.apply(fn, args)
      }, retry)
    }

    return fn(addTimeout(handleCallback, timeout))
  }

  retryBackoff.reset = function reset () {
    retryCount = 0
  }

  return retryBackoff
}

module.exports = createRetryBackoff
