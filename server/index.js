const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer();

const { siteId, apiKey } = require('./config.js');
const { TrackClient, RegionUS } = require("customerio-node");

app.use(express.json());
app.use(upload.array('inputs'));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.put('/', (req, res) => {
  let config = req.files[0].buffer;
  config = JSON.parse(config.toString());
  config.siteId = siteId;
  config.apiKey = apiKey;

  let data = req.files[1].buffer;
  data = JSON.parse(data.toString());

  // TODO:
  // ( ) integrate parallelism
  // (v) integrate userId
  // ( ) integrate mappings

  // async parallelCall() {
    // let promises = [];
    // let promise = [];
    // for (let i = 0; i < data.length; i++) {
    //   promise.push(data[i]);
    //   if (promise.length === config.parallelism) {
    //     promises.push(promise);
    //     promise = [];
    //   }
    // }
    // promises.push(promise);
    // console.log(promises);
  // }

  Promise.all(data.map((customer) => {
    let cio = new TrackClient(config.siteId, config.apiKey, { region: RegionUS });
    cio.identify(customer[config.userId], customer)
  }))
    .then(results => res.sendStatus(200))
    .catch(err => res.sendStatus(401));

});

app.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// TEST CASES:
// curl --request PUT \
// --url https://track.customer.io/api/v1/customers/person@example.com \
// --header "Authorization: Basic $(echo -n site_id:api_key | base64)" \
// --header 'content-type: application/json' \
// --data '{"id":"id1234"}'

// curl --request PUT \
// --url https://track.customer.io/api/v1/customers/id1234 \
// --header "Authorization: Basic $(echo -n site_id:api_key | base64)" \
// --header 'content-type: application/json' \
// --data '{"email":"person@example.com"}'

// {
//   "parallelism": 25,
//   "userId": "id",
//   "mappings": [
//     {
//       "from": "computed_ltv",
//       "to": "ltv"
//     }, {
//       "from": "name",
//       "to": "name"
//     }
//   ]
// }