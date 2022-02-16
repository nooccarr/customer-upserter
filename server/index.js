const express = require('express');
const multer = require('multer');

const app = express();
const upload = multer();

// const { siteId, apiKey } = require('./config.js');
const { TrackClient, RegionUS } = require("customerio-node");

app.use(express.json());
app.use(upload.array('inputs'));

app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.put('/', async (req, res) => {
  let config = req.files[0].buffer;
  config = JSON.parse(config.toString());
  // config.siteId = siteId;
  // config.apiKey = apiKey;

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
      await Promise.all(customers.map((customer) => {
    //     // let retry = (retries=1, err=null) => {
    //     //   if (!retries) {
    //     //     // console.log(err.statusCode);
    //     //     return err;
    //     //   }
          return cio.identify(customer[config.userId], customer)
            .catch(err => {
              console.log('LOOP:', err.statusCode);
              console.log('LOOP:', err);
              throw err.statusCode;
            });
            // .catch(err => console.log(err))
    //         // .catch(err => retry(retries - 1, err));
    //     // };
    //     // retry();
      }))
        // .catch(err => console.log('PROMISE CATCH'));
      // console.log('END OF TRY');
    }
  } catch (err) {
    console.log('CATCH:', err);
    return res.sendStatus(401);
  }

  return res.sendStatus(200);
});

app.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

// TEST CASES:
// curl -X PUT -F inputs=@sampleData/configuration.json -F inputs=@sampleData/sampleData.json http://localhost:3000

// curl --request PUT \
// --url http://localhost:3000 \
// --form 'inputs=@sampleData/configuration.json' \
// --form 'inputs=@sampleData/data.json'