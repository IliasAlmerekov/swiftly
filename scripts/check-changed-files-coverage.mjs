import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import istanbulCoverage from 'istanbul-lib-coverage';

const { createCoverageMap } = istanbulCoverage;

const COVERAGE_FILE = path.resolve('coverage/coverage-final.json');
const threshold = Number(process.env.MIN_CHANGED_FILE_COVERAGE ?? '80');
const configuredBaseRef = process.env.COVERAGE_BASE_REF?.trim();

const normalizePath = (value) => value.replaceAll('\\', '/');

const getChangedFiles = () => {
  if (!configuredBaseRef) {
    console.warn(
      'COVERAGE_BASE_REF is not set. Skipping changed-file coverage gate in local mode.',
    );
    return [];
  }

  const output = execSync(`git diff --name-only --diff-filter=AMR ${configuredBaseRef}...HEAD`, {
    encoding: 'utf8',
  });
  const files = output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter(
      (file) =>
        file.startsWith('src/') &&
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.test.tsx') &&
        !file.endsWith('.spec.ts') &&
        !file.endsWith('.spec.tsx'),
    );
  return [...new Set(files)];
};

if (!existsSync(COVERAGE_FILE)) {
  console.error(`Coverage file not found: ${COVERAGE_FILE}`);
  console.error('Run `npm run test:coverage` before running this gate.');
  process.exit(1);
}

const changedFiles = getChangedFiles();
if (changedFiles.length === 0) {
  console.log('No changed source files found for coverage gate.');
  process.exit(0);
}

const rawCoverage = JSON.parse(readFileSync(COVERAGE_FILE, 'utf8'));
const coverageMap = createCoverageMap(rawCoverage);
const coverageFiles = coverageMap.files().map(normalizePath);

const findCoverageFile = (relativeFile) => {
  const normalizedRelative = normalizePath(path.resolve(relativeFile));

  return coverageFiles.find((coverageFile) => {
    const normalizedCoverage = normalizePath(coverageFile);
    return normalizedCoverage === normalizedRelative || normalizedCoverage.endsWith(`/${relativeFile}`);
  });
};

const results = changedFiles.map((relativeFile) => {
  const matchedCoverageFile = findCoverageFile(relativeFile);
  if (!matchedCoverageFile) {
    return {
      file: relativeFile,
      linesPct: 0,
      covered: false,
      reason: 'missing in coverage report',
    };
  }

  const summary = coverageMap.fileCoverageFor(matchedCoverageFile).toSummary();
  const linesPct = summary.lines.pct;

  return {
    file: relativeFile,
    linesPct,
    covered: linesPct >= threshold,
    reason: '',
  };
});

console.log(`Changed-file coverage threshold: ${threshold}%`);
for (const result of results) {
  const status = result.covered ? 'PASS' : 'FAIL';
  console.log(`${status} ${result.file} -> ${result.linesPct.toFixed(2)}%`);
}

const failures = results.filter((result) => !result.covered);
if (failures.length > 0) {
  console.error('\nCoverage gate failed for changed files:');
  for (const failure of failures) {
    console.error(`- ${failure.file}: ${failure.linesPct.toFixed(2)}% ${failure.reason}`.trim());
  }
  process.exit(1);
}

console.log('\nChanged-file coverage gate passed.');
