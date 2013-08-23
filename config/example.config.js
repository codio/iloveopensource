//example config put it in same folder with name config.<environment>.js (config.development.js by default)
var config = module.exports = {};
//override any config option here
config.hostname = 'your hostname';
config.github = {
	clientId: '',
	clientSecret: ''
}
