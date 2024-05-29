const http = require('http');

module.exports = (
  options,
  endCb,
  errCb = console.error
) => {
  return http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
  
    res.on('end', () => {
      endCb(JSON.parse(body));
    });

    res.on('error', errCb);
  });
};