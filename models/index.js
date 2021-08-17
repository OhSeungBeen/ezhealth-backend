const mongoose = require('mongoose');

module.exports = () => {
  const connect = () => {
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', true);
    }
    mongoose.connect(
      process.env.MONGO_URI,
      {
        useNewUrlParser: true,
        useFindAndModify: false,
      },
      (error) => {
        if (error) {
          console.log('mongoDB connect error');
        } else {
          console.log('mongoDB connect success');
        }
      }
    );
  };
  connect();
};
