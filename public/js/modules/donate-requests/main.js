/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function (require) {
	require('plugins/activate-plugins')
	require('moment')

	var toastr = require('toastr')
	var List = require('./views/list')
	var Search = require('./views/search')
	var Requests = require('./collections/requests')

	var store = require('store').getNamespace('donation-requests')

	$(function () {
        var container = $('#donation-requests')

        store().notify = toastr
		store().requests = new Requests()
		store().list = new List({
			el: $('.list', container),
			collection: store().requests
		}).render()
		store().search = new Search({
			el: $('.search', container),
			collection: store().requests
		}).render()

		store().requests.fetch()
	})
})
