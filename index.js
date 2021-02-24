const cron = require('node-cron');
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const { format } = require('date-fns');

require('dotenv').config();

let url = 'https://www.blockchain.com/ticker';
let settings = { method: 'Get' };

const slackToken = process.env.SLACK_TOKEN;

let newData = '';

app = express();

const getBitcoinPrice = () => {
	//now's date and time
	const now = format(new Date(), 'yyyy-mm-dd|HH:mm:ss');

	fetch(url, settings)
		.then((res) => res.json())
		.then((json) => {
			// do something with JSON
			//console.log(json.USD);

			const price = JSON.stringify(json.USD.buy);
			const dollars = new Intl.NumberFormat('us-US', {
				style: 'currency',
				currency: 'USD',
			}).format(price);

			newData = now + ' - Bitcoin Price: ' + dollars;

			const body = JSON.stringify({
				channel: '#bitcoin',
				text: newData,
				icon_emoji: ':-1:',
			});

			const options = {
				method: 'post',
				body,
				headers: {
					authorization: `Bearer ${slackToken}`,
					'content-type': 'application/json; charset=utf-8',
				},
			};
			// console.log(options);

			fetch('https://slack.com/api/chat.postMessage', options)
				.then((res) => res.json())
				.then((json) => {
					// console.log(json);
				});
		});
};

getBitcoinPrice();

// Remove the error.log file every 5 minutos
cron.schedule('5 * * * *', function () {
	// console.log('---------------------');
	// console.log('Running Cron Job');

	getBitcoinPrice();

	// fs.appendFile('./error.log', newData, function (err) {
	// 	if (err) {
	// 		// append failed
	// 	} else {
	// 		// done
	// 	}
	// });

	// fs.unlink('./error.log', (err) => {
	// 	if (err) throw err;
	// 	console.log('Error file successfully deleted');
	// });
});

app.listen(3000);
