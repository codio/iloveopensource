/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 1:04 PM
 */
define(function (require) {
	require('backbone')

	return Backbone.Model.extend({
		parse: function (user) {
			return {
				githubId: user.id,
				username: user.login,
				url: user.html_url || user.url,
				type: user.type,
				gravatar: user.gravatar_id
			};
		}
	})
})