'use strict';
const nodemailer = require('nodemailer');

module.exports = (mailOptions) => {
    
    // create reusable transporter object using the default SMTP transport
    // https://www.google.com/settings/security/lesssecureapps
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'thefunctionalprogrammingguy@gmail.com',
            pass: 'thefpguy'
        }
    });
    
    return {
        
        send: () => {
            
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
            });
            
        }
        
    }
    
}






