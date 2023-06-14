# Customer Upserter

The goal of this project is to build a mini, standalone script that offers a subset of the functionality provided by the Hightouch Customer.io integration. The script aims to sync user data from local files to the Customer.io API.

## Inputs

| File          | Description                                       |
| ------------- | ------------------------------------------------- |
| configuration | contains configuration about how to sync the data |
| data          | contains the user data to be synced               |

### Configuration file

The configuration file defines the synchronization process of user data into Customer.io.

* parallelism - controls the number of API requests to make in parallel
* userId - chooses the key from the data file to use as the Customer.io user ID
* mappings - configure how fields from user data map to attributes in Customer.io
* siteId & apiKey - Customer.io API authentication

```json
{
  "parallelism": 25,
  "userId": "id",
  "mappings": [
    {
      "from": "computed_ltv",
      "to": "ltv"
    }, {
      "from": "name",
      "to": "name"
    }
  ],
  "siteId": "",
  "apiKey": ""
}    
```

### Data file

The data file contains a JSON array of user data, with each object representing an individual user. The structure and content of user data can vary across different data files.

```json
[
   {
      "id": 1,
      "email": "katherine.johnson@nasa.com",
      "created_at": 1361205308,
      "first_name": "Katherine",
      "last_name": "Johnson",
      "plan": "premium"
   },
   {
      "id": 2,
      "email": "james.webb@nasa.com",
      "created_at": 2294107407,
      "first_name": "James",
      "last_name": "Webb",
      "plan": "basic"
   }
]
```

## Tech Stack

* [Node](https://nodejs.org/en)
* [Express](http://expressjs.com)

## Building and Running Environment

First install dependencies:

```sh
npm install
```

To run node server:

```sh
npm start
```

## Running Instruction

1. To gain access to the Customer.io Tracking API, add your credentials to the 'siteId' and 'apiKey' properties in the configuration file.
2. Open the terminal and run the following script to sync user data from local files to the Customer.io API.

```
curl --request PUT \
--url http://localhost:3000 \
--form 'inputs=@sampleData/configuration.json' \
--form 'inputs=@sampleData/data.json'
```
