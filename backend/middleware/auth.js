const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token=req.header("Authorization").replace('Bearer ','');
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.userId=decoded.userId;
    next();
  } catch (e) {
    res.stataus(401).send({ error: "Please authenticate" });
  }
};


module.exports=auth