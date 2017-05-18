/**
 * @author Eidher Escalona <eidher.escalona@gmail.com>
 * @since March 2017
 */

const async = require("async")
const Canvas = require('canvas')

module.exports = (symbols, callback) => {

    async.waterfall([
        callback => {
            async.map(symbols, getChart, (err, result) => {
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

let getChart = (symbol, callback) => {

    // console.log(symbol.earningsHistory)

    if (!symbol.earningsHistory.epsActual || !symbol.earningsHistory.epsEstimate) {
        callback(null, symbol)
        return
    }

    let width = 165, 
        height = 50,
        canvas = new Canvas(width, height),
        ctx = canvas.getContext('2d')

    ctx.beginPath()
    ctx.moveTo(1, 0)
    ctx.lineTo(1, height - 1)
    ctx.lineTo(width, height - 1)
    ctx.stroke();

    drawChart(ctx, symbol.earningsHistory.epsActual, '#6C0', 2)
    drawChart(ctx, symbol.earningsHistory.epsEstimate, '#BDBDBD', 1)

    symbol.epsChart =  canvas.toDataURL()

    callback(null, symbol)
}

let drawChart = (ctx, data, color, line) => {

    data = initialize(data)

    let max = Math.max.apply(null, data),
    x = 5,
    moveToX = 40
    maxHeight = 40

    ctx.lineWidth = line
    ctx.strokeStyle = color;
    ctx.beginPath()

    data.forEach((value, index) => {

        let y = (value * maxHeight / max) - maxHeight
        y = (y < 0) ? y * -1 : y
        y += 5

        if (index == 0) {
            ctx.moveTo(x, y)
        } else {
            x += moveToX
            ctx.lineTo(x, y);
        }

        // console.log(x,y)
    });

    ctx.stroke();
}

let initialize = data => {

    let min = Math.min.apply(null, data)

    data = data.map(value => {
        return value + (min * -1)
    })

    return data
}