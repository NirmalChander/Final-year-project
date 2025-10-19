# Legal Aura UI

A lightweight, accessible, component-driven UI library for legal applications. Provides reusable React components, design tokens, and documentation to accelerate building consistent user interfaces.

## Features
- Accessible, keyboard-friendly components
- Themeable design tokens (colors, spacing, typography)
- Storybook for interactive documentation
- Build-ready for publishing to an npm registry

## Quick start

Prerequisites:
- Node.js (16+ recommended)
- npm or yarn

Install dependencies:
```bash
npm install
# or
yarn
```

Run locally (development):
```bash
npm run dev
# or
yarn dev
```

Start Storybook (component docs):
```bash
npm run storybook
# or
yarn storybook
```

Build for production:
```bash
npm run build
# or
yarn build
```

Run tests:
```bash
npm test
# or
yarn test
```

Lint and format:
```bash
npm run lint
npm run format
# or
yarn lint
yarn format
```

## Project structure (example)
- src/               — Component source code
   - components/      — Reusable UI components
   - styles/          — Design tokens and global styles
   - utils/           — Shared helpers
- stories/           — Storybook stories
- docs/              — Documentation pages (if any)
- scripts/           — Build/publish helpers
- package.json

Adjust paths to match your repo conventions.

## Development notes
- Components should be:
   - Accessible: proper ARIA, keyboard support, focus management
   - Themed using tokens in styles/design system
   - Unit-tested with consistent coverage
- Keep components small and composable
- Document each component in Storybook with usage examples and props

## Publishing
1. Bump version in package.json.
2. Run build:
    ```bash
    npm run build
    ```
3. Publish to npm (or your registry):
    ```bash
    npm publish --access public
    ```

Configure CI to run tests, linting, and publish on release tags.

## Contributing
- Fork the repo and create a feature branch.
- Open PR against main with descriptive title and tests.
- Follow the code style and run lint/format before submitting.
- Add Storybook examples for new components.

## License
MIT — see LICENSE file.

## Contact
For issues or feature requests, open an issue in this repository.
