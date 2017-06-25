const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

// replace mongoose internal promises with ES6 promises
mongoose.Promise = global.Promise;

// config js holds app constants
const { PORT, DATABASE_URL } = require('./config');

const app = express();
app.use(bodyParser.json());

// logs HTTP layer
app.use(morgan('common'));

const blogPostsRouter = require('./routers/blogPostsRouter');

// requests to /posts are directed to blogPostsRouter
app.use('/posts', blogPostsRouter);

app.use('*', (req, res) => {
  res.status(404).json({message: 'resource not found'});
});

/////////////////////////////////////////////////////////////////
function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};