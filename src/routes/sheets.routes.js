const express = require('express');
const sheetsRouter = express();
sheetsRouter.use(express.json());
const sheetsController = require('../controllers/sheets.controller');
const tokenMiddleware = require('../middlewares/token.middleware');
const passport = require('passport');
const session = require('express-session');
sheetsRouter.use(session({
	secret: 'keyboard cat',
	// resave: true,
	// saveUninitialized: true,
	// cookie: { secure: true }
}));
sheetsRouter.use(passport.initialize());
sheetsRouter.use(passport.session());


sheetsRouter.get('/auth',passport.authenticate('google',
	{ scope: ['profile', 'email','https://www.googleapis.com/auth/spreadsheets'], prompt:'select_account' },
));
sheetsRouter.get('/auth/callback', passport.authenticate('google'), (req, res) => {
	
	res.send('<h1>Thank you for logging in!, now you can go back and add a question</h1>');
});

sheetsRouter.get('/logout', (req, res,next) => {
	req.logout(function(err) {
		if (err) { return next(err); }
		res.json({ message: 'logged out' });	
	});
});

sheetsRouter.post('/add-question',tokenMiddleware.isUser, sheetsController.addQuestion);

sheetsRouter.get('/profile',tokenMiddleware.isUser, (req, res) => {
	res.json(req.user);
});

module.exports = sheetsRouter;