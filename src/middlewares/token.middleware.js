const axios = require('axios');
const {user} = require('../../database/models');


const tokenValidator = async (req, res, next) => {
	const userEmail = req.body.email;
	const currUser = await user.findOne({
		where: {
			email: userEmail,
		}
	});

	if(!user){
		res.status(401).json({message: 'Unauthorized'});
	}

	const accessToken = currUser.access_token;
	
	console.log('accessToken', accessToken);
	const tokenInfoUrl = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
	if (accessToken) {
		axios.get(tokenInfoUrl, {
			params: {
				access_token: accessToken,
			},
		})
			.then(async () => {
				console.log('Access token is valid');
				console.log('userEmail', userEmail);
				req.user = {};
				req.user.userEmail = userEmail;
				req.user.accessToken = accessToken;
				next();
			})
			.catch((error) => {
				const errorData = error.response.data; 
				// console.log('errorData', errorData); 
				// console.log('error', error.data);
				if(errorData.error_description === 'Invalid Value'){
					res.status(401).json({
						message: 'Invalid token',
					});
				}
				else{
					res.status(500).json({
						message: 'Internal server error',
					});
				}
				
			});
	}
	// .catch( async (error) => {
	// console.log('error', error);
	// regenerating token
	// 			console.log('regenerating token');
	// 			console.log(error.response.data.error_description);
	// 			if (error.response.data.error_description === 'Invalid Value') {
	// 				const currUser = await user.findOne({
	// 					where: {
	// 						access_token: accessToken,
	// 					}
	// 				});
	// 				// console.log(currUser);
	// 				if(!currUser){
	// 					res.redirect('http://localhost:4000/leetsheet/auth');
	// 				}
	// 				else{
	// 					// console.log(currUser);
	// 					const refreshToken = currUser.refresh_token;
	// 					const response = await axios.post('https://www.googleapis.com/oauth2/v4/token', {
	// 						grant_type: 'refresh_token',
	// 						refresh_token: refreshToken,
	// 						client_id: process.env.CLIENT_ID,
	// 						client_secret: process.env.CLIENT_SECRET,
	// 					})
					
	// 						.catch(() => {
	// 							res.redirect('/auth');
	// 						});

	// 					console.log(response);		


	// 					const new_access_token = response.data.access_token;
	// 					const new_refresh_token = response.data.refresh_token;

	// 					await user.update({
	// 						access_token: new_access_token,
	// 						refresh_token: new_refresh_token,
	// 					}
	// 					, {
	// 						where: {
	// 							email: currUser.email,
	// 						}
	// 					});

	// 					req.headers.authorization = new_access_token;
	// 					next();
	// 				}
	// 			}

	// 			return;
	// 		}
	// 		);
	// } else {
	// 	res.status(401).json({message: 'Unauthorized'});
	// }
};

module.exports = {
	tokenValidator,
};

