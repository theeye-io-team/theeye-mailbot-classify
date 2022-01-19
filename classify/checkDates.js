const {DateTime} = require('luxon')
const config = require('../lib/config').decrypt()


const getTimeArray = (time) => {
    return {
        hour: Number(time.substring(0,2)),
        min: Number(time.substring(3,5))
    }
}

const checkWeekend = () => {
    const currentTime = DateTime.fromFormat('17012022','ddMMyyyy').setZone(config.timezone).set({hour:12})
    const timeArray = getTimeArray(config.startOfDay)
    const startTime = DateTime.fromFormat('17012022','ddMMyyyy').setZone(config.timezone).set({hour: timeArray.hour, minute:timeArray.min})

    const def = {
        currentTime:currentTime.toISO(), 
        startTime: startTime.toISO(), 
        dayOfWeek:currentTime.weekdayLong, 
        startOfDay: {
            time: config.startOfDay,
            timeArray
        } 
    }
    
    console.log(def)

    if(def.dayOfWeek === 'Saturday') {
        if(currentTime >= startTime) {
            throw new Error('Weekend: Saturday')
        }
    }

    if(def.dayOfWeek === 'Monday') {
        if(currentTime <= startTime) {
            throw new Error('Weekend: Sunday')
        }
    }

}

const checkHoliday = () => {
    
}


const main = module.exports = async () => {

    checkWeekend()
    checkHoliday()

    return {data:true}

}

if(require.main === module) {
    main().then(console.log).catch(console.error)
}