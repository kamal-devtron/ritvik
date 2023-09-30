
const {user} = require('../../database/models');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
console.log('passport');
passport.use(new GoogleStrategy({
	clientID: process.env.CLIENT_ID,
	clientSecret: process.env.CLIENT_SECRET,
	scope: ['profile', 'email','https://www.googleapis.com/auth/spreadsheets'],
	callbackURL: 'http://localhost:4000/leetsheet/auth/callback'
},
function(accessToken, refreshToken, profile, done) {
	profile.accessToken = accessToken;
	user.findOrCreate({
		where: {
			email: profile.emails[0].value,
		},
		defaults: {
			access_token: accessToken,
		}
	});
	done(null, profile);	
}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

const isUser = async (req, res,next) => {
	console.log('isUser');
	req.user ? next() : res.redirect('/leetsheet/auth');
};

module.exports = {
	isUser,
};




