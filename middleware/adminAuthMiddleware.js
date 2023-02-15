const adminAuthMiddleware = (req , res , next )=> {
    if(req.isAuthenticated() && req.session.passport.user.role=="Admin"){
        return next()
    }
    res.redirect('/admin')
}

module.exports = adminAuthMiddleware