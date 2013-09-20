/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:26 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var Repo = require('../models/repo')

	return Backbone.Collection.extend({
		model: Repo,
		url: function () {
			return '/supporter/github/' + this.path;
		},
		initialize: function (models, options) {
			options = options || {}
			options.path && (this.path = options.path)
			options.type && (this.type = options.type)
			this.listenTo(store().selected, 'fetched', this.setUpstreamSupport)
		},
		setUpstreamSupport: function() {
			_.invoke(this.models, 'setUpstreamSupport')
			this.trigger('repos-loaded')
		},
		fetch: function (options) {
			var self = this
			var request = Backbone.Collection.prototype.fetch.call(this, options);
			request.done(function () {
				self.trigger('repos-loaded')
				store().hub.trigger('repos-loaded', self, self.type)
			})

			return request
		}
	})
})