const sheetsService = require('../services/sheets.service');


const getAuthUrl = async (req, res) => {
	try {
		const authUrl = await sheetsService.getAuthUrl();
		res.status(200).json(authUrl);
	} catch (err) {
		res.status(500).json(err);
	}
};

const getToken = async (req, res) => {
	console.log('getToken-controller');
	try {
		await sheetsService.getToken(req);
		// console.log('accessToken', accessToken);
		const script = `
				<script>
				  window.close();
				</script>
				`;
		res.status(200).send(script);
	} catch (err) {
		res.status(500).json(err);
	}
};

const callToken = async (req, res) => {
	console.log('callToken');
	try {
		// console.log('req.query', req.query);
		const {email} = req.query;
		const response = await sheetsService.callToken(email);
		console.log('response', response);
		if(!response) { res.status(401).json({message: 'Unauthorized'}); }
		res.status(200).json({accessToken: response});
	} catch (err) {
		res.status(500).json(err);
	}
};


const createSheet = async (req, res) => {
	console.log('createSheet');
	try {
		const accessToken = req.user.accessToken;
		const userEmail = req.user.userEmail;
		const sheet = await sheetsService.createSheet(accessToken, userEmail);
		res.status(200).json({sheetID:sheet});
	} catch (err) {
		res.status(500).json(err);
	}
};

const updateSheet = async (req, res) => {
	try {
		const accessToken = req.user.accessToken;
		const questionName = req.body.questionName;
		console.log('accessToken', accessToken);
		console.log('questionName', questionName);
		const sheet = await sheetsService.updateSheet(accessToken, questionName);
		console.log('sheet', sheet);
		res.status(200).json(sheet);
	} catch (err) {
		res.status(500).json(err);
	}
};

module.exports = {
	getAuthUrl,
	getToken,
	createSheet,
	updateSheet,
	callToken,
};
    