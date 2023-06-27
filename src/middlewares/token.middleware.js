const axios = require('axios');
const {user} = require('../../database/models');


const tokenValidator = (req, res, next) => {
	const accessToken = req.headers.authorization;
	const tokenInfoUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
	if (accessToken) {
		axios.get(tokenInfoUrl, {
			params: {
				access_token: accessToken,
			},
		})
			.then(async (response) => {
				console.log(response.data);
				if (response.data.aud !== process.env.CLIENT_ID) {
					console.error('Invalid token: audience mismatch');
					return;
				}
				console.log('Access token is valid');
				const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
					params: {
						access_token: accessToken,
					},
				});

				const userEmail = userInfo.data.email;
				req.user.userEmail = userEmail;
				next();
			})
			.catch( async (error) => {
				// regenrate token
				console.log('regenerating token');
				console.log(error.response.data.error_description);
				if (error.response.data.error_description === 'Invalid Value') {
					const currUser = await user.findOne({
						where: {
							access_token: accessToken,
						}
					});
					const refreshToken = currUser.refresh_token;

					const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
						grant_type: 'refresh_token',
						refresh_token: refreshToken,
						client_id: process.env.CLIENT_ID,
						client_secret: process.env.CLIENT_SECRET,
					})
						.catch(() => {
							res.redirect('/auth');
						});


					const new_access_token = response.data.access_token;
					const new_refresh_token = response.data.refresh_token;

					await user.update({
						access_token: new_access_token,
						refresh_token: new_refresh_token,
					}
					, {
						where: {
							email: currUser.email,
						}
					});

					req.headers.authorization = new_access_token;
					next();
				}

				return;
			}
			);
	} else {
		res.status(401).json({message: 'Unauthorized'});
	}
};

module.exports = {
	tokenValidator,
};

