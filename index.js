'use strict'

const debug = require('debug')(require('./package.json').name)
const isRetryAllowed = require('is-retry-allowed')
const addTimeout = require('callback-timeout')
const mimicFn = require('mimic-fn')

const DEFAULT = {
  timeout: 30000,
  retries: 3,
  backoff: (seed) => {
    const noise = Math.random() * 100
    return (1 << seed) * 1000 + noise
  }
}

function createRetryBackoff (opts) {
  opts = Object.assign(DEFAULT, opts)

  /* node 4 support ¯\_(ツ)_/¯ */
  const timeout = opts.timeout
  const retries = opts.retries
  const backoff = opts.backoff

  let count = 0

  function getRetryDelay (err) {
    if (!isRetryAllowed(err) || count > retries) return 0
    return backoff(count)
  }

  function retryBackoff (fn, cb) {
    const args = arguments

    function handleCallback (err) {
      if (!err) return cb.apply(cb, arguments)
      ++count

      const delay = getRetryDelay(err)
      if (!delay) return cb.apply(cb, arguments)

      debug('count=%s, delay=%s, cb=%s', count, delay, fn.name)
      return setTimeout(() => retryBackoff.apply(fn, args), delay)
    }

    mimicFn(handleCallback, fn)
    const timeoutWrapper = addTimeout(handleCallback, timeout)
    return fn(timeoutWrapper)
  }

  retryBackoff.reset = function reset () {
    count = 0
  }

  return retryBackoff
}

module.exports = createRetryBackoff
