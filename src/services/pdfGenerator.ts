import puppeteer from 'puppeteer';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Invoice, Company, AuthorizationLetter } from '@/types';
import { renderInvoiceToHtml, renderAuthorizationLetterToHtml } from './htmlRenderer';

async function getBrowser() {
  if (process.env.VERCEL) {
    return await puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  } else {
    return await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }
}

export async function generateInvoicePdf(invoice: Invoice, company?: Company | null): Promise<Buffer> {
  const fullHtml = renderInvoiceToHtml(invoice, company);

  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 816,
      height: 1056,
      deviceScaleFactor: 2,
    });
    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export async function generateAuthorizationLetterPdf(
  letter: AuthorizationLetter,
  company?: Company | null
): Promise<Buffer> {
  const fullHtml = renderAuthorizationLetterToHtml(letter, company);

  const browser = await getBrowser();

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 816,
      height: 1056,
      deviceScaleFactor: 2,
    });
    await page.setContent(fullHtml, { waitUntil: 'domcontentloaded' });

    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
