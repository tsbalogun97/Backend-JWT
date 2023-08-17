const jwt = require('jsonwebtoken');

// middle ware function is a function that access to the req, res cycle/object.
// next is used to pass on to the next portion of middleware


module.exports = function (req, res, next){
  // get token from the header
  const token = req.header('x-auth-token')

// check if no token
  if (!token) {
    return res.status(401).json({msg: 'No token, Auth denied'});
  }

// verify token if theres one
  try{
    const decoded = jwt.verify(token, process.env.jwtSecret)
  
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid'})
  }
};

