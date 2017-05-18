/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

const querystring = require('querystring')
const http = require('http')
const async = require("async")
const cheerio = require('cheerio')

module.exports = (symbols, callback) => {

    async.waterfall([
        callback => {
            async.map(symbols, getRecomendations, (err, result) => {
                if (err) return callback(err)
                callback(null, result)
            })
        }
    ],
    (err, result) => {
        if (err) return callback(err)
        callback(null, result)
    })
}

let getRecomendations = (symbol, callback) => {

    async.waterfall([

        callback => {
            requestRecommendation(symbol, callback)
        },
        processRecomendation
    ],
    (err, result) => {

        if (err) return callback(err)

        callback(null, result)
    })
}

let requestRecommendation = (symbol, callback) => {

	let options = {
		host: 'money.cnn.com',
        path: '/quote/forecast/forecast.html?' + querystring.stringify({symb: symbol.symbol}),
		method: 'GET'
	};
	
    // console.log(options.host + options.path)

	http.request(options, (response) => {

		let buffer = ""
		response.on("data", (chunk) =>  buffer += chunk )
		response.on("end", (err) => {
            
            if (err || response.statusCode != '200')  {
                console.log(new Error('Error trying to get recommendations from CNN. Result: ' + err + 
                ' statusCode:' + response.statusCode + ' Symbol:' + symbol.symbol))                
                buffer = null
            }
			callback(null, symbol, buffer)
		}); 
	}).end() 
}

let processRecomendation = (symbol, data, callback) => {

    if (data) {

        let $ = cheerio.load(data, {
            withDomLvl1: true,
            normalizeWhitespace: true,
            xmlMode: false,
            decodeEntities: true
        })

        let result = $('strong.wsod_rating', 'div.wsod_twoCol').first().text(),
            opinion

        if (result) {
            result = result.toLowerCase().trim()

            if (result == 'buy') opinion = global.STRONG_BUY
            else if (result == 'outperform') opinion = global.OUT_PERFORM
            else if (result == 'hold') opinion = global.HOLD
            else if (result == 'underperform') opinion = global.UNDER_PERFORM
            else if (result == 'sell') opinion = global.SELL

            symbol.cnnOpinion = opinion
        }
    }

    callback(null, symbol)
}