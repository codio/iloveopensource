/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
	require('backbone')

	var toastr = require('toastr')
	var store = require('store').getNamespace('repo-selector')
	var tpl = require('tpl!../templates/layout.html')
	var selectorTpl = require('tpl!../templates/support-selector.html')
	var shareTpl = require('tpl!../templates/share.html')

	return Backbone.View.extend({
		events: {
			'click .share-trigger': 'toggleShare',
			'click .nav-tabs .tab': 'selectTab',
			'click .support-selector a[role="menuitem"]': 'select'
		},
		select: function (event) {
			var el = $(event.currentTarget)
			this.$('.support-selector').find('.value').text(el.data().val || el.text())
		},
		selectTab: function (event) {
			event.preventDefault()
			var tab = $(event.currentTarget).attr('href').replace('#', '')
			store().router.navigate(
				'/type/' + store().currentType.type + '/id/' + store().currentType.id + '/tab/' + tab,
				{trigger: true}
			)
		},
		initialize: function () {
			this.listenTo(store().hub, 'repos-loaded', this.loadedRepoList)
			this.listenTo(store().selected, 'add', this.updateSelectedCount)
			this.listenTo(store().selected, 'remove', this.updateSelectedCount)
			this.listenTo(store().selected, 'prefetch', this.showLoading)
			this.listenTo(store().selected, 'fetched', this.hideLoading)
			this.listenTo(store().groups, 'sync', this.showSelector)
			this.render()
		},
		hideLoading: function () {
			this.$('.loading').hide()
			this.$('.content').slideDown()

			var link = this.getProjectLink()
			this.$('.share').html(shareTpl({
				shareLink: link
			}))
			this.$('.preview').attr('href', link)
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

			return link.join('/')
		},
		showLoading: function () {
			this.$('.loading').show()
			this.$('.content').slideUp()
		},
		showSelector: function () {
			this.$('.support-selector').html(selectorTpl({
				groups: store().groups.toJSON(),
				current: store().currentType
			}))
		},
		updateSelectedCount: function (model, collection) {
			this.$('#selected-count').text(collection.length)
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
		render: function () {
			var self = this
			this.$('.loading').hide()
			this.$('.content').html(tpl()).slideDown()
			this.updateSelectedCount(null, store().selected)
		},
		loadedRepoList: function (collection, type) {
			if (type == 'search') return
			this.$('.nav .tab[href="#' + type + '-repos"]').parent().removeClass('disabled')
		}
	});
})