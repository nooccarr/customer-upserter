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

app.put('/', async (req, res) => {
  let config = req.files[0].buffer;
  config = JSON.parse(config.toString());
  config.siteId = siteId;
  config.apiKey = apiKey;

  let data = req.files[1].buffer;
  data = JSON.parse(data.toString());

  let promises = [];
  let customers = [];

  for (let customer of data) {
    for (let mapping of config.mappings) {
      if (customer.hasOwnProperty(mapping.from)) {
        customer[mapping.to] = customer[mapping.from];
        delete customer[mapping.from];
      }
    }
    customers.push(customer);
    if (customers.length === config.parallelism) {
      promises.push(customers);
      customers = [];
    }
  }
  if (customers.length) promises.push(customers);

  try {
    let cio = new TrackClient(config.siteId, config.apiKey, { region: RegionUS });
    for (customers of promises) {
      await Promise.all(customers.map((customer, i) => {
        let retry = (retries=3, err=null) => {
          if (!retries) {
            console.log(err);
            return;
          }
          cio.identify(customer[config.userId], customer)
            .catch(err => retry(retries - 1, err));
        };
        retry();
      }));
    }
  } catch (err) {
    console.log(err);
  }

  return res.sendStatus(200);
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