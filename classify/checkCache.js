require('dotenv').config()
const DEFAULT_CACHE_NAME = process.env.DEFAULT_CACHE_NAME || 'classification'

const IndicatorHandler = require('./indicatorHandler')
const ClassificationCache = require('./cache')
const Helpers = require('../lib/helpers')
const config = require('../lib/config').decrypt()

const fs = require('fs')

const main = module.exports = async (rulesFileEvent) => {
  // cambiamos el contenido de los filtros localmente y debemos actualizar la api.
  // si no fue modificado , evitamos hacer el update del file en la api.
  // si modificamos el archivo permanentemente entra en loop
  let localChanges = false

  let currentFilters
  try {
    currentFilters = JSON.parse(fs.readFileSync(rulesFileEvent.config.path))
  } catch (err) {
    throw err
  }

  const checked = []
  const classificationCache = new ClassificationCache({ config })

  for (const filter of currentFilters) {
    let filterHash
    // chequeo de cambios. cualquier cambio require actualizar los indicadores
    const fingerprint = classificationCache.createHash(JSON.stringify(filter))

    if (!filter.hash) {
      filterHash = fingerprint
      filter.hash = filterHash
      localChanges = true
    }

    const data = classificationCache.getHashData(filterHash)
    if (!data) {
      // create
      console.log(`filter ${JSON.stringify(filter)} added`)
    } else {
      checked.push(filterHash)
      // was updated ?
    }
  }

  if (localChanges === true) {
  }

  return {}
}

const testPayload = {
  last_event: {},
  event_name: "changed",
  type: "file",
  id: "6286b9b9408718d3ca14964b",
  config: {
    file: "6286b9b8408718d3ca14960c",
    is_manual_path: false,
    path: "/opt/theeye/classificationRules.json",
    basename: "classificationRules.json",
    dirname: "/opt/theeye",
    os_username: null,
    os_groupname: null,
    permissions: null
  }
}


if (require.main === module) {
  main(process.argv[2] || testPayload).then(console.log).catch(console.error)
}
