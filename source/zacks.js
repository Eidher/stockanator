/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

const https = require('https')
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
		host: 'www.zacks.com',
        path: `/stock/quote/${symbol.symbol}`,
		method: 'GET'
	};
	
    // console.log("https://" + options.host + options.path)

	https.request(options, (response) => {

		let buffer = ""
		response.on("data", (chunk) =>  buffer += chunk )
		response.on("end", (err) => {
            
            if (err || response.statusCode != '200')  {
                console.log(new Error('Error trying to get recommendations from source ZACKS. Result: ' + err + 
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
        }),
        opinion,
        opinions = [global.STRONG_BUY, global.OUT_PERFORM, global.HOLD, global.UNDER_PERFORM, global.SELL]

        let result = $('div.zr_rankbox', 'div.rank_container_right').text()

        let opinionArray = /.*(\d)-.*/g.exec(result)

        if (opinionArray) {
            opinion = Number(opinionArray[1])
        }
        
        if (opinion && opinion > 0) {
            symbol.zacksOpinion = opinions[opinion - 1]
        }
    }

    callback(null, symbol)
}