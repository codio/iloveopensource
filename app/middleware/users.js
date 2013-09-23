/**
 * Author: krasu
 * Date: 8/18/13
 * Time: 7:34 PM
 */
module.exports = function (app) {
	//exposing current user
	app.use(function (req, res, next) {
		res.locals.isLoggedIn = req.isAuthenticated()
		res.locals.loggedUser = req.user
		next();
	});
}
