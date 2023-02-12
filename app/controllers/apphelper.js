


module.exports = {

    clearCache: function(req, res, next) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        next();
    },
    userInViews: (req, res, next) => { //to make user available for the views
        res.locals.user = req.isAuthenticated() ? req.user : null;
        return next();
    },
    errorhandler:(req, res, next) => {
        res.status(404).render("pages/404");
      },
    devErrorHandler:function(err, req, res, next) {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};
      
        // render the error page
        res.status(err.status || 500);
        res.render('pages/500');
      }    
    
}