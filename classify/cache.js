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

  createHashData (hash, data) {
    this.data[hash] = dataMap(data)
    this.save(this.data)
    return this
  }

  updateHashData(hash, updates) {
    this.data[hash] = updates
    this.save(this.data)
    return this
  }
}

/**
 *
 * @param {Object} filter
 * @returns {Object} {dataPayload}
 */
const dataMap = (data) => {
  return {
    data: {
      indicatorTitle: data.indicatorTitle,
      indicatorDescription: data.indicatorDescription,
      from: data.from,
      subject: data.subject,
      body: data.body,
      start: data.thresholdTimes.start,
      low: data.thresholdTimes.low,
      high: data.thresholdTimes.high,
      critical: data.thresholdTimes.critical,
      solved: '',
      result: {
        state: '',
        severity: ''
      }
    },
    processed: false,
    alert: {
      low: false,
      high: false,
      critical: false
    }
  }
}


module.exports = ClassificationCache
