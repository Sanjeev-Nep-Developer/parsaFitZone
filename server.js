import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import expressLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';

import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import memberRoutes from './src/routes/members.js';
import { authRequired } from './src/middleware/auth.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// DB
await connectDB();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.set("layout", "layout"); // default layout file views/layout.ejs


// Static
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'fitzone_session_secret',
  resave: false,
  saveUninitialized: false,
}));
app.use(flash());

// locals
app.use((req, res, next) => {
  res.locals.appName = 'FITZONE PARSA';
  res.locals.isAuthenticated = Boolean(req.cookies.token);
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', authRoutes);
app.use('/members', authRequired, memberRoutes);

app.get('/', authRequired, (req, res) => res.redirect('/members/dashboard'));

// 404
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
