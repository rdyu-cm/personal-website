import { chromium } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const socialPreviewPath = fileURLToPath(
  new URL("../public/social-preview.png", import.meta.url),
);

export async function renderSocialPreview() {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });

    await page.setContent(`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; }
          body {
            position: relative;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 340px;
            align-items: center;
            gap: 72px;
            padding: 78px 88px;
            color: #e4deec;
            background:
              radial-gradient(circle at 18% 0%, rgb(232 182 213 / 20%), transparent 390px),
              radial-gradient(circle at 90% 78%, rgb(169 220 221 / 12%), transparent 360px),
              #251f37;
            font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          body::before {
            content: "";
            position: absolute;
            inset: 32px;
            border: 1px solid rgb(232 182 213 / 28%);
            border-radius: 18px;
            pointer-events: none;
          }
          .copy { position: relative; z-index: 1; }
          .tags {
            margin: 0 0 30px;
            color: #a9dcdd;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: 0.045em;
            text-transform: uppercase;
          }
          h1 {
            margin: 0;
            font-size: 82px;
            line-height: 0.98;
            letter-spacing: -0.04em;
          }
          .thesis {
            max-width: 680px;
            margin: 30px 0 0;
            color: #c9c0d8;
            font-size: 31px;
            font-weight: 520;
            line-height: 1.35;
            letter-spacing: -0.018em;
          }
          .mark {
            position: relative;
            width: 320px;
            height: 320px;
          }
          .line {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 138px;
            height: 2px;
            background: linear-gradient(90deg, #e8b6d5, #a9dcdd);
            transform-origin: 0 50%;
            opacity: 0.78;
          }
          .line:nth-child(1) { transform: rotate(-43deg); }
          .line:nth-child(2) { transform: rotate(42deg); }
          .line:nth-child(3) { transform: rotate(137deg); }
          .line:nth-child(4) { transform: rotate(222deg); }
          .node {
            position: absolute;
            width: 34px;
            height: 34px;
            border: 4px solid #251f37;
            border-radius: 50%;
            background: #e4deec;
            box-shadow: 0 0 0 2px rgb(232 182 213 / 65%);
          }
          .node--center {
            left: calc(50% - 24px);
            top: calc(50% - 24px);
            width: 48px;
            height: 48px;
            background: #e8b6d5;
            box-shadow: 0 0 0 2px rgb(228 222 236 / 80%), 0 0 50px rgb(232 182 213 / 28%);
          }
          .node--a { left: 44px; top: 42px; }
          .node--b { right: 42px; top: 48px; background: #a9dcdd; }
          .node--c { right: 36px; bottom: 44px; }
          .node--d { left: 48px; bottom: 38px; background: #a9dcdd; }
        </style>
      </head>
      <body>
        <main class="copy">
          <p class="tags">AI for science · Molecular simulation</p>
          <h1>Ryan Yu</h1>
          <p class="thesis">Interpretable protein representations, machine-learned potentials, and molecular mechanisms.</p>
        </main>
        <div class="mark" aria-hidden="true">
          <span class="line"></span><span class="line"></span>
          <span class="line"></span><span class="line"></span>
          <span class="node node--center"></span>
          <span class="node node--a"></span><span class="node node--b"></span>
          <span class="node node--c"></span><span class="node node--d"></span>
        </div>
      </body>
    </html>`);

    return await page.screenshot({
      type: "png",
      fullPage: false,
      omitBackground: false,
    });
  } finally {
    await browser.close();
  }
}

function hash(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function assertSocialPreviewCurrent() {
  const [rendered, committed] = await Promise.all([
    renderSocialPreview(),
    readFile(socialPreviewPath),
  ]);

  if (!rendered.equals(committed)) {
    throw new Error(
      `public/social-preview.png is stale (rendered ${hash(rendered)}, committed ${hash(committed)}). Run npm run social-preview.`,
    );
  }
}

async function main() {
  if (process.argv.includes("--check")) {
    await assertSocialPreviewCurrent();
    return;
  }

  await writeFile(socialPreviewPath, await renderSocialPreview());
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  await main();
}
