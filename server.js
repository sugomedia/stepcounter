const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const path = require('path');
const ejs = require('ejs');
const sha1 = require('sha1');
const mysql = require('mysql');
const moment = require('moment');
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
app.use(fileUpload());

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
            var eMsg = 'Incorrect email/password!';
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
                req.session.userName = results[0].username;
                req.session.userEmail = results[0].email;
                req.session.reg = results[0].reg;
                req.session.loggedIn = true;
                
                connection.query(`UPDATE users SET last=CURRENT_TIMESTAMP WHERE ID=${req.session.userID}`, (err)=>{
                    if (err) throw err;
                    connection.query(`SELECT last FROM users WHERE ID=${req.session.userID}`, (err, results)=>{
                        if (err) throw err;
                        req.session.last = results[0].last;
                        res.redirect('/home');
                    });
                });

            }
        }
    });
});

app.get('/logout', (req, res)=>{
    req.session.loggedIn = false;
    res.redirect('/');
});

app.get('/home', (req, res)=>{
    if (req.session.loggedIn)
    {
        ejs.renderFile('public/home.ejs', {username:req.session.userName}, (err, data)=>{
            if (err) throw err;
            res.send(data);
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }
})

// users passmod
app.get('/passmod', (req, res)=>{
    if (req.session.loggedIn)
    {
        ejs.renderFile('public/passmod.ejs',{eMsg:''}, (err, data)=>{
            if (err) throw err;
            res.send(data);
        });
    }
    else
    {
        res.send('This page is only for registered users!')
    }
});

app.post('/passmod', (req, res)=>{
    if (req.session.loggedIn)
    {
        var data = {
            oldpass : req.body.oldpass,
            newpass1 : req.body.newpass1,
            newpass2 : req.body.newpass2
        }
        if (data.newpass1 != data.newpass2)
        {
            ejs.renderFile('public/passmod.ejs', {eMsg:'The new passwords are not the same!'}, (err, data)=>{
                if (err) throw err;
                res.send(data);
            });
        }
        else
        {
            data.oldpass = sha1(data.oldpass); 
            connection.query(`SELECT password FROM users WHERE ID=${req.session.userID}`, (err, results)=>{
                if (data.oldpass != results[0].password)
                {
                    ejs.renderFile('public/passmod.ejs', {eMsg:'The old password is incorrect!'}, (err, data)=>{
                        if (err) throw err;
                        res.send(data);
                    });
                }
                else
                {
                    data.newpass1 = sha1(data.newpass1);
                    connection.query(`UPDATE users SET password='${data.newpass1}' WHERE ID=${req.session.userID}`, (err)=>{
                        if (err) throw err;
                        ejs.renderFile('public/passmod.ejs', {eMsg:'The password changed!'}, (err, data)=>{
                            if (err) throw err;
                            res.send(data);
                        });
                    });
                }
            });
        }
    }
    else
    {
        res.send('This page is only for registered users!') 
    }
});

// users profilmod
app.get('/profilmod', (req, res)=>{
    if (req.session.loggedIn)
    {
        var profilData = {
            name : req.session.userName,
            email : req.session.userEmail,
            reg : req.session.reg,
            last : req.session.last
        }

        ejs.renderFile('public/profilmod.ejs',{eMsg:'', profilData, moment}, (err, data)=>{
            if (err) throw err;
            res.send(data);
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }
});

app.post('/profilmod', (req, res)=>{
    if (req.session.loggedIn)
    {
        var data = {
            name : req.body.username,
            email : req.body.email
        }

        if (req.files && Object.keys(req.files).length != 0) {
            var sampleFile =  req.files.profilPicture;
            var uploadPath = __dirname + '/public/uploads/' + sampleFile.name;
            sampleFile.mv(uploadPath, (err) => {
                if (err) throw err;
                console.log('File uploaded to ' + uploadPath);
            });
        }

        connection.query(`SELECT ID FROM users WHERE email='${data.email}' AND ID<>${req.session.userID}`, (err, results)=>{
            if (err) throw err;
            if (results.length > 0)
            {
                var profilData = {
                    name : req.session.userName,
                    email : req.session.userEmail,
                    reg : req.session.reg,
                    last : req.session.last
                }
                ejs.renderFile('public/profilmod.ejs',{eMsg:'This e-mail address is already regisztered!', profilData, moment}, (err, data)=>{
                    if (err) throw err;
                    res.send(data);
                });
            }
            else
            {
                connection.query(`UPDATE users SET username='${data.name}', email='${data.email}' WHERE ID=${req.session.userID}`, (err)=>{
                    if (err) throw err;
                    req.session.userName = data.name;
                    req.session.userEmail = data.email;

                    var profilData = {
                        name : req.session.userName,
                        email : req.session.userEmail,
                        reg : req.session.reg,
                        last : req.session.last
                    }
                    ejs.renderFile('public/profilmod.ejs',{eMsg:'Profile changed!', profilData, moment}, (err, data)=>{
                        if (err) throw err;
                        res.send(data);
                    });

                });
            }
        });

    }
    else
    {
        res.send('This page is only for registered users!')
    }  
});

// users stepdata management
app.get('/newdata', (req, res)=>{
    if (req.session.loggedIn)
    {
        var aktDate = getAktDate();

        ejs.renderFile('public/newdata.ejs',{eMsg:'', aktDate}, (err, data)=>{
            if (err) throw err;
            res.send(data);
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }    
});

app.post('/newdata', (req, res)=>{
    if (req.session.loggedIn)
    {
        var data = {
            datum : req.body.datum,
            stepcount : req.body.stepcount
        }
        connection.query(`SELECT * FROM stepdatas WHERE date='${data.datum}' AND userID=${req.session.userID}`, (err, results)=>{
            if (err) throw err;
            if (results.length == 0)
            {
               // insert
               connection.query(`INSERT INTO stepdatas VALUES(null, ${req.session.userID},'${data.datum}',${data.stepcount})`, (err)=>{
                   if (err) throw err;
                   res.redirect('/tableview'); 
               });
            }
            else
            {
                // update
                connection.query(`UPDATE stepdatas SET stepcount = stepcount + ${data.stepcount} WHERE date='${data.datum}' AND userID=${req.session.userID}`, (err)=>{
                    if (err) throw err;
                    res.redirect('/tableview'); 
                });
            }
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }
});

// users statistics 
app.get('/tableview', (req, res)=>{
    if (req.session.loggedIn)
    {
        connection.query(`SELECT * FROM stepdatas WHERE userID=${req.session.userID} ORDER BY date DESC`, (err, results)=>{
            if (err) throw err;
            ejs.renderFile('public/tableview.ejs', {results, moment}, (err, data)=>{
                if (err) throw err;
                res.send(data);
            });
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }     
});

app.get('/chartview', (req, res)=>{
    if (req.session.loggedIn)
    {
        connection.query(`SELECT date, stepcount FROM stepdatas WHERE userID=${req.session.userID} ORDER BY date ASC`, (err, results)=>{
            if (err) throw err;

            let str = '';
            results.forEach(element => {
                str += `{ label: '${moment(element.date).format('YYYY-MM-DD')}', y: ${element.stepcount} },`;
            });
            
            str = str.substr(0, str.length-1);
          
            ejs.renderFile('public/chartview.ejs', {str}, (err, data)=>{
                if (err) throw err;
                res.send(data);
            });
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }   
});

app.get('/calendarview', (req, res)=>{
    if (req.session.loggedIn)
    {
        connection.query(`SELECT date, stepcount FROM stepdatas WHERE userID=${req.session.userID}`, (err, results)=>{
            if (err) throw err;

            let str = '';
            results.forEach(element => {
                str += `{ start: '${moment(element.date).format('YYYY-MM-DD')}', title: '${element.stepcount}' },`;
            });
            
            str = str.substr(0, str.length-1);
            let aktDate = getAktDate();

            ejs.renderFile('public/calendarview.ejs', {str, aktDate}, (err, data)=>{
                if (err) throw err;
                res.send(data);
            });
        });
    }
    else
    {
        res.send('This page is only for registered users!');
    }   
});

app.get('/deletestep/:id', (req, res)=>{
    var id = req.params.id;
    connection.query(`DELETE FROM stepdatas WHERE ID=${id}`, (err)=>{
        if (err) throw err;
        res.redirect('/tableview');
    });
});


// admin - users management

app.listen(port, ()=>{
    console.log(`Server listening on port ${port}...`);
});


function getAktDate()
{
    var now = new Date();
    var aktDate = now.getFullYear() + '-' + 
        ((now.getMonth() < 10) ? "0" + now.getMonth()+1 : now.getMonth()+1) + '-' + 
        ((now.getDate() < 10) ? "0" + now.getDate() : now.getDate());
    return aktDate;
}