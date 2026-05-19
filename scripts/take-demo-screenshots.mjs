import { chromium } from "playwright";

const BASE_URL = "https://careerguide-ai-one.vercel.app/";
const OUT_DIR = "screenshots";

async function pause(ms = 1500) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function save(page, name) {
  await page.screenshot({
    path: `${OUT_DIR}/${name}`,
    fullPage: true,
  });
  console.log(`Saved ${OUT_DIR}/${name}`);
}

async function clickText(page, text) {
  const button = page.getByText(text, { exact: false }).first();
  await button.waitFor({ timeout: 10000 });
  await button.click();
  await pause(1800);
}

async function main() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  await page.goto(BASE_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem("cg_theme", "light");
  });
  await page.reload({ waitUntil: "networkidle" });
  await pause(1500);

  await save(page, "01-login-signup.png");

  await clickText(page, "Continue with Demo Account");
  await pause(2500);
  await save(page, "02-dashboard.png");

  await clickText(page, "Resume Builder");
  await save(page, "03-resume-builder.png");

  await clickText(page, "Resume Analyzer");
  await save(page, "04-resume-analyzer.png");

  await clickText(page, "Job Match");
  await save(page, "05-job-match.png");

  await clickText(page, "Job Offers");
  await save(page, "06-job-offers.png");

  await clickText(page, "Interview Practice");
  await save(page, "07-interview-practice.png");

  await clickText(page, "History");
  await save(page, "08-history.png");

  await browser.close();

  console.log("DONE ? Screenshots saved in screenshots folder");
}

main().catch((error) => {
  console.error("Screenshot failed ?");
  console.error(error);
  process.exit(1);
});
