const router = require("express").Router();
const Room = require("../models/room.model");
const User = require("../models/user.model");
const jwt = require('jsonwebtoken');
require('dotenv').config();
const [verify_token, generateAccessToken, generateRefreshToken] = require('../controller/jwtFunctions');


//get messages

router.post("/:roomid/:username/get_messages", verify_token, async (req, res) => {
    console.log("getting msg",req.body)
    try {
        console.log("etf is wrong")
        let roominfo = await Room.findOne({
            roomid: req.params.roomid,
        });
        console.log("room:",roominfo)
        if(roominfo){
            //do nothing
        }
        else{
            const newroom = new Room({
                roomid: req.params.roomid,
                messages: []
            });
            roominfo = await newroom.save()
        }
        await roominfo.updateOne({ $push: { messages: req.body.msg } })
        const newroominfo = await Room.findOne({
            roomid: req.params.roomid,
        });
        res.status(200).json(newroominfo.messages);
    } catch (err) {
        res.status(500).json(err);
    }
});



//add a message

router.post("/:roomid/:username/send_message", verify_token, async (req, res) => {
    console.log("sending msgs", req.body)
    try {
        let roominfo = await Room.findOne({
            roomid: req.params.roomid,
        });
        console.log("room:",roominfo)
        if(roominfo){
            //do nothing
        }
        else{
            const newroom = new Room({
                roomid: req.params.roomid,
                messages: []
            });
            roominfo = await newroom.save()
        }
        await roominfo.updateOne({ $push: { messages: req.body.msg } })
        const newroominfo = await Room.findOne({
            roomid: req.params.roomid,
        });
        res.status(200).json(newroominfo.messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;