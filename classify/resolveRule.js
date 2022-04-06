const config = require('../lib/config').decrypt()
const Helpers = require('../lib/helpers')
const { DateTime } = require('luxon')
const ClassificationCache = require('./cache')

const DEFAULT_CACHE_NAME = process.env.DEFAULT_CACHE_NAME || 'classification'

const main = module.exports = async (hash, date) => {
  const cacheName = `${DEFAULT_CACHE_NAME}_${Helpers.buildCacheName(date, config)}`

  console.log({ cacheName })

  const classificationCache = new ClassificationCache({
    cacheId: cacheName,
    runtimeDate: Helpers.buildRuntimeDate(date, config)
  })

  console.log(classificationCache)

  const hashData = classificationCache.getHashData(hash)
  hashData.processed = true
  hashData.data.solved = DateTime.now().setZone(config.timezone).toFormat('HH:mm')
  console.log(hashData)
  return classificationCache.setHashData(hash, hashData)
}

if (require.main === module) {
  main(process.argv[2], process.argv[3]).then(console.log).catch(console.error)
}
