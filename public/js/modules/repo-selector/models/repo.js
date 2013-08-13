/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:25 PM
 */
define(function(require) {
	require('backbone')
	var Support = require('modules/repo-selector/models/support')

	return Backbone.Model.extend({
		defaults: {
			name: '',
			url: '',
			support: new Support
		},
		toJSON: function() {
			var obj = Backbone.Model.prototype.toJSON.apply(this, arguments)
			obj.support = obj.support.toJSON()
			return obj
		},
		parse: function(response){
			response.support = new Support(response.support)
			return response;
		}
	})
})