import sgMail from'@sendgrid/mail';
import { readFileSync, unlinkSync } from 'fs';
const env = JSON.parse(readFileSync('./env.json'));
const API_KEY = env.api_key;
sgMail.setApiKey(API_KEY);
export default async function emailFile(filename, email) {
  console.log(filename);
  const attachment = readFileSync(`./temp/${filename}`).toString("base64");
  const msg = {
    to: email, // Change to your recipient
    from: 'ankit@ankitbahl.com', // Change to your verified sender
    subject: 'book',
    html: 'here is book',
    attachments: [
      {
        content: attachment,
        filename: filename,
        type: 'application/epub+zip',
        disposition: 'attachment'
      }
    ]
  }
  try {
    await sgMail.send(msg);
    unlinkSync(`./temp/${filename}`);
    console.log('Email sent');
  } catch (e) {
      console.error(e);
  }
}
