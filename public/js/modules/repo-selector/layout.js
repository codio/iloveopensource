/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
	var Ractive = require('Ractive')
	var gitRequester = require('gitRepoRequester')
	var RepoList = require('modules/repo-selector/repo-list')
	var RepoSearch = require('modules/repo-selector/search')
	var SelectedRepos = require('modules/repo-selector/selected')
	var store = require('plugins/storage').getNamespace('repo-selector')
	store().repos = {}
	var userRepos = {
		subscriptions: 'watched',
		starred: 'starred',
		repos: 'own'
	}

	return Ractive.extend({
		template: require('rv!templates/repo-selector/layout.html'),
		data: {
			repos: {}
		},
		init: function () {
			var self = this
			_.each(userRepos, function (type, url) {
				gitRequester('user/' + url)
					.done(function (data) {
						self.rendreRepoList(type, data)
					})
			})

			store().repos.search = new RepoSearch({
				el: '#repo-search'
			})

			store().selectedView = new SelectedRepos({
				el: '#selected-repos'
			})
		},
		rendreRepoList: function (type, data) {
			this.set('repos.' + type, true)

			store().repos[type] = new RepoList({
				el: '#' + type + '-repos',
				data: data
			})
		}
	});

})