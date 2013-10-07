/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 8:41 AM
 */
define(function (require) {
	require('backbone')
	var store = require('store').getNamespace('repo-selector')
	var Request = require('../models/request')

	return Backbone.Collection.extend({
		url: '/service/requests',
        model: Request,
        fetch: function(options) {
            var request = Backbone.Collection.prototype.fetch.apply(this, arguments);
            request.done(_.bind(function () {
                this.trigger('fetched')
            }, this))

            return request
        }
	})
})