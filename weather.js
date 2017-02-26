let querystring = require('querystring');
let https = require('https');

let query = {
    zip: "33321,us"
}

let options = {
    host: 'api.openweathermap.org',
    path: '/data/2.5/forecast' + '?' +  querystring.stringify(query)
};

// get is a simple wrapper for request()
// which sets the http method to GET
let request = http.get(options, function (response) {
    // data is streamed in chunks from the server
    // so we have to handle the "data" event    
    let buffer = "", 
        data;

    response.on("data", function (chunk) {
        buffer += chunk;
    }); 

    response.on("end", function (err) {
        // finished transferring data
        // dump the raw data
        console.log(buffer);
        console.log("\n");
        data = JSON.parse(buffer);
        console.log(data);
    }); 

}); 

module.exports = {
    send: () => request.send()
}