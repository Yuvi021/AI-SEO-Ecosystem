import puppeteer from 'puppeteer-core';
import chromium from 'chromium';
import fs from 'fs/promises';
import path from 'path';

export async function htmlToPdf(htmlContent, outputPath) {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  // Resolve executable path from chromium package
  const executablePath = typeof chromium === 'string' ? chromium : (chromium?.path || chromium?.executablePath || chromium);

  const browser = await puppeteer.launch({
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });
  try {
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '12mm', right: '12mm', bottom: '12mm', left: '12mm' },
    });
  } finally {
    await browser.close();
  }
}


