import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const getLogin = (req, res) => {
  res.render('login', { title: 'Login' });
};

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/login');
  }
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/login');
  }
  const token = jwt.sign({ id: admin._id, username }, process.env.JWT_SECRET || 'dev_jwt_secret', { expiresIn: '7d' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/members/dashboard');
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
};
