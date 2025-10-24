const express=require('express');
const mongoose =require('mongoose');
const cors =require('cors');
const dockfileRoutes = require('./routes/dockfile.route');
const datafileRoutes = require('./routes/datafile.route');
require('dotenv').config();
const zipRouter = require("./routes/zip.route"); 

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// 
app.use('/api/dockfile',dockfileRoutes);
app.use('/api/datafile',datafileRoutes);
app.use("/api", zipRouter);

app.get('/',(req,res)=>{
    res.send('Welcome to the DockFile Generator API');
});


const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});