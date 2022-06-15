const MailBot = require('../lib/mailbot')
const Files = require('../lib/file')

const config = require('../lib/config').decrypt()

Files.access_token = config.api.accessToken

const main = module.exports = async ( ) => {

    const mailBot = new MailBot(config)
    await mailBot.connect()

    const messages = await mailBot.searchMessages({subject: config.feriados.emailSubject})

    for(const message of messages) {
        const content = await message.getContent()

        const arrayFeriados = parseContent(content.text)

        if(!arrayFeriados.length) {
            throw new Error('Array sin contenido')
        }

        if(typeof(arrayFeriados[0]) !== 'string') {
            throw new Error('Array inválido')
        }
       
        const fileData = {
            filename: config.feriados.filename || 'feriados.json',
            description: `Automatically generated on ${new Date().toISOString()}`,
            contentType: 'application/json',
            content: JSON.stringify(arrayFeriados, null, 2)
          }
        
          await Files.Upsert(fileData)
          await message.move()
    }

    return messages
    
}

const parseContent = (json) => {
    try {
        return JSON.parse(json)
    } catch(err) {
        throw new Error('Contenido inválido')
    }
}

if(require.main === module) {
    main().then(console.log).catch(console.log)
}