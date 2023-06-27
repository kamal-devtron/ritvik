const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(express.json());
app.use(
	cors({
		origin: 'http://localhost:3000',
	})
);
const sheetsRouter = require('./src/routes/sheets.routes');
const port = process.env.PORT;

app.use('/leetsheet', sheetsRouter);

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
