let percentChange = require('./percentChange');
let email = require('./email');
let date = require('date-and-time');

module.exports = () => {
	
	let process = (result) => {
	
		//	console.log(result);
	
		let data = result.data;
		let body = '';

		for(var object in data){

			body += '<tr>'
			body += '<td>' + data[object].symbol + '</td>';
			body += '<td>' + data[object].priceChange + '</td>';
			body += '<td>' + data[object].percentChange + '</td>';
			body += '</tr>'
		}

		let header = '<b>Hola! Soy Stockanator y voy a hacerte millonario!</b><br><br>'
		header += '<p>Para hoy <b>' + date.format(new Date(), 'MM/DD/YYYY') + '</b> tenemos las siguientes acciones:</p>';
		header += '<table cellpadding="5" cellspacing="0">'
		header += '<tr><td><b>Symbol</b></td><td><b>Percent</b></td><td><b>Price</b></td>';
		let footer = '</table>'

		let mailOptions = {
			from: '"Stockanator" <me@stockanator.com>', 
			to: 'eidher.escalona@gmail.com', // list
			subject: 'Hello There ✔',
		//    text: 'Hello world ?', // plain text body
			html: header + body + footer
		};

		let myEmail = email(mailOptions)
		myEmail.send();
	
	};

	percentChange(process);
	
};