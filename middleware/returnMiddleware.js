const returnMiddleware = (req,res,next) => {
    if(!req.isAuthenticated()){
        if(!req.session.passport){
            return next()   
        }

    } else if(req.session.passport.user.role == "Customer"){
        res.redirect('/')
    }else if(req.session.passport.user.role == "Admin"){
    res.redirect('/admin/adminP')
}res.redirect('/admin/adminP')
}

module.exports = returnMiddleware