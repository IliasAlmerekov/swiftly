import fs from 'node:fs';
import path from 'node:path';

const distAssetsDir = path.resolve('dist/assets');

const KB = 1024;
const budgets = {
  maxEntryChunkKb: 800,
  maxLargestChunkKb: 800,
  maxDashboardChunkKb: 550,
  maxLiquidEtherChunkKb: 550,
  maxCssChunkKb: 100,
  maxTotalJsKb: 2200,
};

const toKb = (bytes) => bytes / KB;

const fail = (message) => {
  console.error(`PERF_BUDGET_FAIL: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(distAssetsDir)) {
  console.error(`PERF_BUDGET_FAIL: dist assets directory not found: ${distAssetsDir}`);
  process.exit(1);
}

const files = fs.readdirSync(distAssetsDir);
const jsFiles = files.filter((name) => name.endsWith('.js'));
const cssFiles = files.filter((name) => name.endsWith('.css'));

if (jsFiles.length === 0) {
  console.error('PERF_BUDGET_FAIL: no JS chunks found in dist/assets');
  process.exit(1);
}

const getFileSize = (name) => fs.statSync(path.join(distAssetsDir, name)).size;

const jsChunks = jsFiles.map((name) => ({
  name,
  size: getFileSize(name),
  kb: toKb(getFileSize(name)),
}));
const cssChunks = cssFiles.map((name) => ({
  name,
  size: getFileSize(name),
  kb: toKb(getFileSize(name)),
}));

const entryChunk = jsChunks.find((chunk) => /^index-.*\.js$/u.test(chunk.name));
const dashboardChunk = jsChunks.find((chunk) => /^DashboardPage-.*\.js$/u.test(chunk.name));
const liquidEtherChunk = jsChunks.find((chunk) => /^LiquidEther-.*\.js$/u.test(chunk.name));
const largestChunk = [...jsChunks].sort((a, b) => b.size - a.size)[0];
const largestCssChunk = [...cssChunks].sort((a, b) => b.size - a.size)[0];
const totalJsKb = jsChunks.reduce((sum, chunk) => sum + chunk.kb, 0);

if (!entryChunk) {
  fail('entry chunk index-*.js is missing');
} else if (entryChunk.kb > budgets.maxEntryChunkKb) {
  fail(
    `entry chunk ${entryChunk.name} is ${entryChunk.kb.toFixed(2)}KB, limit ${budgets.maxEntryChunkKb}KB`,
  );
}

if (!dashboardChunk) {
  fail('dashboard route chunk DashboardPage-*.js is missing');
} else if (dashboardChunk.kb > budgets.maxDashboardChunkKb) {
  fail(
    `dashboard chunk ${dashboardChunk.name} is ${dashboardChunk.kb.toFixed(2)}KB, limit ${budgets.maxDashboardChunkKb}KB`,
  );
}

if (!liquidEtherChunk) {
  fail('LiquidEther chunk LiquidEther-*.js is missing');
} else if (liquidEtherChunk.kb > budgets.maxLiquidEtherChunkKb) {
  fail(
    `LiquidEther chunk ${liquidEtherChunk.name} is ${liquidEtherChunk.kb.toFixed(2)}KB, limit ${budgets.maxLiquidEtherChunkKb}KB`,
  );
}

if (largestChunk.kb > budgets.maxLargestChunkKb) {
  fail(
    `largest JS chunk ${largestChunk.name} is ${largestChunk.kb.toFixed(2)}KB, limit ${budgets.maxLargestChunkKb}KB`,
  );
}

if (largestCssChunk && largestCssChunk.kb > budgets.maxCssChunkKb) {
  fail(
    `largest CSS chunk ${largestCssChunk.name} is ${largestCssChunk.kb.toFixed(2)}KB, limit ${budgets.maxCssChunkKb}KB`,
  );
}

if (totalJsKb > budgets.maxTotalJsKb) {
  fail(`total JS size is ${totalJsKb.toFixed(2)}KB, limit ${budgets.maxTotalJsKb}KB`);
}

if (process.exitCode === 1) {
  process.exit(1);
}

console.log('PERF_BUDGET_OK');
console.log(`entry: ${entryChunk.name} (${entryChunk.kb.toFixed(2)}KB)`);
console.log(`dashboard: ${dashboardChunk.name} (${dashboardChunk.kb.toFixed(2)}KB)`);
console.log(`liquidEther: ${liquidEtherChunk.name} (${liquidEtherChunk.kb.toFixed(2)}KB)`);
console.log(`largest_js: ${largestChunk.name} (${largestChunk.kb.toFixed(2)}KB)`);
if (largestCssChunk) {
  console.log(`largest_css: ${largestCssChunk.name} (${largestCssChunk.kb.toFixed(2)}KB)`);
}
console.log(`total_js: ${totalJsKb.toFixed(2)}KB`);
