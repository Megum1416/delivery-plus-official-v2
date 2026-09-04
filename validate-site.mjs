import fs from 'node:fs';
import path from 'node:path';

const files = fs.readdirSync('.').filter((file) => file.endsWith('.html'));
const problems = [];
const trackedPages = [
  '首頁新版提案.html',
  '服務方案新版提案.html',
  '實際案例新版提案.html',
  '常見QA新版提案.html',
  '外送經營健檢新版提案.html',
];
const schemaExpectations = new Map([
  ['首頁新版提案.html', ['WebSite', 'Organization']],
  ['服務方案新版提案.html', ['Service', 'WebPage']],
  ['實際案例新版提案.html', ['Article', 'WebPage']],
  ['常見QA新版提案.html', ['FAQPage']],
  ['外送經營健檢新版提案.html', ['WebApplication', 'WebPage']],
]);
const searchSignalExpectations = new Map([
  ['首頁新版提案.html', ['外送申請', '菜單建置', '營運協助']],
  ['服務方案新版提案.html', ['外送服務方案', '帳號申請']],
  ['實際案例新版提案.html', ['實際案例', '不二心']],
  ['常見QA新版提案.html', ['外送平台常見問題', '抽成']],
  ['外送經營健檢新版提案.html', ['外送經營健檢', '毛利試算']],
]);

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const canonicals = source.match(/rel=["']canonical["']/g) || [];
  if (canonicals.length !== 1) problems.push(`${file}: canonical=${canonicals.length}`);

  for (const match of source.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)) {
    const target = match[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(target)) continue;
    const resolved = path.resolve(path.dirname(file), target);
    if (!fs.existsSync(resolved)) problems.push(`${file}: missing ${target}`);
  }

  for (const match of source.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(match[1]);
    } catch (error) {
      problems.push(`${file}: invalid JSON-LD (${error.message})`);
    }
  }
}

for (const file of trackedPages) {
  const source = fs.readFileSync(file, 'utf8');
  const loaderCount = (source.match(/src=["']gtm-loader\.js\?v=1["']/g) || []).length;
  if (loaderCount !== 1) problems.push(`${file}: GTM loader=${loaderCount}`);

  for (const schemaType of schemaExpectations.get(file) || []) {
    if (!source.includes(`"@type": "${schemaType}"`)) {
      problems.push(`${file}: missing schema ${schemaType}`);
    }
  }

  for (const signal of searchSignalExpectations.get(file) || []) {
    if (!source.includes(signal)) problems.push(`${file}: missing search signal ${signal}`);
  }

  for (const targetPage of trackedPages) {
    if (targetPage === file) continue;
    if (!source.includes(`href="${targetPage}"`)) {
      problems.push(`${file}: missing internal link to ${targetPage}`);
    }
  }
}

const homepage = fs.readFileSync('首頁新版提案.html', 'utf8');
for (const alias of ['外送加', '外送+', '外送 Plus', '競合智數', 'syncompgo.com']) {
  if (!homepage.includes(alias)) problems.push(`首頁新版提案.html: missing brand alias ${alias}`);
}

const faqSource = fs.readFileSync('常見QA新版提案.html', 'utf8');
const faqSchema = [...faqSource.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]))
  .find((value) => value['@type'] === 'FAQPage');
if (!faqSchema || faqSchema.mainEntity?.length !== 10) {
  problems.push(`常見QA新版提案.html: FAQ schema questions=${faqSchema?.mainEntity?.length ?? 0}`);
}

const gtmLoader = fs.readFileSync('gtm-loader.js', 'utf8');
for (const requiredValue of ['GTM-58ZQ5ZBG', 'syncompgo.com', 'www.syncompgo.com']) {
  if (!gtmLoader.includes(requiredValue)) problems.push(`gtm-loader.js: missing ${requiredValue}`);
}

const siteEvents = fs.readFileSync('site-events.js', 'utf8');
const responseOkIndex = siteEvents.indexOf('if (!result?.ok)');
const successEventIndex = siteEvents.indexOf('track("lead_form_submit_success"');
if (responseOkIndex < 0 || successEventIndex < responseOkIndex) {
  problems.push('site-events.js: success event is not guarded by a successful receiver response');
}

const knowledge = fs.readFileSync('knowledge.html', 'utf8');
const questionCount = (knowledge.match(/class="qa-item"/g) || []).length;
const categoryCount = (knowledge.match(/data-category-group=/g) || []).length;
const coreFaqCount = (knowledge.match(/<section class="answered-faq"[\s\S]*?<\/section>/)?.[0].match(/<details/g) || []).length;
const oldLabelCount = files.reduce((total, file) => {
  return total + (fs.readFileSync(file, 'utf8').match(/免費工具/g) || []).length;
}, 0);

console.log(`HTML: ${files.join(', ')}`);
console.log(`Knowledge questions: ${questionCount}`);
console.log(`Knowledge categories: ${categoryCount}`);
console.log(`Core FAQs: ${coreFaqCount}`);
console.log(`Old free-tool label: ${oldLabelCount}`);
console.log(`Tracked SEO pages: ${trackedPages.length}`);
console.log(`Broken: ${problems.length ? `\n${problems.join('\n')}` : 'none'}`);

if (questionCount !== 100 || categoryCount !== 7 || coreFaqCount !== 10 || oldLabelCount !== 0 || problems.length) {
  process.exitCode = 1;
}
