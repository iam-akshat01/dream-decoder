const jwt= require('jsonwebtoken')
const secretkey=process.env.JWT_SECRET

const verifyuser= (req,res,next) =>{
    const token= req.cookies.token;
    if(!token){
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
    const decoded = jwt.verify(token, secretkey);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports=verifyuser;
