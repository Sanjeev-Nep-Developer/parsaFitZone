import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');
    req.user = decoded;
    return next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/login');
  }
};
