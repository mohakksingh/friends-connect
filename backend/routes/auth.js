const express=require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register',async(req,res)=>{
    try{
        const {username,email,password}=req.body;

        const userExists=await User.findOne({
            $or:[{username},{email}]
        })
        if(userExists){
            return res.status(400).send({error:"User already exists"})
        }

        const hashedPassword=await bcrypt.hash(password,10);

        const user=new User({
            username,
            email,
            password:hashedPassword
        })
        await user.save();

        const token=jwt.sign({userId:user.id},process.env.JWT_SECRET,{
            expiresIn:'7d'
        });

        res.status(201).json({
            token,
            user:{
                id:user.id,
                username:user.username,
                email:user.email
            }
        })
    }catch(e){
        res.status(500).send({error:"Internal server error"})
    }
})


router.post('/login',async(req,res)=>{
    try{
        const {email,password}=req.body;

        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                error:"Invalid credentials"
            })
        }

        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({
                error:"Invalid credentials"
            })
        }

        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET,{
            expiresIn:'7d'
        })

        res.json({
            token,
            user:{
                id:user.id,
                username:user.username,
                email:user.email
            }
        })
    }catch(e){
        res.status(500).send({error:"Internal server error"})
    }

})

module.exports=router;
