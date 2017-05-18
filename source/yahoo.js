/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

const querystring = require('querystring')
const https = require('https')
const async = require("async")

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

    let query = {
        formatted: true,
        crumb: 'bcNK5vYczxa',
        modules: 'financialData,earningsHistory,earningsTrend'
    }

	let options = {
		host: 'query2.finance.yahoo.com',
        path: `/v10/finance/quoteSummary/${symbol.symbol}?` + querystring.stringify(query),
		method: 'GET'
	};
	
    // console.log('https' + options.host + options.path)

	https.request(options, (response) => {

		let buffer = ""
		response.on("data", (chunk) =>  buffer += chunk )
		response.on("end", (err) => {
            
            if (err || response.statusCode != '200')  {
                console.log(new Error('Error trying to get recommendations from YAHOO. Result: ' + err + 
                ' statusCode:' + response.statusCode + ' Symbol:' + symbol.symbol))                
                buffer = null
            }
			callback(null, symbol, buffer)
		}); 
	}).end() 
}

let processRecomendation = (symbol, data, callback) => {

    if (data) {

        data = JSON.parse(data)
        let opinion

        try {

            opinion = data.quoteSummary.result[0].financialData.recommendationKey

            if (opinion) {

                if (opinion == 'strong_buy') opinion = global.STRONG_BUY
                else if (opinion == 'buy') opinion = global.OUT_PERFORM
                else if (opinion == 'hold') opinion = global.HOLD
                else if (opinion == 'sell') opinion = global.UNDER_PERFORM
                else if (opinion == 'strong_sell') opinion = global.SELL

                symbol.yahooOpinion = opinion

                getEarningsHistory(symbol, data)
            }

        } catch(err) {
            console.log(new Error(err))
        }
        
    }

    callback(null, symbol)
}

let getEarningsHistory = (symbol, data) => {

    let rawData = data.quoteSummary.result[0],
    earningsHistory = rawData.earningsHistory.history,
    epsActual = [],
    epsEstimate = []

    if (!earningsHistory || !earningsHistory.length) return

    earningsHistory.forEach((value, index) => {
        epsActual.push(value.epsActual.raw)
        epsEstimate.push(value.epsEstimate.raw)
    }); 

    try {
        if (epsEstimate.length) 
            epsEstimate.push(rawData.earningsTrend.trend[0].earningsEstimate.avg.raw)
    } catch (err) {
        console.log(new Error(err))
    }

    symbol.earningsHistory = {
        epsActual: epsActual,
        epsEstimate: epsEstimate
    }
}