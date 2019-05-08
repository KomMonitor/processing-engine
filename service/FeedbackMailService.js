'use strict';

const nodeMailer = require('nodemailer');


/**
 * Send Feedback Mail.
 * Send Feedback Mail.
 *
 * mailInput FeedbackMailInputType details necessary to send the mail
 * no response value expected for this operation
 **/
exports.postFeedbackMail = function(mailInput) {
  return new Promise(function(resolve, reject) {

    var transporter = nodeMailer.createTransport({
            host: 'mail.gmx.net',
            port: 587,
            secure: false,  //true for 465 port, false for other ports
            auth: {
                user: 'kommonitor@gmx.de',
                pass: 'ProjektKM2017'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // file as base64 encoded URI path (i.e. data:text/plain;base64,aGVsbG8gd29ybGQ=)
        var attachement = mailInput.attachement;

    // setup email data with unicode symbols
        var mailOptions = {
            from: '"KomMonitor Projekt" <kommonitor@gmx.de>', // sender address
            to: mailInput.recipientMail, // list of receivers
            subject: mailInput.subject, // Subject line
            text: mailInput.body, // plain text body
            // html: '<b>Hello world?</b>' // html body
            attachments: [
              {   // data uri as an attachment
                  path: attachement
              }
            ]
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
              console.log(error);
              reject(error);
          } else {
            console.log(info);
              resolve(200);
          }
        });


  });
}
