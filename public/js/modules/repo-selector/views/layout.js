/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
	require('backbone')

	var toastr = require('toastr')
	var store = require('store').getNamespace('repo-selector')
	var GroupSelector = require('./group-selector')
	var tpl = require('tpl!../templates/layout.html')
	var shareTpl = require('tpl!../templates/share.html')

	return Backbone.View.extend({
		initialize: function () {
			this.listenTo(store().hub, 'repos-loaded', this.loadedRepoList)

			this.listenTo(store().selected, 'add remove', this.updateSelectedCount)
			this.listenTo(store().selected, 'prefetch', this.showLoading)
			this.listenTo(store().selected, 'fetched', this.hideLoading)
			this.render()
		},
		events: {
			'click .share-trigger': 'toggleShare',
			'click .nav-tabs .tab': 'selectTab'
		},
		toggleShare: function () {
			var btn = this.$('.share-trigger'),
				altText = btn.data().altText,
				el = this.$('.share')

			if (!el.is(':visible')) {
				el.slideDown()
			} else {
				el.slideUp()
			}

			btn.data().altText = btn.text()
			btn.text(altText)
		},
		selectTab: function (event) {
			event.preventDefault()
			var tab = $(event.currentTarget).attr('href').replace('#', '')
			store().router.navigate(
				'/type/' + store().currentType.type + '/id/' + store().currentType.id + '/tab/' + tab,
				{trigger: true}
			)
		},
		hideLoading: function () {
			this.$('.loading').hide()
			this.$('.content').slideDown()

			var link = this.getProjectLink()
			this.$('.share').html(shareTpl({
				shareLink: link
			}))

			this.$('.preview').attr('href', link).html('Preview ' + store().currentType.type)
		},
		showLoading: function () {
			this.$('.loading').show()
			this.$('.content').slideUp()
		},
		updateSelectedCount: function (model, collection) {
			this.$('#selected-count').text(collection.length)
		},
		loadedRepoList: function (collection, type) {
			if (type == 'search') return
			this.$('.nav .tab[href="#' + type + '-repos"]').parent().removeClass('disabled')
		},
		render: function () {
			this.$('.loading').hide()
			this.$('.content').html(tpl()).slideDown()
			this.updateSelectedCount(null, store().selected)
			new GroupSelector({
				el: this.$('.support-selector')
			})
		},
		getProjectLink: function () {
			var link = []

			if (store().currentType.type == 'organization') {
				link.push('orgs')
			} else if (store().currentType.type == 'project') {
				link.push('projects')
			} else {
				link.push('users')
			}

			if (store().currentType.type != 'user') {
				link.push(store().currentType.id)
			} else {
				link.push(currentUserName)
			}

			return '/' + link.join('/')
		}
	});
})