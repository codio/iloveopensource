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
	var Owner = require('./owner')

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
			obj.owner = obj.owner.toJSON()
			return obj
		},
		parse: function (repo) {
			var result = {
				githubId: repo.id,
				fork: repo.fork,
				name: repo.name,
				url: repo.html_url || repo.url,
				owner: new Owner(repo.owner, {parse: true})
			}

			var exists = store().selected.get(result.githubId)
			if (exists) {
				repo.support = exists.get('support').toJSON()
			}
			result.support = new Support(repo.support)

			return result;
		},
		destroy: function (options) {
			options = options ? _.clone(options) : {};
			var model = this;
			var success = options.success;

			var destroy = function () {
				model.trigger('destroy', model, model.collection, options);
			};

			options.success = function (resp) {
				if (options.wait || model.isNew()) destroy();
				if (success) success(model, resp, options);
				if (!model.isNew()) model.trigger('sync', model, resp, options);
			};

			options.success();
			return false;
		}
	})
})