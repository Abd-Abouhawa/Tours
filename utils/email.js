const nodemailer = require('nodemailer');

const sendEmail = async options => {
    // 1) Create a transporter
    var transporter = nodemailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "87ef6e9006739a",
            pass: "9fce13b33420b9"
        }
    });

    // 2) Define email options
    const mailOptions = {
        from: 'Abd Abouhawa',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
}

module.exports = sendEmail;