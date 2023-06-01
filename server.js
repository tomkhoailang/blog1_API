const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });

const database = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(database).then(() => {
  console.log('DB connection successfully');
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('App listening on port ' + port);
});
