/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/13/13
 * Time: 6:47 PM
 */
define(function (require) {
	require('backbone')

	return Backbone.Model.extend({
		defaults: {
			contributing: false,
			donating: false,
			supporting: false
		},
		isEmpty: function () {
			return !_(this.attributes).find(function (el) {
				return el
			})
		}
	})
})