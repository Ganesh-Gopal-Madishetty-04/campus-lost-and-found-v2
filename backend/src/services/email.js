// Console mode: emails are printed, not sent.
// Later, replace the body of this function with nodemailer.
async function sendEmail({ to, subject, text }) {
  console.log('\n----- EMAIL (console mode, not really sent) -----');
  console.log('To:     ' + to);
  console.log('Subject: ' + subject);
  console.log('');
  console.log(text);
  console.log('-------------------------------------------------\n');
}

module.exports = { sendEmail };
