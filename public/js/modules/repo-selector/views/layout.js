/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 1:33 AM
 */
define(function (require) {
	require('backbone')

	var toastr = require('toastr')
	var store = require('store').getNamespace('repo-selector')
	var tpl = require('tpl!../templates/layout.html')
	var selectorTpl = require('tpl!../templates/support-selector.html')

	return Backbone.View.extend({
		events: {
			'click .share-trigger': 'toggleShare',
			'click .nav-tabs .tab': 'selectTab',
			'click a[role="menuitem"]': 'select'
		},
		select: function (event) {
			var el = $(event.currentTarget)
			this.$('.support-selector').find('.value').text(el.text())
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