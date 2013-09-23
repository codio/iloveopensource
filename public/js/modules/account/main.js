/**
 * Author: krasu
 * Date: 9/23/13
 * Time: 3:42 PM
 */
define(function (require) {
	require('plugins/activate-plugins')
	require('backbone')


	$(function () {
		var tabsHolder = $('#user-repos .nav')

		new (Backbone.Router.extend({
			routes: {
				'*actions': 'selectTab'
			},
			selectTab: function (tab) {
				console.log(arguments)
				tab = tab || 'personal'
				$('a[href="#' + tab + '"]', tabsHolder).tab('show');
			}
		}))

		Backbone.history.start();
	})
})