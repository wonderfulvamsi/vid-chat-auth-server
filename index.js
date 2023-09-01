const express = require('express');
const app = express();

const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors')

app.use(cors())

app.use(express.json())

const uri = process.env.ATLAS_URI;
mongoose.connect(uri,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB database connection established successfully");
})

const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');

app.use('/auth', authRouter);
app.use('/room', roomRouter);

app.get('/', (req, res) => {
  res.send('<h1>Hey, this is the Auth-Server to handel all the Auth related shit.</h1>');
});

app.listen(3002, () => {
  console.log('Socket Server is listening on :3002');
});