const { google } = require('googleapis');
const axios = require('axios');
const {user} = require('../../database/models');

const createSheet = async (accessToken) => {
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

	return sheetID;

};

const updateSheet = async (questionName,sheetID, oauth2Client) => {
	const questionResult = await axios.post('https://leetcode.com/graphql', {
		operationName: 'questionData',
		variables: {
			titleSlug: questionName
		},

		query: 'query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n   title\n   difficulty\n      topicTags {\n      name\n   }\n  }\n}\n'
	}
	);

	const questionData = questionResult.data.data.question;
	const questionId = questionData.questionId;
	const title = questionData.title;
	const difficulty = questionData.difficulty;
	const topicTags = questionData.topicTags.map((tag) => tag.name).reduce((acc, curr) => `${acc}, ${curr}`);

	const range = 'A1';

	const sheets = google.sheets({version: 'v4', auth: oauth2Client});

	const values = [[questionId, title, difficulty, topicTags]];
	const updatedData = await sheets.spreadsheets.values.append({
		spreadsheetId:sheetID,
		range,
		valueInputOption: 'USER_ENTERED',
		resource: {
			values,
		},
	});

	return updatedData.data;
};


const addQuestion = async (accessToken,userEmail, questionName) => {
	try{

		const oauth2Client = new google.auth.OAuth2(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			process.env.REDIRECT_URI,
		);
		oauth2Client.setCredentials({
			access_token: accessToken,
		});

		const currentUser = await user.findOne({
			where: {
				email: userEmail,
			}
		});

		let sheetID;

		if(currentUser.spreadsheetId){
			sheetID = currentUser.spreadsheetId;
		}
		else{
			sheetID = await createSheet(accessToken,userEmail);
			await user.update({
				spreadsheetId: sheetID,
			},
			{
				where: {
					email: userEmail,
				}
			}
			);
		}

		const updatedData = await updateSheet(questionName,sheetID, oauth2Client);
		return updatedData;
	}
	catch(err){
		console.log(err);
		return err;
	}
	
};
    
module.exports = {
	addQuestion
};