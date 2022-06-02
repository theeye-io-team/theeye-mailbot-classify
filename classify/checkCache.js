require('dotenv').config()
const DEFAULT_CACHE_NAME = process.env.DEFAULT_CACHE_NAME || 'classification'

const IndicatorHandler = require('./indicatorHandler')
const ClassificationCache = require('./cache')
const Helpers = require('../lib/helpers')
const config = require('../lib/config').decrypt()
const FileApi = require('../lib/file')

//FileApi.access_token = process.env.THEEYE_ACCESS_TOKEN

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

  const classificationCache = new ClassificationCache({ config })

  for (const filter of currentFilters) {
    // chequeo de cambios. cualquier cambio require actualizar los indicadores
    const fingerprint = createFilterFingerprint(filter, classificationCache)

    // si no tiene hash, se le asigna uno que coincide con el id que figura en la cache
    if (!filter.id) {
      // se le agrega la info necesaria para el seguimiento de las reglas
      filter.id = fingerprint 
      filter.fingerprint = fingerprint
      filter.enabled = true
      filter.last_update = new Date()
      filter.creation_date = new Date()
      localChanges = true
      console.log(`filter ${filter.id} was upgraded. id/hash added to filter`)
    }

    // esta en cache?
    const data = classificationCache.getHashData(filter.id)
    if (!data) {
      // es una regla nueva
      console.log(`filter ${filter.id} created`)
    } else {
      if (filter.fingerprint !== fingerprint) {
        console.log(`filter ${filter.id} update`)
        filter.last_update = new Date()
        filter.fingerprint = fingerprint
        localChanges = true
      }
    }
  }

  if (localChanges === true) {
    console.log('Local changes. File api upgrades required')
    const file = await FileApi.GetById(rulesFileEvent.config.file)
    file.content = JSON.stringify(currentFilters, null, 2)
    await file.update()
  }

  return {}
}

const createFilterFingerprint = (filter, cache) => {
  const payload = Object.assign({}, filter)
  delete payload.fingerprint
  delete payload.creation_date
  delete payload.last_update
  return cache.createHash(JSON.stringify(payload))
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
  main(process.argv[2] || testPayload)
    .then(console.log)
    .catch((err) => {
      console.error(`${err}`)
    })
}
