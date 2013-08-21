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
		flat: function() {
			return _(this.attributes).pick(_.keys(this.defaults)).value()
		},
		count: function() {
			return _(this.attributes).pick(_.keys(this.defaults)).values().compact().value().length
		},
		isEmpty: function () {
			return (!this.attributes.contributing && !this.attributes.supporting && !this.attributes.donating)
		}
	})
})