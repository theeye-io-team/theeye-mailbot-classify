const TheEyeIndicator = require('../lib/indicator')
const config = require('../lib/config').decrypt()
const {DateTime} = require('luxon')

TheEyeIndicator.accessToken = config.api.accessToken

const maxDiff = process.argv.KEEP || 5

const getDate = (dateString) => {
    return DateTime.fromFormat(dateString, 'ddMMyyyy')
}

const getDiffInDays = (date) => {
            const today = DateTime.now().setZone(config.timezone).set({hour:0, minute:0, second: 0, millisecond:0})
            const diff = (today - date) / 86400000
            console.log({
                indicatorDate: date.toISO(),
                today: today.toISO(),
                diff
            })

            return diff
}

const main = module.exports = async () => {
    const resp = await TheEyeIndicator.Fetch()
    let indicators = JSON.parse(resp.body)

    let indicatorsToSort = []
  
    for (const data of indicators) {
      
        if(data.tags.indexOf('summary') !== -1) {
            const indicatorDate = getDate(data.title.replace(/\D+/g, ''))
            const diffInDays = getDiffInDays(indicatorDate)
            
            if(diffInDays > maxDiff) {
                const indicator = new TheEyeIndicator(data.title, data.type)
                indicator.accessToken = TheEyeIndicator.accessToken
                await indicator.remove()
            } else {
                indicatorsToSort.push(data)
            }
        }
    }

    indicatorsToSort.sort((elem1, elem2) => {
        const elem1Date = getDate(elem1.title.replace(/\D+/g, ''))
        const elem2Date = getDate(elem2.title.replace(/\D+/g, ''))
        if (elem1Date > elem2Date) {
          return -1;
        }
        if (elem1Date < elem2Date) {
          return 1;
        }
        return 0;
      });

    let order = 100

    for(const data of indicatorsToSort) {
         const indicator = new TheEyeIndicator(data.title, data.type)
         indicator.state = data.state
         indicator.value = data.value
         indicator.order = order
         indicator.severity = data.severity
         indicator.acl = data.acl
         indicator.accessToken = TheEyeIndicator.accessToken
         indicator.tags = data.tags
         await indicator.put()
         order++
    }
    
  }
  
  if (require.main === module) {
    main().then(console.log).catch(console.error)
  }
  