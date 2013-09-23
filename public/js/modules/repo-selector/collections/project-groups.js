/**
 * Author: krasu
 * Date: 9/17/13
 * Time: 8:41 AM
 */
define(function (require) {
	require('backbone')

	return Backbone.Collection.extend({
		url: '/supporter/groups',
		comparator: function(item) {
			return [!item.get('type'), item.get('username')]
		}
	})
})