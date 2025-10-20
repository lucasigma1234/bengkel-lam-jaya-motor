const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration - DIUBAH UNTUK PRODUCTION
app.use(session({
    secret: process.env.SESSION_SECRET || 'bengkel-lam-jaya-motor-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Secure di production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection
const db = require('./models/db');

// Routes
const authRoutes = require('./routes/auth');
const stokRoutes = require('./routes/stok');
const financeRoutes = require('./routes/finance');
const reportRoutes = require('./routes/report');

app.use('/', authRoutes);
app.use('/stok', stokRoutes);
app.use('/laporan', financeRoutes);
app.use('/report', reportRoutes);

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Middleware to redirect if already logged in (for public pages)
const redirectIfAuth = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};

// Home route - Conditional access
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Bengkel Lam Jaya Motor',
        user: req.session.user
    });
});

// About Us route - Public only (redirect if logged in)
app.get('/about', redirectIfAuth, (req, res) => {
    res.render('about', {
        title: 'About Us - Bengkel Lam Jaya Motor',
        user: req.session.user
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Halaman Tidak Ditemukan',
        user: req.session.user
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log('Bengkel Lam Jaya Motor - Specialist Tune Up');
    console.log('Sistem Admin: Home berubah berdasarkan status login');
});