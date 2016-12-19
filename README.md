# retry-backoff

![Last version](https://img.shields.io/github/tag/Kikobeats/retry-backoff.svg?style=flat-square)
[![Build Status](https://img.shields.io/travis/Kikobeats/retry-backoff/master.svg?style=flat-square)](https://travis-ci.org/Kikobeats/retry-backoff)
[![Dependency status](https://img.shields.io/david/Kikobeats/retry-backoff.svg?style=flat-square)](https://david-dm.org/Kikobeats/retry-backoff)
[![Dev Dependencies Status](https://img.shields.io/david/dev/Kikobeats/retry-backoff.svg?style=flat-square)](https://david-dm.org/Kikobeats/retry-backoff#info=devDependencies)
[![NPM Status](https://img.shields.io/npm/dm/retry-backoff.svg?style=flat-square)](https://www.npmjs.org/package/retry-backoff)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/Kikobeats)

> Handle callback retries with incremental backoff and timeout support.

## Install

```bash
$ npm install retry-backoff --save
```

## Usage

```js
var retryBackoff = require('retry-backoff')

function fn() {
  setTimeout({
    console.log('calling callback')
    return cb(null, {foo: 'bar'})
  }, 1000)

}

backoff = retryBackoff()

backoff(fn, function(err, result) {
  if (err) throw err
  backoff.reset()
  console.log(result) // => {foo: 'bar'}
})
```

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
Default: `5`

Number of retries before throw a final error.

##### backoff

Type: `function`</br>
Default: `fibonacci`

The method uses for calculate the incremental delay between sucesive calls.

### .reset

Restart the `retries` counter.

## License

MIT © [Kiko Beats](http://kikobeats.com)
