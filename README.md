# Project requirements

- nvm
- node >= 22.15.0
- pnpm

## Steps for installing nvm in mac:

1. Install nvm

```bash
brew install nvm
```

2. Confirm nvm was installed

```bash
brew list | grep nvm
```

3. Create nvm directory

```bash
mkdir -p ~/.nvm
```

4. Open ~/.zshrc

```bash
nano ~/.zshrc
```

4. Add these commands to the file in order to add nvm to the shell configuration

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && . "$(brew --prefix nvm)/nvm.sh"
[ -s "$(brew --prefix nvm)/etc/bash_completion.d/nvm" ] && . "$(brew --prefix nvm)/etc/bash_completion.d/nvm"
```

5. Save file hitting "ctrl+x"

6. Reload the configuration

```bash
source ~/.zshrc
```

7. Check nvm version

```bash
nvm -v
```

## Steps for installing node in mac:

1. Install node

```bash
nvm install 22
```

2. Check node version

```bash
node -v
```

2. Check current node version used by nvm

```bash
nvm current
```

## Steps for installing pnpm in mac:

1. Install pnpm

```bash
npm install -g pnpm@latest-10
```

2. Check pnpm version

```bash
pnpm --version
```

# How to inialize the project

1. Install all packages via pnpm

```bash
pnpm i
```

2. Run project in dev mode with watch changes

```bash
pnpm run dev
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
