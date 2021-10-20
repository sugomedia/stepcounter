const express = require('express');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');
const mysql = require('mysql');
const config = require('./config.js');
const exp = require('constants');
const port = process.env.PORT || 8088;
const app = express();

// middleware
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({extended:true}));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// connect to mysql database
var connection = mysql.createConnection(config.dbDev);
connection.connect((err)=>{
    if (err) throw err;
    console.log('Connected to MySQL database...');
});

// router 
app.get('/', (req, res)=>{
    ejs.renderFile('public/index.ejs', {eMsg:''}, (err, data)=>{
        if (err) throw err;
        res.send(data);
    });
});

// users registration
app.get('/reg', (req, res)=>{
    ejs.renderFile('public/registration.ejs', {eMsg:''}, (err, data)=>{
        if (err) throw err;
        res.send(data);
    });
});

app.post('/reg', (req, res)=>{
    var name = req.body.name,
        email = req.body.email,
        pass1 = req.body.pass1,
        pass2 = req.body.pass2;

    if (pass1 != pass2)
    {
       var eMsg = 'The passwords are not same!';
       ejs.renderFile('public/registration.ejs', {eMsg}, (err, data)=>{
        if (err) throw err;
        res.send(data);
    });
    }
    else
    {
        connection.query(`SELECT * FROM users WHERE email='${email}'`, (err, results)=>{
            if (err) throw err;
            if (results.length > 0)
            {
                //res.send('This e-mail address is already registered!');
                var eMsg = 'This e-mail address is already registered!';
                ejs.renderFile('public/registration.ejs', {eMsg}, (err, data)=>{
                 if (err) throw err;
                 res.send(data);
                });
            }
            else
            {
                connection.query(`INSERT INTO users VALUES(null,'${name}','${email}',SHA1('${pass1}'),CURRENT_TIMESTAMP,null,'user',1)`, (err)=>{
                    if (err) throw err;
                    res.redirect('/');
                });
            }
        });
    }
});

// users login/logout
app.post('/login', (req, res)=>{
    var email = req.body.email,
        pass = req.body.pass;
    
    connection.query(`SELECT * FROM users WHERE email='${email}' AND password=SHA1('${pass}')`, (err, results)=>{
        if (err) throw err;
        if (results.length == 0)
        {
            var eMsg = 'Incorrect email/paswword!';
            ejs.renderFile('public/index.ejs', {eMsg}, (err, data)=>{
                if (err) throw err;
                res.send(data);
            });
        }
        else
        {
            if (results[0].status == 0)
            {
                var eMsg = 'This user is banned!';
                ejs.renderFile('public/index.ejs', {eMsg}, (err, data)=>{
                    if (err) throw err;
                    res.send(data);
                });
            }
            else
            {
                // login, session, update last field
                req.session.userID = results[0].ID;
                req.session.loggedIn = true;

                connection.query(`UPDATE users SET last=CURRENT_TIMESTAMP WHERE ID=${req.session.userID}`, (err)=>{
                    if (err) throw err;
                    res.redirect('/home');
                });

            }
        }
    });
});

app.get('/home', (req, res)=>{
    if (req.session.loggedIn)
    {
        res.send('Welcome here!');
    }
    else
    {
        res.send('This page is only for registered users!');
    }
})
// users passmod

// users profilmod

// users stepdata management

// users statistics


// admin

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}...`);
});