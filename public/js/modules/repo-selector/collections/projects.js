/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/14/13
 * Time: 12:25 AM
 */
define(function (require) {
	require('backbone')

	var Project = require('../models/project')
	var store = require('store').getNamespace('repo-selector')

	return Backbone.Collection.extend({
		url: function () {
			return '/supporter/support/' + store().currentType.type + '/' + store().currentType.id
		},
		model: Project,
		fetch: function () {
			var self = this
			this.trigger('prefetch')
			return Backbone.Collection.prototype.fetch.call(this, arguments)
				.done(function () {
					self.trigger('fetched')
				})
		},
		save: function (options) {
			return this.sync('update', this, options);
		}
	})
})