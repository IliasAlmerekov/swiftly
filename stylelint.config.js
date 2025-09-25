/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    // TailwindCSS rules and compat (handles @tailwind, @apply, etc.)
    'stylelint-config-tailwindcss',
  ],
  rules: {
    // Allow Tailwind's utility-heavy patterns without noisy warnings
    'no-descending-specificity': null,
    // Relax modern color/angle notations and custom property spacing noise
    'hue-degree-notation': null,
    'lightness-notation': null,
    'alpha-value-notation': null,
    'color-function-notation': null,
    'custom-property-empty-line-before': null,
    // Keep rule spacing lenient but consistent
    'rule-empty-line-before': ['always', { except: ['first-nested'], ignore: ['after-comment'] }],
  },
  ignoreFiles: ['dist/**/*', 'build/**/*', 'node_modules/**/*'],
};
