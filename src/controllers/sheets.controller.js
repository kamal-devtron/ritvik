const sheetsService = require('../services/sheets.service');


const addQuestion = async (req, res) => {
	
	try {
		const accessToken = req.user.accessToken;
		const userEmail = req.user.emails[0].value;
		const questionName = 'two-sum';
		const sheet = await sheetsService.addQuestion(accessToken, userEmail,questionName);
		res.status(200).json(sheet);
	} catch (err) {
		res.status(500).json(err);
	}
};

module.exports = {
	addQuestion,
};
    