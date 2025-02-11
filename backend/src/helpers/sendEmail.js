import nodeMailer from "nodemailer";
import path from "path";
import dotenv from "dotenv";
import hbs from "nodemailer-express-handlebars";
import { fileURLToPath } from "node:url";

dotenv.config();

const _filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

export const sendEmail = async (
  subject,
  send_to,
  send_from,
  reply_to,
  template,
  name,
  link
) => {
  const transporter = nodeMailer.createTransport({
    service: "Outlook365",
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.CLIENT_EMAIL,
      pass: process.env.CLIENT_PASS,
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  const handlebarsOptions = {
    viewEngine: {
      extNem: ".handlebars",
      partialsDir: path.resolve(_dirname, "../views"),
      defaultLayout: false,
    },
    viewPath: path.resolve(_dirname, "../views"),
    extName: ".handlebars",
  };

  transporter.use("compile", hbs(handlebarsOptions));

  const mailOptions = {
    from: send_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    template: template,
    context: {
      name: name,
      link: link,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("message sent to: %s", info.messageId);
    return info.messageId;
  } catch (error) {
    console.log("error sending email", error);
    throw error;
  }
};
