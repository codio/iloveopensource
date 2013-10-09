/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 1:29 AM
 */
define(function (require) {
	require('backbone')

    var tpl = require('tpl!../templates/list.html'),
        Row = require('./request')

	return Backbone.View.extend({
		events: {
		},
		initialize: function () {
			this.listenTo(this.collection, 'fetched', this.renderRows)
			this.rows = []
		},
        renderRows: function () {
			var list = this.$('.requests-list')
			_.invoke(this.rows, 'remove')
			this.rows = []

            this.showEmpty()
			this.collection.each(function (entry) {
				var view = new Row({model: entry})
				this.rows.push(view)
				view.render()
			}, this)

			list.append(_.pluck(this.rows, 'el'))
		},
        showEmpty: function() {
            var cond = this.collection.length > 0
            this.$('.empty-message').toggle(!cond)
            this.$('.content').toggle(cond)
        },
        remove: function() {
            _.invoke(this.rows, 'remove')
            Backbone.View.prototype.remove.apply(this, arguments)
        },
		render: function () {
			this.$el.html(tpl())
			return this
		}
	});
})