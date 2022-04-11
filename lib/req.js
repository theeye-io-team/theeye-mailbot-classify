const https = require('https')

const isJsonString = (str) => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

module.exports = {

  async Request (options, body) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, res => {
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

      req.on('error', err => {
        console.log('Error: ', err.message)
        reject(err)
      })

      if (body) {
        req.write(body)
      }

      req.end()
    })
  },

  FormRequest (options, formData) {
    return new Promise((resolve, reject) => {
      const req = https.request(options)
      formData.pipe(req)

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
    })
  }
}
