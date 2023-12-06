const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
  var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: { user: "1728b75643d341", pass: "e1a96e42dc1871" },
  });

  await transporter.sendMail({
    from: "manikanta@gmail.com", // sender address
    to: options.toEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  });
};

module.exports = mailHelper;
