const { google } = require('googleapis');
const axios = require('axios');
const {user} = require('../../database/models');

const getAuthUrl =  async () => {
	console.log('getAuthUrl');
	const oauth2Client = new google.auth.OAuth2(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET,
		process.env.REDIRECT_URI
	);
    
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: process.env.SCOPE,
	});

	return {
		authUrl
	};
};

const getToken = async (req) => {
	
	const oauth2Client = new google.auth.OAuth2(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET,
		process.env.REDIRECT_URI
	);
    
	const { tokens } = await oauth2Client.getToken(req.query.code);
	oauth2Client.setCredentials(tokens);
	

	const accessToken = tokens.access_token;
	const refreshToken = tokens.refresh_token;

	//get user details for the user who created this token
	const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
		params: {
			access_token: accessToken,
		},
	});

	const userEmail = userInfo.data.email;
	
	const userExists = await user.findOne({
		where: {
			email: userEmail,
		}
	});

	if(!userExists && refreshToken){
		console.log('user does not exist');
		await user.create({
			email: userEmail,
			access_token: accessToken,
			refresh_token: refreshToken,
		});
	}
	else {
		console.log('user exists');
		await user.update({
			access_token: accessToken,
		}, {
			where: {
				email: userEmail,
			}
		});
	}
	return accessToken;
};

const callToken = async (email) => {
	const currUser = await user.findOne({
		where: {
			email: email,
		}
	});

	if(!currUser){ 
		return null;
	}

	return currUser?.access_token;
};

const getSheet = async (userEmail) => {
	const currUser = await user.findOne({
		where: {
			email: userEmail,
		}
	});

	return currUser?.spreadsheetId;
};


const createSheet = async (accessToken,userEmail) => {
	const oauth2Client = new google.auth.OAuth2(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET,
		process.env.REDIRECT_URI
	);
	oauth2Client.setCredentials({
		access_token: accessToken,
	});

	const spreadsheetTitle = 'LeetSheet';

	const data = await axios.post('https://sheets.googleapis.com/v4/spreadsheets', {
		properties: {
			title: spreadsheetTitle
		}
	}, {
		headers: {
			'Authorization': `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});
	
	const sheetID = data.data.spreadsheetId;

	await user.update({
		spreadsheetId: sheetID,
	},
	{
		where: {
			email: userEmail,
		}
	}
	);

	console.log(sheetID);
	return sheetID;
	
};

const updateSheet = async (accessToken, questionName) => {
	const oauth2Client = new google.auth.OAuth2(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET,
		process.env.REDIRECT_URI
	);
	oauth2Client.setCredentials({
		access_token: accessToken,
	});

	const data = await axios.post('https://leetcode.com/graphql', {
		operationName: 'questionData',
		variables: {
			titleSlug: questionName
		},

		query: 'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n   title\n   difficulty\n      topicTags {\n      name\n   }\n  }\n}\n'
	}
	);

	const questionData = data.data.data.question;
	const questionId = questionData.questionId;
	const title = questionData.title;
	const difficulty = questionData.difficulty;
	const topicTags = questionData.topicTags.map((tag) => tag.name).reduce((acc, curr) => `${acc}, ${curr}`);

	const currUser = await user.findOne({
		where: {
			access_token: accessToken,
		}
	});

	const spreadsheetId = currUser?.spreadsheetId;

	const range = 'A1';

	const sheets = google.sheets({version: 'v4', auth: oauth2Client});

	const values = [[questionId, title, difficulty, topicTags]];
	const updatedData = await sheets.spreadsheets.values.append({
		spreadsheetId,
		range,
		valueInputOption: 'USER_ENTERED',
		resource: {
			values,
		},
	});

	return updatedData.data;

};

    
module.exports = {
	getAuthUrl,
	getToken,
	createSheet,
	updateSheet,
	callToken,
	getSheet,
};