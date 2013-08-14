/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function (require) {
	require('bootstrap')
	var toastr = require('toastr')
	var Layout = require('modules/repo-selector/views/layout')
	var Repos = require('modules/repo-selector/collections/repos')
	var Projects = require('modules/repo-selector/collections/projects')
	var store = require('plugins/storage').getNamespace('repo-selector')

	store().hub = _.extend({}, Backbone.Events)
	store().selected = new Projects()
	store().repos = {
		search: new Repos(null, {
			path: 'search/repositories',
			type: 'search'
		})
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
			.done(function () {
				store().hub.trigger('repos-loaded', store().repos[type])
			}).fail(function () {
				toastr.error('Failed to load your ' + type + ' repos')
			})

	})

	new Layout({
		el: $('body')
	})
})
