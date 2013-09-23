/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 4:05 PM
 */
define(function (require) {
	require('backbone')
	var tpl = require('tpl!../templates/donate-methods.html')

	return Backbone.View.extend({
		attributes: {
			class: 'col donate-methods'
		},
		render: function () {
			this.$el.html(tpl({
				project: this.model.toJSON(),
				donateMethods: this.model.get('donateMethods') || {},
				needHelp: this.options.needHelp,
				customHelp: this.options.customHelp
			}))
			return this
		}
	});
})