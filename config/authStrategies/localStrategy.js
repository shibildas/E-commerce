const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../app/models/User");

passport.use('local',
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });
        if (await user.checkPassword(password)) return done(null, user);
        return done(null, false, { message: "Incorrect password" });
      } catch (e) {
        return done(e);
      }
    }
  )
);
    
    passport.serializeUser((user, done) => {
      if(user.isVerified){

    return done(null, {_id:user._id,role:user.role});
  }
});

passport.deserializeUser(async (_id, done) => {
 
  try {
    const user = await User.findOne({ _id });
    return done(null, user);
  } catch (e) {
    return done(e);
  }
});
