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
		path: '/v1/quotes/get?' +  querystring.stringify(query),
		method: 'GET'
	};
	
	let request = https.request(options, (response) => {

		let buffer = ""

		response.on("data", (chunk) => buffer += chunk ); 

		response.on("end", (err) => {
			data = JSON.parse(buffer);
			callback(data);
		}); 

	}); 

	request.end();
	
	return request;

};
