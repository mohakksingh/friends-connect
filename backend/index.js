require("dotenv").config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors')
const authRoutes=require('./routes/auth')

const app=express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Connected to MongoDB")
}).catch(err=>{
    console.log("MONGODB ERROR",err);
})

app.use('/api/auth',authRoutes);

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Server is running on port",PORT);
})