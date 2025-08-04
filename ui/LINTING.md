# LinkNova UI Linting & Formatting

This project uses a comprehensive linting and formatting setup to maintain code quality and consistency across JavaScript, CSS, and HTML files.

## 🛠️ Tools Used

- **ESLint** - JavaScript linting and code quality
- **Stylelint** - CSS linting and formatting
- **HTMLHint** - HTML validation and best practices
- **Prettier** - Code formatting for all file types

## 📦 Installation

Install all linting dependencies:

```bash
npm install
```

## 🚀 Available Commands

### Linting Commands

```bash
# Run all linters
npm run lint

# Run individual linters
npm run lint:js      # JavaScript files
npm run lint:css     # CSS files  
npm run lint:html    # HTML files
```

### Fixing & Formatting Commands

```bash
# Auto-fix all issues where possible
npm run lint:fix

# Auto-fix individual file types
npm run lint:js:fix   # Fix JavaScript issues
npm run lint:css:fix  # Fix CSS issues

# Format all files with Prettier
npm run format

# Check if files are formatted correctly
npm run format:check

# Pre-commit check (lint + format check)
npm run precommit
```

## 📁 File Coverage

### JavaScript Files (`src/**/*.js`)
- **Linter**: ESLint with recommended rules
- **Config**: `.eslintrc.js`
- **Features**:
  - ES2021 syntax support
  - Browser environment globals
  - LinkNova-specific globals (API, Utils, Components, etc.)
  - Best practices enforcement
  - Code quality rules

### CSS Files (`src/**/*.css`)
- **Linter**: Stylelint with standard config
- **Config**: `.stylelintrc.js`
- **Features**:
  - Tailwind CSS directive support
  - CSS custom properties support
  - Color and unit validation
  - Best practices enforcement
  - Excludes generated Tailwind CSS file

### HTML Files (`src/**/*.html`)
- **Linter**: HTMLHint
- **Config**: `.htmlhintrc`
- **Features**:
  - HTML5 doctype validation
  - Accessibility checks (alt attributes)
  - Tag and attribute validation
  - Semantic HTML enforcement

### All Files (Formatting)
- **Formatter**: Prettier
- **Config**: `.prettierrc`
- **Covers**: `.js`, `.css`, `.html`, `.json`, `.md`
- **Features**:
  - Consistent indentation (2 spaces)
  - Single quotes for JavaScript
  - Semicolons enforced
  - Line length limit (100 chars)

## 🎯 Integration

### IDE Integration

#### VS Code
Install these extensions for best experience:
- ESLint
- Stylelint
- HTMLHint
- Prettier - Code formatter

Add to your VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Pre-commit Hooks
Consider adding a pre-commit hook to automatically run linting:

```bash
# Add to package.json scripts or use husky
"pre-commit": "npm run precommit"
```

## 🔧 Configuration Details

### ESLint Configuration
- **Environment**: Browser, ES2021
- **Extends**: `eslint:recommended`, `prettier`
- **Global Variables**: All LinkNova modules and common browser APIs
- **Key Rules**:
  - No undefined variables
  - Prefer const over let/var
  - Consistent equality checks
  - Error on unreachable code

### Stylelint Configuration
- **Extends**: `stylelint-config-standard`, `stylelint-config-prettier`
- **Tailwind Support**: Allows `@tailwind`, `@apply`, etc.
- **Key Rules**:
  - Consistent color format (lowercase hex)
  - No duplicate selectors
  - Proper font-family declarations
  - Unit validation

### HTMLHint Configuration
- **Key Rules**:
  - HTML5 doctype required
  - Alt attributes on images
  - Unique IDs
  - Proper tag pairing
  - Lowercase tag names

### Prettier Configuration
- **Style**: Single quotes, semicolons, 2-space indentation
- **Line Length**: 100 characters
- **Trailing Commas**: None
- **Bracket Spacing**: Enabled

## 🚫 Ignored Files

The following files/directories are ignored by linters:
- `node_modules/`
- `dist/`
- Generated CSS files (`src/static/css/styles.css`)
- Minified files (`*.min.js`, `*.min.css`)
- Log files
- IDE configuration

## 🐛 Troubleshooting

### Common Issues

1. **"X is not defined" errors**
   - Add the global variable to `.eslintrc.js` globals section

2. **Tailwind CSS directives flagged as errors**
   - Ensure Stylelint config includes Tailwind support

3. **Prettier conflicts with other formatters**
   - Disable other formatters in IDE settings
   - Use Prettier as the default formatter

### Disable Rules Temporarily
```javascript
/* eslint-disable-next-line rule-name */
/* stylelint-disable-next-line rule-name */
```

## 📈 Benefits

- **Consistency**: Uniform code style across the project
- **Quality**: Catch errors and potential issues early
- **Maintainability**: Easier to read and maintain code
- **Collaboration**: Consistent formatting for all team members
- **Best Practices**: Enforces web standards and accessibility

## 🔄 Continuous Integration

Add to your CI/CD pipeline:
```yaml
- name: Install dependencies
  run: npm install

- name: Run linting
  run: npm run lint

- name: Check formatting
  run: npm run format:check
```

This ensures all code meets quality standards before deployment.