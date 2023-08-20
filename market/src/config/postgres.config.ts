export default () => {

  if (process.env.RACK_ENV === 'production') return {};
  if (process.env.RACK_ENV === 'development') {
    // docker test, development
    return {};
  } else {
    // local test, development
    return {
      PG_HOST: '127.0.0.1',
      PG_USERNAME: 'test',
      PG_PASSWORD: 'test',
      PG_DATABASE: 'test'
    };
  }
};