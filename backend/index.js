require("dotenv").config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors')
const authRoutes=require('./routes/auth')
const friendRoutes=require('./routes/friends')
const userRoutes=require('./routes/users')

const app=express();

app.use(cors({
    origin: "http://localhost:5173",
    allowedHeaders: "Content-Type,Authorization", 
}));

app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Connected to MongoDB")
}).catch(err=>{
    console.log("MONGODB ERROR",err);
})

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/friends', friendRoutes);


const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log("Server is running on port",PORT);
})