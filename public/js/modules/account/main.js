/**
 * Author: krasu
 * Date: 9/23/13
 * Time: 3:42 PM
 */
define(function (require) {
	require('plugins/activate-plugins')
	require('backbone')


	$(function () {
		var tabsHolder = $('.nav.nav-tabs')
		var defaultTab = $('a.tab:first', tabsHolder).attr('href').slice(1)

		new (Backbone.Router.extend({
			routes: {
				'*actions': 'selectTab'
			},
			selectTab: function (tab) {
				tab = tab || defaultTab
				$('a[href="#' + tab + '"]', tabsHolder).tab('show');
			}
		}))

		Backbone.history.start();
	})
})