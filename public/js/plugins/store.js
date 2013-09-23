/**
 * Author: krasu
 * Date: 8/13/13
 * Time: 4:32 AM
 */
define(function () {
	var storage = {}

	//storage().property

	return {
		getNamespace: function (namespace) {
			storage[namespace] = storage[namespace] ? storage[namespace] : {};

			return function () {
				return storage[namespace]
			};
		},
		'set'       : function (namespace, key, value) {
			storage[namespace][key] = value
		},
		'get'       : function (namespace, key) {
			return storage[namespace][key]
		}
	}
})