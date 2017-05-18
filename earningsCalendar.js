/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since 2017
 */

const querystring = require('querystring')
const http = require('http')
const tradingDate = require('./utils/tradingDate')
const cheerio = require('cheerio')
const async = require("async")

module.exports = (callback) => {

    let symbols = [];

    async.parallel([
        callback => {
            getSymbols(tradingDate.next(1), global.AFTER_MARKET, result => {
                symbols = symbols.concat(result)
                callback()
            })
        },
        callback => {
            getSymbols(tradingDate.next(), global.PRE_MARKET, result => {
                symbols = symbols.concat(result)
                callback()
            })
        }

    ],err => {
        callback(null, symbols)
    })    

}

let getSymbols = (day, market, callback) => {

    // console.log(day);

    let options = {
        host: 'www.nasdaq.com',
        path: '/earnings/earnings-calendar.aspx' + '?' +  querystring.stringify({date: day}),
        method: 'GET'
    }

    // console.log(options)

    http.request(options, (response) => {
		let buffer = ""
		response.on("data", (chunk) => buffer += chunk )
		response.on("end", (err) => callback(processSymbols(market, buffer)) )
	}).end()

}

let processSymbols = (market, result) => {

    if (!result) return []

    let $ = cheerio.load(result, {
        withDomLvl1: true,
        normalizeWhitespace: true,
        xmlMode: false,
        decodeEntities: true
    })

    let symbolArray = []

    $('#ECCompaniesTable').children().slice(1).each(function(i, elem) {

        let td = $(this).children().first(),
            marketType,
            marketLink,
            marketPieces,
            symbol,
            symbolLink,
            symbolPieces,
            date

        marketLink = td.children().first().attr('href')

        if (marketLink) {

            marketPieces = marketLink.split("/")
            marketType = marketPieces[marketPieces.length - 1]
            symbol = marketPieces[marketPieces.length - 2].toUpperCase()

        } else {

            marketType = global.PRE_MARKET
            
            symbolLink = td.next().children().first().attr('href')
            if (!symbolLink) return true
            symbolPieces = symbolLink.split("/")

            symbol = symbolPieces[symbolPieces.length - 1].toUpperCase()
        }        

        date = td.next().next().text()
        image = `http://www.nasdaq.com/charts/${symbol}_cnb.jpeg`

        // console.log(market, marketType, symbol)

        if (market == marketType) {
            symbolArray.push({
                symbol: symbol,
                date: date,
                market: marketType,
                imageUrl: image
            })
        }
    })
    
    return symbolArray

}