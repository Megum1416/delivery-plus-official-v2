import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, ".pages-preview");
const previewBaseUrl = "https://megum1416.github.io/delivery-plus-official-v2/";
const publishedPages = [
  { source: "pages/首頁新版提案.html", destination: "首頁新版提案.html" },
  { source: "pages/服務方案新版提案.html", destination: "服務方案新版提案.html" },
  { source: "pages/實際案例新版提案.html", destination: "實際案例新版提案.html" },
  { source: "pages/常見QA新版提案.html", destination: "常見QA新版提案.html" },
  { source: "pages/外送經營健檢新版提案.html", destination: "外送經營健檢新版提案.html" },
  { source: "pages/privacy.html", destination: "privacy.html" },
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(path.join(root, "assets"), path.join(output, "assets"), { recursive: true });

const sharedFiles = [
  "scripts/site/gtm-loader.js",
  "scripts/site/site-events.js",
  "scripts/site/homepage-concept.js",
  "scripts/site/service-plan-concept.js",
  "scripts/site/results-concept.js",
  "scripts/site/knowledge-concept.js",
  "scripts/site/qa-data.js",
  "scripts/site/delivery-tools-concept.js",
  "scripts/site/shared-content.js",
  "styles/homepage-concept.css",
  "styles/service-plan-concept.css",
  "styles/results-concept.css",
  "styles/knowledge-concept.css",
  "styles/delivery-tools-concept.css",
  "styles/privacy-concept.css",
];

for (const { source, destination } of publishedPages) {
  await cp(path.join(root, source), path.join(output, destination));
}

for (const file of sharedFiles) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  if (file === "scripts/site/shared-content.js") {
    const source = await readFile(path.join(root, file), "utf8");
    await writeFile(destination, source.replaceAll("../assets/", "assets/"), "utf8");
  } else {
    await cp(path.join(root, file), destination);
  }
}

await cp(
  path.join(root, "pages/首頁新版提案.html"),
  path.join(output, "index.html"),
);

const htmlFiles = (await readdir(output)).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const target = path.join(output, file);
  const html = await readFile(target, "utf8");
  const withoutExistingRule = html.replace(
    /\s*<meta\s+name=["']robots["'][^>]*>/gi,
    "",
  );
  const previewUrl = file === "index.html"
    ? previewBaseUrl
    : `${previewBaseUrl}${encodeURI(file)}`;
  const protectedHtml = withoutExistingRule
    .replaceAll("../assets/", "assets/")
    .replaceAll("../styles/", "styles/")
    .replaceAll("../scripts/site/", "scripts/site/")
    .replace(
    /<head([^>]*)>/i,
    '<head$1>\n  <meta name="robots" content="noindex, nofollow">',
  ).replace(
    /(<meta\s+property=["']og:url["']\s+content=["'])[^"']*(["']\s*\/?>)/i,
    `$1${previewUrl}$2`,
  ).replace(
    /(<meta\s+(?:property=["']og:image["']|name=["']twitter:image["'])\s+content=["'])https:\/\/syncompgo\.com\/assets\//gi,
    `$1${previewBaseUrl}assets/`,
  );
  await writeFile(target, protectedHtml, "utf8");
}

await writeFile(
  path.join(output, "robots.txt"),
  "User-agent: *\nAllow: /\n",
  "utf8",
);
await writeFile(path.join(output, ".nojekyll"), "", "utf8");

console.log(`Preview ready: ${htmlFiles.length} HTML files protected with noindex.`);
