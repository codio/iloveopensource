/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
	require('backbone')

	var toastr = require('toastr')
	var RepoList = require('modules/repo-selector/views/repo-list')
	var RepoSearch = require('modules/repo-selector/views/search')
	var SelectedRepos = require('modules/repo-selector/views/selected')
	var store = require('plugins/storage').getNamespace('repo-selector')
	var tpl = require('tpl!templates/repo-selector/layout.html')

	return Backbone.View.extend({
		events: {
			'click #save-changes': 'saveChanges'
		},
		initialize: function () {
			this.listenTo(store().hub, 'repos-loaded', this.renderRepoList)
			this.listenTo(store().selected, 'add', this.updateSelectedCount)
			this.listenTo(store().selected, 'remove', this.updateSelectedCount)
			this.render()
		},
		updateSelectedCount: function (model, collection) {
			this.$('#selected-count').text(collection.length)
		},
		saveChanges: function () {
			var btn = $('#save-changes')
			if (btn.attr('disabled')) return

			btn.attr('disabled', true)

			$.post('/save-projects', {repos: store().selected.toJSON()})
				.done(function () {
					toastr.success('All changes saved!', 'Success!')
				})
				.fail(function (message) {
					console.log(arguments)
					toastr.error(message)
				})
				.always(function () {
					btn.attr('disabled', false)
				})
		},
		render: function () {
			var self = this

			this.$('#repos-selector').html(tpl({
				selectedCount: store().selected.length
			}))

			store().searchView = new RepoSearch({
				el: this.$('#repo-search'),
				collection: store().repos.search
			}).render()

			store().selectedView = new SelectedRepos({
				el: this.$('#selected-repos'),
				collection: store().selected
			}).render()
		},
		renderRepoList: function (collection) {
			this.$('a[href="#' + collection.type + '-repos"]').parent().removeClass('disabled')

			var view = new RepoList({
				el: this.$('#' + collection.type + '-repos'),
				collection: collection
			})

			view.render()
		}
	});
})