import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const outputPath = fileURLToPath(
  new URL("../public/social-preview.png", import.meta.url),
);

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
            color: #f0effa;
            background:
              radial-gradient(circle at 18% 0%, rgb(129 120 232 / 22%), transparent 390px),
              radial-gradient(circle at 90% 78%, rgb(103 216 208 / 12%), transparent 360px),
              #11121c;
            font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          body::before {
            content: "";
            position: absolute;
            inset: 32px;
            border: 1px solid rgb(129 120 232 / 28%);
            border-radius: 18px;
            pointer-events: none;
          }
          .copy { position: relative; z-index: 1; }
          .tags {
            margin: 0 0 30px;
            color: #67d8d0;
            font-size: 21px;
            font-weight: 700;
            letter-spacing: 0.045em;
            text-transform: uppercase;
          }
          h1 {
            margin: 0;
            font-size: 82px;
            line-height: 0.98;
            letter-spacing: -0.045em;
          }
          .thesis {
            max-width: 680px;
            margin: 30px 0 0;
            color: #c5c3d7;
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
            background: linear-gradient(90deg, #8178e8, #67d8d0);
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
            border: 4px solid #11121c;
            border-radius: 50%;
            background: #f0effa;
            box-shadow: 0 0 0 2px rgb(129 120 232 / 65%);
          }
          .node--center {
            left: calc(50% - 24px);
            top: calc(50% - 24px);
            width: 48px;
            height: 48px;
            background: #8178e8;
            box-shadow: 0 0 0 2px rgb(240 239 250 / 80%), 0 0 50px rgb(129 120 232 / 28%);
          }
          .node--a { left: 44px; top: 42px; }
          .node--b { right: 42px; top: 48px; background: #67d8d0; }
          .node--c { right: 36px; bottom: 44px; }
          .node--d { left: 48px; bottom: 38px; background: #67d8d0; }
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

  await page.screenshot({
    path: outputPath,
    type: "png",
    fullPage: false,
    omitBackground: false,
  });
} finally {
  await browser.close();
}
