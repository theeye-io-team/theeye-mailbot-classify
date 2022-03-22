const { DateTime } = require('luxon')
const config = require('../lib/config').decrypt()
const holidays = require(process.env.HOLIDAYS || '../config/feriados.json')

const getTimeArray = (time) => {
  return {
    hour: Number(time.substring(0, 2)),
    min: Number(time.substring(3, 5))
  }
}



const checkWeekend = (def) => {
  console.log('checkWeekend')

  console.log(def.dayOfWeek)

  if (def.dayOfWeek === 'Saturday') {
    if (def.currentTime >= def.startTime) {
      throw new Error('Weekend: Saturday')
    }
  }

  if (def.dayOfWeek === 'Sunday') {
    throw new Error('Weekend: Sunday')
  }

  if (def.dayOfWeek === 'Monday') {
    if (def.currentTime <= def.startTime) {
      throw new Error('Weekend: Sunday')
    }
  }

  console.log('Not a weekend day')
}

const checkHoliday = (def) => {
  console.log('checkHoliday')

  for (const holiday of holidays) {
    const holidayDate = DateTime.fromFormat(holiday, 'dd-MM-yyyy', { zone: config.timezone })
    const holidayTime = holidayDate.set({ hour: def.startOfDay.timeArray.hour, minute: def.startOfDay.timeArray.min })

    console.log({ holidayDate: holidayDate.toISO(), currentDate: def.currentDate.toISO(), yesterdayDate: def.yesterdayDate.toISO() })

    if (def.currentDate.equals(holidayDate)) {
      if (def.currentTime > holidayTime) {
        throw new Error(`Holiday: ${holiday}`)
      }
    }

    if (def.yesterdayDate.equals(holidayDate)) {
      if (def.currentTime < def.startTime) {
        throw new Error(`Holiday: ${holiday}`)
      }
    }
  }

  console.log('Not a holiday')
}

const main = module.exports = async (datetime) => {

  const currentTime = datetime ? DateTime.fromJSDate(datetime).setZone(config.timezone) : DateTime.now().setZone(config.timezone)
  const timeArray = getTimeArray(config.startOfDay)

  const def = {
    currentTime,
    currentDate: currentTime.startOf('day'),
    yesterdayDate: currentTime.plus({ days: -1 }).startOf('day'),
    startTime: currentTime.set({ hour: timeArray.hour, minute: timeArray.min }),
    dayOfWeek: currentTime.weekdayLong,
    startOfDay: {
      time: config.startOfDay,
      timeArray
    }
  }

  checkWeekend(def)
  checkHoliday(def)

  return { data: true }
}

if (require.main === module) {
  main(process.argv[2]).then(console.log).catch(console.error)
}
