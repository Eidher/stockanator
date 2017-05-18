/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 */

const dateTime = require('date-and-time');

let current = new Date()

let formatDate = (time) => {
    return dateTime.format(time, 'YYYY-MMM-DD')
}

let nextTradingDate = time => {

    time = dateTime.addDays(time, 1)

    while (!isTradingDay(time)) {
        time = dateTime.addDays(time, 1)
    }

    return time
}

let isTradingDay = time => {
    return !['Sa', 'Su'].includes(dateTime.format(time, 'dd'))
}

module.exports = {

    get: days => {
        let time = dateTime.addDays(new Date(), days)
        return formatDate(time);
    },

    today: () => {
        return formatDate(new Date());
    },

    tomorrow: () => {
        let time = dateTime.addDays(new Date(), 1)
        return formatDate(time);
    },

    afterTomorrow: () => {
        let time = dateTime.addDays(new Date(), 2)
        return formatDate(time);
    },

    next: (more) => {

        current = nextTradingDate(current)

        while (more || 0 > 0) {
            current = nextTradingDate(current)
            more--
        }
                
        return formatDate(current)
    }
}