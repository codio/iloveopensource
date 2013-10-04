/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')
	var tpl = require('tpl!../templates/row.html')

	return Backbone.View.extend({
        attributes: {
            class: 'row'
        },
		render: function () {
            var data = this.model.toJSON()
			this.$el.html(tpl({
				request: data,
                project: data.project.ref
			}))

			return this
		}
	});
})