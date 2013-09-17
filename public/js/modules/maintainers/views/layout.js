/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 8:34 AM
 */
define(function (require) {
	require('backbone')

	var store = require('store').getNamespace('maintainer')
	var ProjectList = require('./list')

	return Backbone.View.extend({
		initialize: function () {
			this.render()
		},
		render: function () {
			this.$('.loading').hide()
			$('body').tooltip({
				selector: '[data-toggle="tooltip"]'
			});
			return this
		},
		showProjects: function() {
			this.projects = this.projects || new ProjectList
			this.projects.render().$el.appendTo(this.$('.content'))
		}
	});
})