# Floating Scroll

A vanilla js rewrite of the floatingScroll jquery plugin.

### Installation

```
yarn
```

### Start Dev Server

```
yarn run dev
```

### Build Prod Version

```
yarn run build
```

### Features:

- ES6 Support via [babel-loader](https://github.com/babel/babel-loader)
- SASS Support via [sass-loader](https://github.com/jtangelder/sass-loader)
- Linting via [eslint-loader](https://github.com/MoOx/eslint-loader)

When you run `yarn run build` we use the [extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin) to move the css to a separate file and included in the head of your `index.html`, so that the styles are applied before any javascript gets loaded. We disabled this function for the dev version, because the loader doesn't support hot module replacement.
