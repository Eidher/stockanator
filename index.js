let stocks = require('./stocks');
let schedule = require('node-schedule');

var j = schedule.scheduleJob('0 0 * * *', () => {
  	stocks();
	console.log('Stockanator sent you the truth!');
});

