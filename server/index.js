const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const upload = multer();

const { appApiKey } = require('./config.js');
const { TrackClient, RegionUS } = require("customerio-node");

app.use(express.json());
app.use(upload.array('inputs'));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.put('/', async (req, res) => {
  let config = req.files[0].buffer;
  let data = req.files[1].buffer;

  config = JSON.parse(config.toString());
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
      await Promise.all(customers.map((customer) => {
          return cio.identify(customer[config.userId], customer)
            .catch(err => {
              if (err.statusCode === 401) {
                throw err;
              } else if (err.errno === 'ENOTFOUND') {
                let retry = (retries=3, err=null) => {
                  if (!retries) throw err;
                  return cio.identify(customer[config.userId], customer)
                    .catch(err => retry(retries - 1, err));
                };
                retry();
              }
            });
      }));
    }
  } catch (err) {
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
});

app.get('/customers', (req, res) => {
  let id = req.query.id;
  return axios.get(
      `https://beta-api.customer.io/v1/api/customers/${id}/attributes`,
      {
        params: { id_type: 'id' },
        headers: { Authorization: `Bearer ${appApiKey}` }
      }
    )
    .then(result => res.send(result.data))
    .catch(err => res.sendStatus(404));
});

app.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));