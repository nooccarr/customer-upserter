const express = require('express');
const multer = require('multer');
const axios = require('axios');

const app = express();
const upload = multer();

const { siteId, apiKey } = require('./config.js');

const { TrackClient, RegionUS } = require("customerio-node");
let cio = new TrackClient(siteId, apiKey, { region: RegionUS });

app.use(express.json());
app.use(upload.array('inputs'));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.put('/', (req, res) => {
  let configuration = req.files[0].buffer;
  let data = req.files[1].buffer;
  configuration = JSON.parse(configuration.toString());
  data = JSON.parse(data.toString());
  configuration[siteId] = apiKey;
  // console.log(configuration);
  // console.log(data[0]);
  // return axios.put(`https://track.customer.io/api/v1/customers/${identifier}`, req.body)
  cio.identify(data[0].id, data[0])
    .then(results => {
  //     console.log(Object.keys(results))
      res.send(results);
    })
    .catch(err => console.log(err.response.status));
})

app.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));






// to create people in a workspace with default settings, the id (5) can also be an email address.
// when creating people using an email address, do not include an email attribute.
// cio.identify(5, {
//   email: 'customer@example.com',
//   created_at: 1361205308,
//   first_name: 'Bob',
//   plan: 'basic'
// });
