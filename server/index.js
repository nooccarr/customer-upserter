const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello world!');
})
app.get('*', (req, res) => {
  res.send('404 Page Not Found');
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
