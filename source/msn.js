/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

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
		host: 'www.msn.com',
        path: `/en-us/money/stockdetails/analysis/fi-126.1.${symbol.symbol}`,
		method: 'GET'
	};
	
    // console.log(options.host + options.path)

	http.request(options, (response) => {

		let buffer = ""
		response.on("data", (chunk) =>  buffer += chunk )
		response.on("end", (err) => {
            
            if (err || response.statusCode != '200')  {
                console.log(new Error('Error trying to get recommendations from MSN. Result: ' + err + 
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

        let result = $('div.avg-rating-label').text(),
            opinion

        if (result) {
            result = result.toLowerCase().trim()
            result = (result == 'not available') ? null : result
        }
        
        if (result) {

            if (result == 'buy') opinion = global.STRONG_BUY
            else if (result == 'outperform') opinion = global.OUT_PERFORM
            else if (result == 'hold') opinion = global.HOLD
            else if (result == 'underperform') opinion = global.UNDER_PERFORM
            else if (result == 'sell') opinion = global.SELL

            symbol.msnOpinion = opinion
        }
    }

    callback(null, symbol)
}