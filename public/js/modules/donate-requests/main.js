/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function (require) {
	require('plugins/activate-plugins')
	require('moment')

	var toastr = require('toastr')
	var Layout = require('./views/layout')
	var List = require('./views/list')
	var Requests = require('./collections/requests')

	var store = require('store').getNamespace('donate-requests')

	$(function () {
		store().requests = new Requests()
		store().layout = new Layout({
			el: $('#donate-requests')
		})
		store().list = new List({
			el: store().layout.$('.list'),
			collection: store().requests
		}).render()

		store().requests.fetch()
	})
})
