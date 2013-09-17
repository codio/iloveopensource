/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var Support = require('./support')

	return Backbone.Model.extend({
		idAttribute: 'githubId',
		defaults: {
			name: '',
			url: '',
			support: new Support
		},
		toJSON: function () {
			var obj = Backbone.Model.prototype.toJSON.apply(this, arguments)
			obj.support = obj.support.toJSON()
			return obj
		},
		parse: function (repo) {
			var exists = store().selected.get(repo.githubId)
			if (exists) {
				repo.support = exists.get('support').toJSON()
			}
			repo.support = new Support(repo.support)

			return repo;
		},
		destroy: function (options) {
			options = options ? _.clone(options) : {};
			var model = this;
			var success = options.success;

			var destroy = function () {
				model.trigger('destroy', model, model.collection, options);
			};

			options.success = function (resp) {
				destroy();
				if (success) success(model, resp, options);
				if (!model.isNew()) model.trigger('sync', model, resp, options);
			};

			options.success();
			return false;
		}
	})
})