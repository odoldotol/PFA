export default () => {

  if (process.env.RACK_ENV === 'production') return {};
  
  return {
    PG_HOST: process.env.RACK_ENV === 'development' ? 'market-postgres' : '127.0.0.1',
    PG_USERNAME: 'test',
    PG_PASSWORD: 'test',
    PG_DATABASE: 'test'
  };
};
