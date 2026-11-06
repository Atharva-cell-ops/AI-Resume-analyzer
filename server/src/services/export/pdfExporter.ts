import puppeteer, { Browser } from 'puppeteer';
import { ResumeData, TemplateId } from '@ai-resume/shared';
import { renderResumeToHtml } from './htmlRenderer.js';

let sharedBrowser: Browser | null = null;

async function getBrowserInstance(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.connected) {
    return sharedBrowser;
  }

  sharedBrowser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none'
    ]
  });

  return sharedBrowser;
}

export async function exportResumeToPdf(data: ResumeData, templateId: TemplateId = 'ats-classic'): Promise<Buffer> {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  try {
    const html = renderResumeToHtml(data, templateId);

    await page.setContent(html, {
      waitUntil: 'load'
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: '12mm',
        bottom: '12mm',
        left: '15mm',
        right: '15mm'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}

