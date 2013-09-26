/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 8:31 AM
 */
define(function (require) {
	require('bootstrap')
	require('plugins/activate-plugins')

	var toastr = require('toastr')
	var Layout = require('./views/list')
	var Projects = require('./collections/project-groups')
	var store = require('store').getNamespace('maintainer')

	$(function () {
		store().hub = _.extend({}, Backbone.Events)
		store().projects = new Projects()
		store().notify = toastr
		store().layout = new Layout({
			el: $('#maintainers')
		})
		store().projects.fetch()
	})
})
