# retry-backoff

![Last version](https://img.shields.io/github/tag/AudienseCo/retry-backoff.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/AudienseCo/retry-backoff/master.svg?style=flat-square)](https://travis-ci.org/AudienseCo/retry-backoff)
[![Dependency status](https://img.shields.io/david/AudienseCo/retry-backoff.svg?style=flat-square)](https://david-dm.org/AudienseCo/retry-backoff)
[![Dev Dependencies Status](https://img.shields.io/david/dev/AudienseCo/retry-backoff.svg?style=flat-square)](https://david-dm.org/AudienseCo/retry-backoff#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/retry-backoff.svg?style=flat-square)](https://www.npmjs.org/package/retry-backoff)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/AudienseCo)

> Handle callback retries with incremental backoff and timeout support.

## Install

```bash
$ npm install retry-backoff --save
```

## Usage

```js
const createRetryBackoff = require('retry-backoff')

function fn (cb) {
  setTimeout(function () {
    return cb(null, {foo: 'bar'})
  }, 1000)
}

const retryBackoff = createRetryBackoff()

retryBackoff(fn, function (err, result) {
  if (err) throw err
  retryBackoff.reset()
  console.log(result) // => {foo: 'bar'}
})
```

If you need to see low level logs, enable it using `DEBUG=retry-backoff`.

## API

### retryBackoff([options])

Creates a backoff function.

#### options

##### timeout

Type: `number`</br>
Default: `30000`

Setup the time (in milliseconds) after consider a request timeout.

##### retries

Type: `number`</br>
Default: `3`

Number of retries before throw a final error.

##### backoff

Type: `function`</br>
Default: `1000 * Math.pow(2, retry) + Math.random() * 100`

The method uses for calculate the incremental delay between sucesive calls, where `retry` is attempt number (starts from 0).

### .reset

Restart the `retries` counter.

## License

MIT © [AudienseCo](https://audiense.com/)
