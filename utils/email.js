const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const emailOptions = {
    from: 'Yho Deep <darkdark@fdsfsd.io>',
    to: options.email,
    text: options.message,
    subject: options.subject,
  };
  await transport.sendMail(emailOptions);
};
module.exports = sendEmail;
