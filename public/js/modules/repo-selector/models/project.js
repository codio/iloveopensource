/**
 * Created with JetBrains PhpStorm.
 * User: krasu
 * Date: 8/17/13
 * Time: 2:51 PM
 */
define(function (require) {
	require('backbone')
	var Repo = require('./repo')
	var Support = require('./support')
	var Owner = require('./owner')

	return Repo.extend({
		idAttribute: 'githubId',
		isProject: true,
		parse: function (entity) {
			var result = entity
			if (entity.project) {
				result = _.extend(entity.project, {
					support: {
						contributing: entity.contributing,
						donating: entity.donating,
						supporting: entity.supporting
					},
					contribution: entity.project.owner.support
				})
			}

			result.owner = new Owner(result.owner)
			result.support = new Support(result.support)

			return result;
		}
	})
})