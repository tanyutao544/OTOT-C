require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./userModel.js');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const posts = [
  {
    username: 'jim',
    title: 'Post 1',
  },
  {
    username: 'tom',
    title: 'Post 2',
  },
];
const adminPosts = [
  {
    username: 'admin',
    title: 'admin secrets'
  }
]

mongoose.connect(process.env.DATABASE_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.get('/', (_, res) => res.send('Hello from OTOT-C'));

app.get('/posts', authenticateToken(process.env.ACCESS_TOKEN_SECRET), (req, res) => {
  res.json(posts).send();
});

app.get('/posts/admin', authenticateToken(process.env.ACCESS_TOKEN_SECRET), (req, res) => {
  if(req.admin){
    res.json(adminPosts).send();
  } else {
    res.status(403).send();
  }
})

app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const adminRights = (req.body.admin == 'true');
    const newUser = new User({
      name: req.body.name,
      password: hashedPassword,
      admin: adminRights
    });
    console.log(newUser);
    newUser.save();
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

app.post('/users/login', async (req, res) => {
  try {
    const user = await User.find({ name: req.body.name });
    if (user.length == 0) {
      return res.status(400).send('Cannot find user');
    }
    if (await bcrypt.compare(req.body.password, user[0].password)) {
      const accessToken = jwt.sign(
        { name: user[0].name },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.json({ acessToken: accessToken });
    } else {
      res.send('not allowed');
    }
  } catch {
    res.status(500).send();
  }
});

function authenticateToken(access_token) {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    res.status(401).send();
  }
  jwt.verify(token, access_token, (err, user) => {
    if (err) {
      res.status(403).send();
    }
    req.user = user;
    next();
  });
  }  
}

app.listen(3000);
