/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 9/17/13
 * Time: 8:31 AM
 */
define(function (require) {
	require('bootstrap')

	var toastr = require('toastr')
	var Layout = require('./views/layout')
	var Router = require('./router')
	var Projects = require('./collections/projects')
	var store = require('store').getNamespace('maintainer')

	$(function () {
		store().hub = _.extend({}, Backbone.Events)
		store().projects = new Projects()
		store().notify = toastr

		store().projects.fetch().done(function () {
//			store().router = new Router()
			store().layout = new Layout({
				el: $('#maintainers')
			})
			store().layout.showProjects()
//			Backbone.history.start();
		})
	})
})
