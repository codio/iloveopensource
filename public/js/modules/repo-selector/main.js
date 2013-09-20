/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function (require) {
	require('bootstrap')
	require('plugins/activate-plugins')

	var toastr = require('toastr')
	var Layout = require('./views/layout')
	var Repos = require('./collections/repos')
	var Router = require('./router')
	var Search = require('./collections/search')
	var Projects = require('./collections/projects')
	var ProjectGroups = require('./collections/projects')
	var store = require('store').getNamespace('repo-selector')

	$(function () {

		store().hub = _.extend({}, Backbone.Events)
		store().selected = new Projects()
		store().repos = {
			search: new Search()
		}

		store().selected.fetch().done(function () {
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

			store().layout = new Layout({
				el: $('body')
			})

			store().router = new Router()
			Backbone.history.start();
		})
	})
})
