/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

const querystring = require('querystring')
const https = require('https')
const async = require("async")
const jsonpath = require('jsonpath');


module.exports = (symbols, callback) => {

    async.waterfall([
        callback => {
            async.map(symbols, getRecomendations, (err, result) => {
                if (err) return callback(err)
                callback(null, result)
            })
        },
        filterRecommendations
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
		symbolType: 1,
		symbolCode: "STK",
		hasOptions: 1
	}

	let options = {
		host: 'www.barchart.com',
		path: `/symbols/${symbol.symbol}/modules?` +  querystring.stringify(query),
		method: 'GET'
	};
	
    // console.log(options.host + options.path)

	https.request(options, (response) => {

		let buffer = ""
		response.on("data", (chunk) =>  buffer += chunk )
		response.on("end", (err) => {
            
            if (err || response.statusCode != '200') 
                return callback(new Error('Error trying to get recommendation json from source api. Result: ' + err + 
                ' RC:' + response.statusCode))

			callback(null, symbol, JSON.parse(buffer))
		}); 

	}).end() 
}

let processRecomendation = (symbol, data, callback) => {

    let overview = data.overview.data[0]
    let overviewRaw = overview.raw
    let opinionPercent = data['barchart-opinion'].data[0].opinionPercent
    
    symbol.lastPrice = overviewRaw.lastPrice
    symbol.barchartOpinionValue = parseInt(opinionPercent.substring(0, opinionPercent.length-1))
    symbol.barchartPosition = data['barchart-opinion'].data[0].position
    symbol.barchartOpinion = data['barchart-opinion'].data[0].opinion
    symbol.avgVolume = overviewRaw.averageVolume
    symbol.avgVolumeFormatted = overview.averageVolume

    callback(null, symbol)

}

let filterRecommendations = (recommendations, callback) => {

    let result = jsonpath.query(recommendations, '$[?(@.barchartPosition=="buy" && @.barchartOpinionValue>=40 && @.avgVolume>300000)]')

    result.sort(function(a, b) {
        return parseFloat(b.barchartOpinionValue) - parseFloat(a.barchartOpinionValue);
    });

    callback(null, result)

}