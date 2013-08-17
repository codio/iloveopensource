/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function (require) {
	require('bootstrap')
	var toastr = require('toastr')
	var Layout = require('./views/layout')
	var Repos = require('./collections/repos')
	var Search = require('./collections/search')
	var Projects = require('./collections/projects')
	var store = require('store').getNamespace('repo-selector')

	store().hub = _.extend({}, Backbone.Events)
	store().selected = new Projects()
	store().repos = {
		search: new Search()
	}

	if (window.entities) store().selected.reset(window.entities, {parse: true})

	_.each({
		subscriptions: 'watched',
		starred: 'starred',
		repos: 'own'
	}, function (type, url) {
		store().repos[type] = new Repos(null, {
			path: 'user/' + url,
			type: type
		})
		store().repos[type].fetch()
			.fail(function () {
				toastr.error('Failed to load your ' + type + ' repos')
			})

	})

	new Layout({
		el: $('body')
	})
})
