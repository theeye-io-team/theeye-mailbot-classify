const {Request, FormRequest} = require('./req')
const FormData = require('form-data')


const BASE_URL = JSON.parse(process.env.THEEYE_API_URL || '"https://supervisor.theeye.io"')

class TheEyeFile {
  constructor ({filename, description, is_script, extension, mimetype, file}) {
    
    if(!filename || !description || !is_script || !extension || !mimetype || !file) {
        throw new Error('Missing file params... try {filename, description, is_script, extension, mimetype, file}')
    }

    const formData = new FormData()
    formData.append('filename', filename)
    formData.append('description', description)
    formData.append('is_script', is_script)
    formData.append('extension', extension)
    formData.append('mimetype', mimetype)
    formData.append('file', file)
    
    this.formData = formData
    this.filename = filename

  }

  static FetchAll = async () => {
    const options = {
        host: BASE_URL.split('https://')[1] || BASE_URL.split('http://')[1],
        port: (/https:\/\//gi).test(BASE_URL) ? 443 : 80,
        path: `/${this.customer_name}/file?access_token=${this.access_token}`,
        method: 'GET'
    }

    return await Request(options)
  }

  static GetByName = async (name) => {
      const files = await this.FetchAll()
      
      const foundFile = files.filter(file=>file.filename === name)

      if(foundFile.length === 1) {
          return await this.GetById(foundFile[0].id)
      }

      if(foundFile.length > 1) {
          console.log('More than 1 file was found')
          return foundFile
      }

      console.log('No files found...')
      return false

  }

  static GetById = async (id) => {
    const options = {
        host: BASE_URL.split('https://')[1] || BASE_URL.split('http://')[1],
        port: (/https:\/\//gi).test(BASE_URL) ? 443 : 80,
        path: `/${this.customer_name}/file/${id}?access_token=${this.access_token}`,
        method: 'GET'
    }

    return await Request(options)

  }

  static Download = async ({filename, id}) => {

    if(!filename && !id) {
        throw new Error('No {id} or {filename} supplied...')
    }

      const downloadFile = async (id) => {
        const options = {
            host: BASE_URL.split('https://')[1] || BASE_URL.split('http://')[1],
            port: (/https:\/\//gi).test(BASE_URL) ? 443 : 80,
            path: `/${this.customer_name}/file/${id}/download?access_token=${this.access_token}`,
            method: 'GET'
        }
    
        return await Request(options)
      }
    if(filename) {
        const file = await this.GetByName(filename)

        if(file.length) {
            return file
        }

        return await downloadFile(file.id)
    }

    if(id) {
        return await downloadFile(id)

    }
}

  create = async () => {
    if(!this.formData) {
        return 'File has no form data...'
    }

    const options = {
        host: BASE_URL.split('https://')[1] || BASE_URL.split('http://')[1],
        port: (/https:\/\//gi).test(BASE_URL) ? 443 : 80,
        path: `/${this.customer_name}/file?access_token=${this.access_token}`,
        method: 'POST',
        headers: this.formData.getHeaders()
      }

    return await FormRequest(options, this.formData)

  }

  update = async (id) => {
    if(!this.formData) {
        return 'File has no form data...'
    }

    const options = {
        host: BASE_URL.split('https://')[1] || BASE_URL.split('http://')[1],
        port: (/https:\/\//gi).test(BASE_URL) ? 443 : 80,
        path: `/${this.customer_name}/file/${id}?access_token=${this.access_token}`,
        method: 'PUT',
        headers: this.formData.getHeaders()
      }

    return await FormRequest(options, this.formData)
  }

  upsert = async () => {
    const file = await TheEyeFile.GetByName(this.filename)
    if(file) {
        if(file.length > 1) {
            return file
        }
        return await this.update(file.id)

    } else {
        return await this.create()
    }
    
    }
}

module.exports = TheEyeFile
