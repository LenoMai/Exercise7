//require modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const storyRoutes = require('./routes/storyRoutes');
const session = require('express-session');
const flash = require('connect-flash');
const userRoutes = require('./routes/userRoutes');

//create app
const app = express();

//configure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//connect to database
mongoose.connect('mongodb://127.0.0.1:27017/demos')
.then(()=>{
    app.listen(port, host, ()=>{
        console.log('Server is running on port', port);
    });
})
.catch(err=>console.log(err.message));

//mount middlware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

app.use(session({
    secret: 'SECRET KEY',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60*60*1000},
    store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/demos'})
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.messages = req.flash();
    next();
});

app.use({req, res, next})=>{
    console.log(req.session);
    next();
}

//set up routes
app.get('/', (req, res)=>{
    res.render('index');
});

app.get('/new', (req, res, next)=>{
    res.render('new');
});

app.post('/', (req, res, next) =>{
    let user = new User(req.body);
    user.save()
    .then(()=> res.redirect('/login'))
    .catch(err => next(err));
});

app.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findOne({email: email})
    .then(user=>{
        if(user){
            user.comparePassword(password)
            .then(result => {
                if(result){
                    req.session.user = user._id;
                    req.flash('success', 'You have successfully logged in');
                    res.redirect('/profile');
                } else {
                    console.log('wrong password');
                    res.redirect('/login')
                }
            })
        } else {
            console.log('Wrong email address');
            res.redirect('/login')
        }
    })
})

app.use('/stories', storyRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);

});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status) {
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error: err});
});
