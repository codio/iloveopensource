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
	var RepoList = require('./views/repo-list')
	var RepoSearch = require('./views/search')
	var SelectedRepos = require('./views/selected')

	var Repos = require('./collections/repos')
	var Search = require('./collections/search')
	var Projects = require('./collections/projects')
	var ProjectGroups = require('./collections/project-groups')

	var Router = require('./router')
	var store = require('store').getNamespace('repo-selector')

	$(function () {
		store().currentType = {
			type: 'user',
			id: currentUserId
		}

		store().hub = _.extend({}, Backbone.Events)
		store().selected = new Projects()
		store().groups = new ProjectGroups()
		store().repos = {
			search: new Search()
		}

		store().layout = new Layout({
			el: $('#repos-selector')
		})

		store().reposLists = {
			search: new RepoSearch({
				el: store().layout.$('#repo-search'),
				collection: store().repos.search
			}).render(),
			selected: new SelectedRepos({
				el: store().layout.$('#selected-repos'),
				collection: store().selected
			}).render()
		}

		store().groups.fetch()

		_.each({
			subscriptions: 'watched',
			starred: 'starred',
			repos: 'own'
		}, function (type, url) {
			store().repos[type] = new Repos(null, {
				path: 'user/' + url,
				type: type
			})

			store().reposLists[type] = new RepoList({
				el: store().layout.$('#' + type + '-repos'),
				collection: store().repos[type]
			}).render()

			store().repos[type].fetch()
				.fail(function () {
					toastr.error('Failed to load your ' + type + ' repos')
				})
		})

		store().router = new Router()
		Backbone.history.start();
	})
})
