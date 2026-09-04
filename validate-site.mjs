import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const files = fs.readdirSync('.').filter((file) => file.endsWith('.html'));
const problems = [];
const trackedPages = [
  '首頁新版提案.html',
  '服務方案新版提案.html',
  '實際案例新版提案.html',
  '常見QA新版提案.html',
  '外送經營健檢新版提案.html',
];
const gtmPages = [...trackedPages, 'privacy.html'];
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

for (const file of gtmPages) {
  const source = fs.readFileSync(file, 'utf8');
  const loaderCount = (source.match(/src=["']gtm-loader\.js\?v=1["']/g) || []).length;
  if (loaderCount !== 1) problems.push(`${file}: GTM loader=${loaderCount}`);

  if (file === 'privacy.html') continue;

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

const staticContactPages = ['首頁新版提案.html', '服務方案新版提案.html', '實際案例新版提案.html'];
for (const file of staticContactPages) {
  const source = fs.readFileSync(file, 'utf8');
  const privacyLinkCount = (source.match(/href=["']privacy\.html["']/g) || []).length;
  if (privacyLinkCount < 2) problems.push(`${file}: privacy links=${privacyLinkCount}`);
}

const privacyPage = fs.readFileSync('privacy.html', 'utf8');
for (const requiredText of [
  '競合智數股份有限公司',
  '蒐集目的與資料類別',
  '使用期間、地區、對象與方式',
  '你可以行使的權利',
  '你可以選擇不提供資料',
  'Google Ads',
]) {
  if (!privacyPage.includes(requiredText)) problems.push(`privacy.html: missing ${requiredText}`);
}

const previewBuilder = fs.readFileSync('scripts/build-pages-preview.mjs', 'utf8');
if (!previewBuilder.includes('"privacy.html"')) problems.push('preview builder: privacy.html is not published');
if (previewBuilder.includes('"knowledge.html"')) problems.push('preview builder: old knowledge.html is still published');

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

const qaDataSource = fs.readFileSync('qa-data.js', 'utf8');
const qaSandbox = { window: {} };
vm.runInNewContext(qaDataSource, qaSandbox);
const qaLibrary = qaSandbox.window.QA_LIBRARY || [];
const questionCount = qaLibrary.reduce((total, category) => total + category.questions.length, 0);
const categoryCount = qaLibrary.length;
const coreFaqCount = (faqSource.match(/<section class="section answeredSection"[\s\S]*?<\/section>/)?.[0].match(/<details/g) || []).length;

const knowledgeScript = fs.readFileSync('knowledge-concept.js', 'utf8');
const healthScript = fs.readFileSync('delivery-tools-concept.js', 'utf8');
for (const [file, source] of [
  ['knowledge-concept.js', knowledgeScript],
  ['delivery-tools-concept.js', healthScript],
]) {
  if (source.includes('首頁新版提案.html')) problems.push(`${file}: still loads homepage at runtime`);
}
if (knowledgeScript.includes('knowledge.html')) problems.push('knowledge-concept.js: still loads old knowledge page');

const sharedContent = fs.readFileSync('shared-content.js', 'utf8');
for (const requiredText of ['id="leadForm"', 'id="successModal"', 'class="footer"', 'href="privacy.html"']) {
  if (!sharedContent.includes(requiredText)) problems.push(`shared-content.js: missing ${requiredText}`);
}

for (const file of [...trackedPages, 'privacy.html']) {
  const source = fs.readFileSync(file, 'utf8');
  for (const forbiddenText of ['主管預覽', '展示版只模擬送出', 'IT HANDOFF', '上線前必須完成']) {
    if (source.includes(forbiddenText)) problems.push(`${file}: contains preview-only text ${forbiddenText}`);
  }
}
const oldLabelCount = files.reduce((total, file) => {
  return total + (fs.readFileSync(file, 'utf8').match(/免費工具/g) || []).length;
}, 0);

console.log(`HTML: ${files.join(', ')}`);
console.log(`Knowledge questions: ${questionCount}`);
console.log(`Knowledge categories: ${categoryCount}`);
console.log(`Core FAQs: ${coreFaqCount}`);
console.log(`Old free-tool label: ${oldLabelCount}`);
console.log(`Tracked SEO pages: ${trackedPages.length}`);
console.log(`Privacy page checks: ${staticContactPages.length} static forms + 2 shared dynamic pages`);
console.log(`Broken: ${problems.length ? `\n${problems.join('\n')}` : 'none'}`);

if (questionCount !== 100 || categoryCount !== 7 || coreFaqCount !== 10 || oldLabelCount !== 0 || problems.length) {
  process.exitCode = 1;
}
