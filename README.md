I Love Open Source
=====================

![ilos](https://github.com/codio/iloveopensource/blob/master/public/images/logo-lightbg.png)

Proclaim your support for your favourite Open Source projects

## Getting Started

Install Node, NPM and Grunt, then install our dependencies:

```bash
$ npm install
```

### CSS and Grunt

This app uses LessCSS for it's CSS, and needs to be compiled to run in the browser. So we created a couple of Grunt tasks to help you along:

 - `grunt build` will compile all Less into `css/main.css`.
 - `grunt build:prod` will build app for production.
 - `grunt watch` will watch all Less files for changes, and recompile when changes are encountered.

### JS and Bower

This app uses bower as provider for vendors js:

 - `grunt bower` will install all dependencies.

### Configuration

Create file config.<your environment name>.js in ./config folder (environment by default is 'development').

 - `./config/index.js` file showing list of all options
 - `example.config.js` - skeleton for new configuration files


### Running

 - `node ./app.js` or `forever ./app.js` for development environment
 - `NODE_ENV=production node ./app.js` for production environment

