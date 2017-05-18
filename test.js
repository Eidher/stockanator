const test = require('./stocks')

// test()

const dateTime = require('date-and-time');
let formatDate = (time) => {
    return dateTime.format(time, 'YYYY-MMM-DD HH:mm:ss')
}
console.log(formatDate(new Date()));

