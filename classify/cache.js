const Cache = require('../lib/cache')
const Helpers = require('../lib/helpers')
const crypto = require('crypto')

const DEFAULT_CACHE_NAME = process.env.DEFAULT_CACHE_NAME || 'classification'
const DEFAULT_CACHE_PATH = process.env.DEFAULT_CACHE_PATH

class ClassificationCache extends Cache {
  constructor (options) {
    const { date, config } = options

    if (!options.cacheId) {
      const timestamp = Helpers.buildCacheTimestampName(date, config)
      options.cacheId = `${DEFAULT_CACHE_NAME}_${timestamp}`
    }

    if (!options.path) {
      options.path = DEFAULT_CACHE_PATH
    }

    super(options)

    const runtimeDate = Helpers.buildRuntimeDate(date, config)
    // load cached data
    this.data = this.get()
    this.setRuntimeDate(runtimeDate)
  }

  isAlreadyProcessed (hash) {
    return this.data[hash].processed === true
  }

  createHash (string) {
    const hash = crypto.createHash('sha1')
    hash.update(string)
    return hash.digest('hex')
  }

  setRuntimeDate (date = null) {
    if (!this.data.runtimeDate) {
      this.data.runtimeDate = (date || new Date())
      this.save(this.data)
    }
    return this
  }

  getHashData (hash) {
    return this.data[hash]
  }

  setHashData (hash, data) {
    this.data[hash] = data
    this.save(this.data)
    return this
  }
}

module.exports = ClassificationCache
