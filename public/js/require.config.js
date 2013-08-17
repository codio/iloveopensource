/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 4:59 PM
 */
require.config({
	paths: {
		store: './plugins/store',

		rv: 'vendors/require-ractive-plugin/js/rv',
		tpl: 'vendors/requirejs-tpl/js/tpl',
		text: 'vendors/text/js/text',

		Ractive: 'vendors/ractive/js/Ractive',
		jquery: 'vendors/jquery/js/jquery',
		toastr: 'vendors/toastr/js/toastr',
		lodash: 'vendors/lodash/js/lodash',
		backbone: 'vendors/backbone/js/backbone',
		'require-tpl': 'vendors/require-tpl/js/require-tpl',
		json: 'vendors/json3/js/json3',

		gitRepoRequester: 'plugins/repo-requester'
	},
	shim: {
		bootstrap: ['jquery'],
		backbone: ['jquery', 'lodash', 'json']
	}
});

