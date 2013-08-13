/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/4/13
 * Time: 4:59 PM
 */
require.config({
	baseUrl: '/js/',
	paths: {
		templates: '/templates',

		rv: 'vendors/require-ractive-plugin/js/rv',
		text: 'vendors/text/js/text',

		Ractive: 'vendors/ractive/js/Ractive',
		jquery: 'vendors/jquery/js/jquery',
		toastr: 'vendors/toastr/js/toastr',
		lodash: 'vendors/lodash/js/lodash',

		gitRepoRequester: 'plugins/repo-requester'
	},
	shim: {
		bootstrap: ['jquery']
	}
});

