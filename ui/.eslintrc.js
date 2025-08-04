module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: false
  },
  extends: [
    'eslint:recommended',
    'eslint-config-prettier'
  ],
  plugins: ['html'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script'
  },
  globals: {
    // LinkNova globals - API modules
    'API': 'readonly',
    'Utils': 'readonly', 
    'Components': 'readonly',
    'Category': 'readonly',
    'Topic': 'readonly',
    'CategoryInput': 'readonly',
    'TopicsManager': 'readonly',
    
    // Browser globals commonly used
    'console': 'readonly',
    'window': 'readonly',
    'document': 'readonly',
    'localStorage': 'readonly',
    'sessionStorage': 'readonly',
    'fetch': 'readonly',
    'FormData': 'readonly',
    'URLSearchParams': 'readonly',
    'AbortController': 'readonly',
    'requestAnimationFrame': 'readonly',
    'setTimeout': 'readonly',
    'clearTimeout': 'readonly',
    'setInterval': 'readonly',
    'clearInterval': 'readonly'
  },
  rules: {
    // Code quality
    'no-console': 'off', // Allow console for debugging
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    'no-undef': 'error',
    'no-redeclare': 'error',
    'no-duplicate-case': 'error',
    'no-unreachable': 'error',
    
    // Best practices
    'eqeqeq': ['error', 'always'],
    'curly': ['error', 'all'],
    'default-case': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-useless-concat': 'error',
    'no-void': 'error',
    'no-with': 'error',
    'radix': 'error',
    'wrap-iife': ['error', 'inside'],
    
    // Style (handled by Prettier, but some logical rules)
    'no-mixed-spaces-and-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'eol-last': 'error',
    
    // ES6+
    'prefer-const': 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'warn',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error'
  },
  overrides: [
    {
      // More relaxed rules for configuration files
      files: ['*.config.js', '.eslintrc.js', 'tailwind.config.js'],
      env: {
        node: true
      },
      rules: {
        'no-undef': 'off'
      }
    }
  ]
};