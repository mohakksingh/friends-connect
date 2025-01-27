require("dotenv").config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors')

const app=express();

app.use(cors());
app.use(express.json());

const PORT=process.env.PORT || 5000;