I Love Open Source
=====================

Proclaim your support for your favourite Open Source projects and help OS developers feel the love.

Please go to http://iloveopensource.io to find out more.

##Purpose
I Love Open Source is a way of encouraging users of Open Source code to express their gratitude by either making a simple acknowledgement, or by making an actual donation.

##Our "I Love Open Source" acknowledgements
We've used various Open Source technologies in the making of I Love Open Source. Click on the link below so you can see who we're saying thanks to.

![ilos](https://github.com/codio/iloveopensource/blob/master/public/images/logo-lightbg.png?raw=true)

#For Developers

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

