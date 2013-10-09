/**
 * Author: krasu
 * Date: 8/18/13
 * Time: 7:34 PM
 */
module.exports = function (app) {
    //exposing current user
    app.use(function (req, res, next) {
        req.realIP = req.headers['x-real-ip'] || req.connection.remoteAddress
        res.locals.isLoggedIn = req.isAuthenticated()
        res.locals.loggedUser = req.user
        if (req.session.isNewUser) {
            res.locals.isNewUser = true
            req.session.isNewUser = null
        }
        next();
    });
}
