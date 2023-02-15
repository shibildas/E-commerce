const returnMiddleware = (req,res,next) => {
    if(!req.isAuthenticated()){
        if(!req.session.passport){
            return next()   
        }

    } 
    else if(req.session.passport.user.role == "Admin"){
    res.redirect('/admin/adminP')
    }
    else if(req.session.passport.user.role == "Customer"){
        res.redirect('/')
    }
res.redirect('/')
}

module.exports = returnMiddleware