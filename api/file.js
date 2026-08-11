module.exports = (req, res) => {
  // Protocol (http/https) detect karein
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  
  // Host name (e.g. url.vercel.app) detect karein
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  
  // Complete URL banayein jo access kiya gaya hai
  const fullUrl = `${protocol}://${host}${req.url}`;

  res.setHeader('Content-Type', 'text/plain');
  res.status(404).send(`${fullUrl} Not Found!`);
};
