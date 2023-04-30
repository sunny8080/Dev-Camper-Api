const nodemailer = require('nodemailer');

const sendEmail = async (options)=>{
  // create SMTP transporter object
    var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  // Message object
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to:options.email,
    subject: options.subject,
    text:options.message,
  };

  const info = await transporter.sendMail(message);

  // console.log(`Message sent successfully as ${info.messageId}`);
}

module.exports = sendEmail;
