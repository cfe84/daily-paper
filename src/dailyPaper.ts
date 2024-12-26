import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { FeverClient } from "./FeverClient";
import { Formatter } from "./Formatter";

dotenv.config();

const FRESHRSS_URL = process.env.FRESHRSS_URL || "";
const API_PASSWORD = process.env.API_PASSWORD || "";
const API_USER = process.env.API_USER || "";
const CATEGORY_IDS = (process.env.CATEGORY_IDS || "").split(",").map(cat => Number.parseInt(cat));
const FETCH_DAYS = parseInt(process.env.FETCH_DAYS || "1");

const SMTP_SERVER = process.env.SMTP_SERVER || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USERNAME = process.env.SMTP_USERNAME || "";
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || "";
const TO_EMAIL = process.env.TO_EMAIL || "";
const FROM_EMAIL = process.env.FROM_EMAIL || "";

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
  
  const formatter = new Formatter({categoryIds: CATEGORY_IDS, maxImageWidthPx: 400});
  const emailContent = formatter.generateEmailContent(groups, feeds, articles);
  await sendEmail("Your Daily Paper", emailContent);
}

