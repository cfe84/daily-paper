import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { FeverClient } from "./FeverClient";
import { Formatter } from "./Formatter";

dotenv.config();

let missing = false;
function getEnvVariable(name: string) {
  if (name in process.env) {
    return process.env[name];
  }
  console.error(`Missing env variable '${name}'`);
  missing = true;
}

const FRESHRSS_URL = getEnvVariable("FRESHRSS_URL") || "";
const API_PASSWORD = getEnvVariable("API_PASSWORD") || "";
const API_USER = getEnvVariable("API_USER") || "";
const CATEGORY_IDS = (getEnvVariable("CATEGORY_IDS") || "").split(",").map(cat => Number.parseInt(cat));
const FETCH_DAYS = parseInt(getEnvVariable("FETCH_DAYS") || "1");

const SMTP_SERVER = getEnvVariable("SMTP_SERVER") || "";
const SMTP_PORT = parseInt(getEnvVariable("SMTP_PORT") || "587");
const SMTP_USERNAME = getEnvVariable("SMTP_USERNAME") || "";
const SMTP_PASSWORD = getEnvVariable("SMTP_PASSWORD") || "";
const TO_EMAIL = getEnvVariable("TO_EMAIL") || "";
const FROM_EMAIL = getEnvVariable("FROM_EMAIL") || "";

if (missing) {
  process.exit(1);
}

// Run the script
runAsync().catch((error) => {
  console.error("An error occurred:", error);
});


async function sendEmail(subject: string, content: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: SMTP_SERVER,
    port: SMTP_PORT,
    // secure: false,1
    auth: {
      user: SMTP_USERNAME,
      pass: SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: FROM_EMAIL,
    to: TO_EMAIL,
    subject,
    html: content,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// Main function
async function runAsync() {

  const client = new FeverClient({
    url: FRESHRSS_URL,
    apiPassword: API_PASSWORD,
    username: API_USER,
  });

  const since = new Date();
  since.setDate(since.getDate() - FETCH_DAYS);
  const groups = await client.fetchGroups();
  const feeds = await client.fetchFeeds();
  const articles = await client.fetchArticles(since);
  
  const formatter = new Formatter({categoryIds: CATEGORY_IDS, maxImageWidthPx: 400, maxExcerptLength: 600});
  const emailContent = formatter.generateEmailContent(groups, feeds, articles);
  await sendEmail("Your Daily Paper", emailContent);
}

