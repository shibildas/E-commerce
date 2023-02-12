const passport = require("passport");
require("../../config/authStrategies/localStrategy");



module.exports={

adminLogin: async  (req, res, next) => {
    try {
        
   
   await passport.authenticate('local',(err, user, info) => {
      if (err) {
        console.log(err);
        console.error("Err:", err);
        req.session.flashData = {
          message: {
            type: "error",
            body: "Login failed",
          },
        };
        return res.redirect("/admin");
      }
  
      if (!user) {
        console.log(info.error);
        req.session.flashData = {
          message: {
            type: "error",
            body: info.message,
          },
        };
        return res.redirect("/admin");
      }
  
      req.logIn(user, (err) => {
        if (err) {
          console.log(err);
          console.error("Err:", err);
          req.session.flashData = {
            message: {
              type: "error",
              body: "Login failed",
            },
          }; return res.redirect("/admin")
        }
        return res.redirect("/admin/adminP");
      });
    })(req, res, next);
 
} catch (error) {
    res.error
        
}
},

adminLogout:(req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect("/admin");
  });
}

}