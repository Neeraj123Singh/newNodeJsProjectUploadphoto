const jwt= require('jsonwebtoken');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
require('../db/conn'); 
const User = require('../model/userSchema');
const Event = require('../model/eventSchema');
const Image = require('../model/imageSchema');
const userEvent = require('../model/userEventSchema');
const authenticate = require('../middleware');
const UserEvent = require('../model/userEventSchema');
router.get('/', (req,res)=>{
    res.send(`Hello World Router`);
});

router.post('/register',async (req,res)=>{
    /*
    //Using Promises
    const {name,email,password} = req.body;
    if(!name||!email||!password)
    {
        return res.status(422).json({
            "error":"Please Fill all the fileds"
        })
    }
    User.findOne({email:email})
    .then((userExist)=>{
        if(userExist){
            return res.status(422).json({error: "Email Already exists"});
        }
        const user = new User({name,email,password});
        user.save().then(()=>{
          res.status(201).json({mesaage: "user registered successfully"});  
        }).catch((err)=> res.status(500).json({error: "Failed to register"}));
    }).catch((err)=>{ console.log(err)});
    */
    const {email,password,gender,firstName,lastName,dob,photo} = req.body;
    if(!email || !password || !gender || !firstName || !lastName || !dob){
        res.status(422).json({mesaage: "Fill all fileds"});
    }
    else{
    try{
        const userExist = await User.findOne({email:email});
        if(userExist){
            return res.status(422).json({error: "Email Already exists"});
        }
        else{
        const user = new User({email,password,gender,firstName,lastName,dob,photo});
        
        await user.save();
        res.status(201).json({mesaage: "user registered successfully"});  
        }
    }catch(err){
        console.log(err);
    }
    }
    
})

router.post('/login', async (req,res)=>{
    let token;
    try{
        const {email,password,gender,firstName,lastName,dob,photo} = req.body;
        if(!email || !password ){
            res.status(422).json({mesaage: "Fill all fileds"});
        }
        else{
        const userLogin  = await User.findOne({email:email});
        if(userLogin)
        {
            const isMatch =await bcrypt.compare(password,userLogin.password);
            token = await  userLogin.generateAuthToken();
            res.cookie("jwtoken",token,{
                expires:new Date(Date.now()+258920000),
                httpOnly:true
            })
            if(!isMatch){
                res.status(201).json({mesaage: "Invalid Credentials"});
            }
            else
            {
                res.status(201).json({mesaage: "user SignIn successfully",token:token});
            }
        }else
        {
            res.status(400).json({mesaage: "user error"});
        }
     }
    }catch(err){
        console.log(err);
    }
})
//get Profile
router.get('/getProfile',authenticate ,async (req,res)=>{
    try{
        res.status(201).json({message: "Here is Your Profile",user:req.rootUser});  
    }catch(err){
        console.log(err);
    }
 })

 router.put('/updateProfile',authenticate ,async (req,res)=>{
    const {email,password,gender,firstName,lastName,dob,photo} = req.body;
    if(!email || !password || !gender || !firstName || !lastName || !dob){
        res.status(422).json({mesaage: "Fill all fileds"});
    }
    try{
        const event = await User.findOne({_id:req.rootUser._id});
        if(!event)
        {
            return res.status(501).json({message: "User not found"});
        }
        if(event){
            await event.update(req.body);
            return res.status(200).json({message: "User updated Succesfully",event:event});
        }
    }catch(err){
        console.log(err);
    }
 })
//Event routes

router.post('/createEvent', authenticate,async (req,res)=>{
    const {title,description,date,time,maximumParticipant} = req.body;
    if(!title || !description || !date || !time || !maximumParticipant){
        res.status(422).json({mesaage: "Fill all fileds"});
    }
    try{
        const eventExist = await Event.findOne({createdBy:req.rootUser._id,title:title});
        if(eventExist){
            return res.status(422).json({error: "Event Already exists"});
        }
        const event = new Event({title:title,description:description,currentParticipant:0,date:date,time:time,maximumParticipant:maximumParticipant,createdBy:req.rootUser._id});
        
        await event.save();
        res.status(201).json({message: "Event Created successfully",event:event});  
    }catch(err){
        console.log(err);
    }
})

router.get('/getEvent/:id',authenticate,async (req,res)=>{
    id= req.params.id;
    try{
        const eventExist = await Event.findOne({_id:id});
        if(eventExist){
            return res.status(200).json({event: eventExist});
        }
        else{
            res.status(404).json({error: "Event not found."});  
        }
    }catch(err){
        console.log(err);
    }
 })

 router.get('/getEvent/',authenticate,async (req,res)=>{
    const id = req.body.id;
    try{
        const eventExist = await Event.find({_id:id});
        if(eventExist){
            return res.status(200).json({event: eventExist});
        }
        else{
            res.status(404).json({error: " No Events found."});  
        }
    }catch(err){
        console.log(err);
    }
 })

 router.get('/getAllEvents/',authenticate,async (req,res)=>{
    const id = req.body.id;
    try{
        const eventExist = await Event.find({createdBy:req.rootUser._id});
        if(eventExist){
            return res.status(200).json({event: eventExist});
        }
        else{
            res.status(404).json({error: " No Events found."});  
        }
    }catch(err){
        console.log(err);
    }
 })

 router.delete('/deleteEvent/',authenticate,async (req,res)=>{
    const {id} = req.body;
    try{
        const eventExist = await Event.find({_id:id});
        if(eventExist){
            await Event.deleteOne({_id:id})
            return res.status(200).json({message: "Event deleted Succesfully"});
        }
        else{
            res.status(404).json({error: "Event not found."});  
        }
    }catch(err){
        console.log(err);
    }
 })

 router.put('/updateEvent/',authenticate,async (req,res)=>{
    const {id,title,description,date,time,maximumParticipant} = req.body;
    if(!title || !description || !date || !time || !maximumParticipant){
        res.status(422).json({mesaage: "Fill all fileds"});
    }
    try{
   
        const eventExist = await Event.findOne({_id:id});
        if(eventExist){
            await eventExist.update({title:title,description:description,date:date,time:time,maximumParticipant:maximumParticipant,createdBy:req.rootUser._id});
            return res.status(200).json({message: "Event updated Succesfully",event:eventExist});
        }
        else{
            res.status(404).json({error: "Event not found."});  
        }
    }catch(err){
        console.log(err);
    }
 })

 router.post('/joinEvent', authenticate,async (req,res)=>{
    const id = req.body.eventId;
    if(!id){
        res.status(422).json({mesaage: "Fill all fileds"});
    }
    try{
        const eventExist = await Event.findOne({_id:id});
        if(!eventExist){
            return res.status(422).json({error: "Event Not exists"});
        }
        else{
        const userEventExist = await UserEvent.findOne({userId:req.rootUser._id,eventId:id})
        if(userEventExist) res.status(422).json({error: "User Event Already Exist"});
        else{
        if(eventExist.maximumParticipant==eventExist.currentParticipant){
            return res.status(422).json({error: "Event is full"});
        }
        else{
        eventExist.currentParticipant = eventExist.currentParticipant + 1;
        await eventExist.update(eventExist);
        let userEvent = new UserEvent({userId:req.rootUser._id,eventId:eventExist._id});
        
        await userEvent.save();
        res.status(201).json({message: "Joined Event  successfully",userEvent:userEvent,"eventDetails":eventExist});  
        }
        }
       }
    }catch(err){
        console.log(err);
    }
})

router.post('/leaveEvent', authenticate,async (req,res)=>{
    const id = req.body.eventId;
    if(!id){
        res.status(422).json({mesaage: "Fill all fileds"});
    }
    try{
        const eventExist = await Event.findOne({_id:id});
        if(!eventExist){
            return res.status(422).json({error: "Event Not exists"});
        }
        else{
        const userEventExist = await UserEvent.findOne({userId:req.rootUser._id,eventId:id})
        if(!userEventExist) res.status(422).json({error: "You are not a participant of this  event"});
        else{
        eventExist.currentParticipant = eventExist.currentParticipant - 1;
        await eventExist.update(eventExist);
        await userEvent.deleteMany({userId:req.rootUser._id,eventId:id})
        res.status(201).json({message: "Leaved Event  successfully",userEvent:userEvent,"eventDetails":eventExist});  
        }
       }
    }catch(err){
        console.log(err);
    }
})


router.get('/getAllParticipants/',authenticate,async (req,res)=>{
    const id = req.body.eventId;
    try{
        const eventExist = await Event.findOne({createdBy:req.rootUser._id,_id:id});
        console.log(eventExist)
        if(eventExist){
            const userIds = await UserEvent.find({eventId:id}).select({ "userId": 1, "_id": 0})
            let userIdsArray = [];
            for(let i=0;i<userIds.length;i++)
            {
                userIdsArray.push(userIds[i].userId);
            }
            let users = await User.find({_id:{$in:userIdsArray}});
            return res.status(200).json({users: users});
        }
        else{
            res.status(404).json({error: " No Events found."});  
        }
    }catch(err){
        console.log(err);
    }
 })



router.get('/getEventCreator/',authenticate,async (req,res)=>{
    const id = req.body.eventId;
    try{
        const eventExist = await Event.findOne({_id:id});
        if(eventExist){
            let user = await User.findOne({_id:eventExist.createdBy});
            return res.status(200).json({creator: user});
        }
        else{
            res.status(404).json({error: " No Events found."});  
        }
    }catch(err){
        console.log(err);
    }
 })

 router.post('/updateProfilePhoto/',authenticate,async (req,res)=>{
    const photo = req.body.photo;
    if(!photo)  res.status(201).json({"error": "please provide all the fields"}); 
    else{
    let imageExist = await Image.findOne({userId:req.rootUser._id})
    const extension = photo.split(";")[0].split('/')[1];
    try{
      if(imageExist)
      {
         imageExist.update({name:req.rootUser._id+extension,photo:photo});
      }  
      else{
      imageExist = new Image({name:req.rootUser._id+"."+extension,photo:photo,createdBy:req.rootUser._id});
      imageExist.save();
      }
      res.status(201).json({"image": imageExist});  
    }catch(err){
        console.log(err);
    }
   }
 })

router.get('/about',authenticate ,async (req,res)=>{
   res.status(200).json({mesaage: "about me"});
})

module.exports =router;
