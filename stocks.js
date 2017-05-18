/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

const earningsCalendar = require('./earningsCalendar')
const barchart = require('./source/barchart')
const zacks = require('./source/zacks')
const cnn = require('./source/cnn')
const msn = require('./source/msn')
const yahoo = require('./source/yahoo')
const epsChart = require('./chart/epsChart')

const email = require('./utils/email')
const date = require('./utils/tradingDate')
const async = require('async')

// Markets Types
global.PRE_MARKET = 'premarket'
global.AFTER_MARKET = 'after-hours'

// Recommendations
global.STRONG_BUY = 'SB'
global.OUT_PERFORM = 'OP'
global.HOLD = 'H'
global.UNDER_PERFORM = 'UP'
global.SELL = 'S'

module.exports = () => {

	async.waterfall([
		earningsCalendar,
		barchart,
		zacks,
		cnn,
		msn,
		yahoo,
		epsChart,
		prepareHtml
	],
	(err, htmlBody) => {

		if (err) return console.log(err)

		sendEmail(htmlBody)
	})
};

let prepareHtml = (data, callback) => {

	let body = ''

	data.forEach(function(symbol, index) {
		
		body += '<table cellpadding="5" cellspacing="0" width="100%">'

		body += '<tr>'
		body += '<td><b>Barchart</b></td>'
		body += '<td><b>Zacks</b></td>'
		body += '<td><b>CNN</b></td>'
		body += '<td><b>MSN</b></td>'
		body += '<td><b>Yahoo</b></td>'
		body += '<td><b>Nasdaq</b></td>'
		body += '</tr>'

		body += '<tr>'
		body += '<td align="center">' + symbol.barchartOpinion + '</td>'
		body += '<td align="center">' + symbol.zacksOpinion + '</td>'
		body += '<td align="center">' + symbol.cnnOpinion + '</td>'
		body += '<td align="center">' + symbol.msnOpinion + '</td>'
		body += '<td align="center">' + symbol.yahooOpinion + '</td>'
		body += '<td align="center"><a href="' + symbol.imageUrl + '">See</a></td>',
		body += '</tr>'

		body += '</table>'


		body += '<table cellpadding="5" cellspacing="0" width="100%">'

		body += '<tr>'
		body += '<td><b>Symbol</b></td>'
		body += '<td><b>Price</b></td>'
		body += '<td><b>Volume</b></td>'
		body += '<td><b>M</b></td>'
		body += '<td align="center"><b>EPS</b></td>'
		body += '</tr>'

		body += '<tr>'
		body += '<td><font size="4" color="#4d9900"><b>' + symbol.symbol + '</b></font></td>'
		body += '<td>$' + symbol.lastPrice + '</td>'
		body += '<td>' + symbol.avgVolumeFormatted + '</td>'
		body += '<td>' + ((symbol.market == global.AFTER_MARKET) ? 'A' : 'P') + '</td>'
		body += '<td>'+ ((symbol.epsChart) ? '<img src="' + symbol.epsChart + '" />' : '' ) + '</td>'
		body += '</tr>'

		body += '</table><br>'

		if (data.length != (index + 1) ) {
			body += '<hr>'
		}
	})

	let header = '<b>Hi! I\'m Stockanator and I\'m gonna make you a billionaire!</b><br>'
	header += '<p>For today <b>' + date.today() + '</b> we have the following stocks:</p><br>'
	
	let footer = '<br><p><b>Have a Great Productive Day!</b></p>'
	footer += '<p><b>See you soon</b></p>'
	footer += '<p>Atte, <br> Stockanator</p>'

	callback(null, header + body + footer)
};

/**
 * Sends an email with the information of the HOTS stocks for today
 */
let sendEmail = (html) => {

	let mailOptions = {
		from: '"Stockanator" <me@stockanator.com>', 
		to: 'eidher.escalona@gmail.com', // list ,maryandroid0720@gmail.com
		// to: 'eidher.escalona@gmail.com, maryandroid0720@gmail.com',
		subject: 'Hello There ✔',
		//    text: 'Hello world ?', // plain text body
		html: html
	}

	email(mailOptions).send()
}


