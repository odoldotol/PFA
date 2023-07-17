export default () => {
  let mongoUri: string;
  
  if (process.env.RACK_ENV === 'development') mongoUri = 'mongodb://market-mongo:27017';
  else if (process.env.MONGO_ENV === 'test') mongoUri = 'mongodb://127.0.0.1:27017';
  else mongoUri = "" + process.env.MONGO_URL + process.env.MONGO_database + process.env.MONGO_Query;
  
  return {
    MONGODB_URI: mongoUri
  };
};