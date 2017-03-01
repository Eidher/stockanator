let querystring = require('querystring');
let https = require('https');

module.exports = (callback) => {

	let query = {
		lists: "stocks.performance.advances.percent.today.us",
		orderDir: "desc",
		fields: "symbol,priceChange,percentChange",
		orderBy: "percentChange",
		page: 1,
		limit: 5,
		raw: 1,
		hasOptions: true
	}

	let options = {
		host: 'core-api.barchart.com',
		path: '/v1/quotes/get' + '?' +  querystring.stringify(query),
		method: 'GET'
	};
	//console.log(options);

	// https://core-api.barchart.com/v1/quotes/get?lists=lists%3Astocks.performance.advances.percent.today.us&orderDir=desc&fields=symbol%2CpriceChange%2CpercentChage&orderBy=percentChange&page=1&limit=5&raw=1
	
	// get is a simple wrapper for request()
	// which sets the http method to GET
	let request = https.request(options, (response) => {
		// data is streamed in chunks from the server
		// so we have to handle the "data" event    
		let buffer = ""

		response.on("data", (chunk) => buffer += chunk ); 

		response.on("end", (err) => {
			data = JSON.parse(buffer);
//			console.log("FROM END:");
//			console.log(data);
			
			callback(data);
		}); 

	}); 

	request.end();
	
	return request;

};
