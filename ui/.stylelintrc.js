module.exports = {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-prettier'
  ],
  rules: {
    // Allow Tailwind CSS directives
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer'
        ]
      }
    ],
    
    // Allow CSS custom properties (CSS variables)
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          // Allow CSS custom properties
          '/^--/',
          // Allow vendor prefixes
          '/^-webkit-/',
          '/^-moz-/',
          '/^-ms-/',
          '/^-o-/'
        ]
      }
    ],
    
    // Allow pseudo-class selectors used by Tailwind
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          'global'
        ]
      }
    ],
    
    // Color and unit rules
    'color-no-invalid-hex': true,
    'color-hex-case': 'lower',
    'color-hex-length': 'short',
    'unit-no-unknown': true,
    'length-zero-no-unit': true,
    
    // Formatting rules (most handled by Prettier)
    'indentation': 2,
    'max-empty-lines': 2,
    'no-eol-whitespace': true,
    'no-missing-end-of-source-newline': true,
    
    // Best practices
    'no-duplicate-selectors': true,
    'no-empty-source': null, // Allow empty CSS files
    'font-family-no-duplicate-names': true,
    'font-family-no-missing-generic-family-keyword': true,
    'function-calc-no-unspaced-operator': true,
    'function-linear-gradient-no-nonstandard-direction': true,
    'function-url-quotes': 'always',
    'string-no-newline': true,
    'declaration-block-no-duplicate-properties': true,
    'declaration-block-no-shorthand-property-overrides': true,
    'block-no-empty': true,
    'selector-max-id': 2,
    'selector-no-qualifying-type': [
      true,
      {
        ignore: ['attribute', 'class']
      }
    ],
    'shorthand-property-no-redundant-values': true,
    'value-no-vendor-prefix': [
      true,
      {
        ignoreValues: ['box', 'inline-box']
      }
    ],
    
    // Allow descent rules for component architecture
    'selector-class-pattern': null, // Allow any class name pattern (for Tailwind)
    'selector-id-pattern': null, // Allow any ID pattern
    'custom-property-pattern': null, // Allow any custom property pattern
    
    // Compatibility with stylelint 14
    'function-no-unknown': null, // Allow unknown functions for Tailwind
    
    // Media queries
    'media-feature-name-no-unknown': true,
    'media-feature-name-no-vendor-prefix': true,
    
    // Comments
    'comment-no-empty': true,
    'comment-whitespace-inside': 'always'
  },
  
  ignoreFiles: [
    'src/static/css/styles.css', // Generated Tailwind file
    'node_modules/**/*',
    'dist/**/*'
  ]
};