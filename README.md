I Love Open Source
=====================

Proclaim your support for your favourite Open Source projects and help OS developers feel the love.

Please go to http://iloveopensource.io to find out more.

##Purpose
I Love Open Source is a way of encouraging users of Open Source code to express their gratitude through a simple acknowledgement a donation.

This short video gives a great overview : TODO Video URL

##Our "I Love Open Source" acknowledgements
We use I Love Open Source ourselves. Click on the button below to see our Supporter page.

![ilos](https://github.com/codio/iloveopensource/blob/master/public/images/logo-lightbg.png?raw=true)

##How it came about
When the Codio team were preparing the website, we wanted to show public support for the open source projects we use. We did not want to private donations or statements of support, which no-one was aware of. We wanted to list the projects for all to see, both from the website and the product itself.

From that simple start arose a case of massive scope creep and we added more and more functionality until it ended up as a complete application that all developers can use.

Importantly, I Love Open Source is not just for Open Source developers. Commercial organizations who use Open Source but may not develop Open Source projects themselves now have a perfect means of acknowledgement. Giving acknowledgement and occasionally donations improves the overall health of the OS development community and helps OS developers to keep on developing.

##Viewing the Source Code
The quickest way to browse through the project is to use Codio itself. We will shortly be annotating the project, to help you find your way around the code.

[![Show me the Code at Codio](https://codio-public.s3.amazonaws.com/sharing/show-me-the-code.png)](https://codio.com/codio/iloveopensource)

#Developers Information
If you are interested in contributing to I Love Open Source, please read this section. 

If you want to discuss general ideas please contact fmay at codio.com. For general stuff, please use GitHub Issues.

## Getting Started
Install Node, NPM and Grunt, then install our dependencies:

```bash
$ npm install
```

### CSS and Grunt

This app uses LessCSS for it's CSS, and needs to be compiled to run in the browser. So we created a couple of Grunt tasks to help you along:

 - `grunt build` will compile all Less into `css/main.css`.
 - `grunt build:prod` will build app for production.
 - `grunt update` will fetch all vendors js and build app for production.
 - `grunt watch` will watch all Less files for changes, and recompile when changes are encountered.

### JS and Bower

This app uses bower wrapper [grunt-bower-task](https://github.com/yatskevich/grunt-bower-task) as provider for vendors js:

 - `grunt bower` will install all dependencies.

### Configuration

Create file config.<your environment name>.js in ./config folder (environment by default is 'development').

 - `./config/index.js` file showing list of all options
 - `example.config.js` - skeleton for new configuration files

### Deploying

The [Capistrano](http://capistranorb.com/) Ruby Gem is used to deploy this app.

Run [Bundler](http://gembundler.com/) to install Capistrano and its requirements:

```bash
$ bundle install
```
**NOTE:** Deploying requires that you have your public SSH key installed on the staging and production servers.

To deploy to production (_be careful_):

```bash
$ cap production deploy
```

To deploy to staging (http://staging.iloveopensource.io/):

```bash
$ cap staging deploy
```

### Running

 - `node ./app.js` or `forever ./app.js` for development environment
 - `NODE_ENV=production node ./app.js` for production environment

