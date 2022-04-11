const puppeteer = require('puppeteer')
const Files = require('../lib/file')
const {DateTime} = require('luxon')
const fs = require('fs')
const config = require('../lib/config').decrypt()

Files.access_token = config.api.accessToken

const baseUrl = 'https://www.argentina.gob.ar/interior/feriados-nacionales-'
const browserOptions = {
    headless: true,
    handleSIGINT: false,
    handleSIGTERM: false,
    handleSIGHUP: false,
    // executablePath: '/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-features=site-per-process',
      '--disable-gpu',
      '--window-size=1920,1024'
    ]
  }

const main = module.exports = async (year) => {
    if(!year) {
        year = DateTime.now().toFormat('yyyy')
    }

    const url = `${baseUrl}${year}`

    const browser = await puppeteer.launch(browserOptions)
    const page = await browser.newPage()
    await page.goto(url)

    const feriados = await page.evaluate((year)=> {
        const eles=[]

        document.getElementById('calendar-container')
            .querySelectorAll('div.cont').forEach( (ccc, index) => { 
                ccc.querySelectorAll('p').forEach(p => {
                    const text = p.innerText
                    if (/\([a|b|c]\)$/.test(text) === false) {
                        const day = Number(text.split('.')[0])
                        if(text || day!==0) {
                            eles.push( {year, month:index + 1, day, text })
                        }
                    }
                })
            })

        return eles
    }, year)
    
    fs.writeFileSync('./feriados.json', JSON.stringify(feriados))

    const fileData = {
        filename: 'feriados.json',
        description: `Automatically generated on ${new Date().toISOString()}`,
        is_script: 'true',
        extension: 'json',
        mimetype: '-',
        file: fs.createReadStream('./feriados.json')
    }

    const file = new Files(fileData)

    file.access_token = Files.access_token
    file.customer_name = Files.customer_name
    
    await file.upsert()

    fs.unlinkSync('./feriados.json')

}

if(require.main === module) {
    main(process.argv[2]).then(console.log).catch(console.error)
}