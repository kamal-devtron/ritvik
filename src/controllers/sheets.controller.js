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
	try {
		const accessToken =  await sheetsService.getToken(req);
		const script = `
				<script>
					window.opener.postMessage({ access_token: '${accessToken}' }, '${req.headers.origin}');
					window.close();
				</script>
				`;
		res.send(script);
	} catch (err) {
		res.status(500).json(err);
	}
};

const callToken = async (req, res) => {
	try {
		const {email} = req.body;
		const response = await sheetsService.callToken(email);
		if(!response) { res.status(401).json({message: 'Unauthorized'}); }
		res.status(200).json(response);
	} catch (err) {
		res.status(500).json(err);
	}
};


const createSheet = async (req, res) => {
	try {
		const accessToken = req.headers.authorization;
		const userEmail = req.user.userEmail;
		const sheet = await sheetsService.createSheet(accessToken, userEmail);
		res.status(200).json({sheetID:sheet});
	} catch (err) {
		res.status(500).json(err);
	}
};

const updateSheet = async (req, res) => {
	try {
		const accessToken = req.headers.authorization;
		const questionName = req.body.questionName;
		const sheet = await sheetsService.updateSheet(accessToken, questionName);
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
    