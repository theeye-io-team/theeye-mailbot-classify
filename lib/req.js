const https = require('https')

const isJsonString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

const Request = module.exports = (options, data) => {
    return new Promise((resolve, reject) => {
      const req = https.request(options)

      if(data?.formData) {
        data.formData.pipe(req)
      }

      if (data?.body) {
        req.write(data.body)
      }

      req.on('response', res => {
        const data = []

        res.on('data', chunk => {
          data.push(chunk)
        })

        res.on('end', () => {
          let resData
          try {
            resData = isJsonString(Buffer.concat(data).toString()) ? JSON.parse(Buffer.concat(data).toString()) : Buffer.concat(data).toString()
            resolve(resData)
          } catch (e) {
            reject(e)
          }
        })
      })

      req.on('error', error => reject(error))

      if(!data?.formData) {
        req.end()
      }
    })
  }