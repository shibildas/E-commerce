const passport = require("passport");



module.exports={
  loginPage:async (req, res, next) => {
    res.render("user/login",{layout:'../views/layouts/layout'});
  },

login:async  (req, res, next) => {
    try {
        
   
    passport.authenticate('local',(err, user, info) => {
      if (err) {
        console.error("Err:", err);
        req.session.flashData = {
          message: {
            type: "error",
            body: "Login failed",
          },
        };
        return res.redirect("/login",{layout:'../views/layouts/layout'});
      }
  
      if (!user) {
        req.session.flashData = {
          message: {
            type: "error",
            body: info.message,
          },
        };
        return res.redirect("/login");
      }
  
      req.logIn(user, (err) => {
        if (err) {
          console.error("Err:", err);
          req.session.flashData = {
            message: {
              type: "error",
              body: "Login failed",
            },
          };
        }
        return res.redirect("/");
      });
    })(req, res, next);
 
} catch (error) {
    
    req.session.flashData = {
      message: {
        type: "error",
        body: error,
      },
    };
    return res.redirect("/login");
        
}
},

logout:(req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err); ;
    }
    res.redirect("/");
  });
},
paymentFailed:(req,res)=>{
  res.render('pages/failed',{layout:'../views/layouts/layout'})
}

}