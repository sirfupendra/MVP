const express=require('express');
const mongoose =require('mongoose');
const cors =require('cors');
const dockfileRoutes = require('./routes/dockfile.route');


const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// 
app.use('/api/dockfile',dockfileRoutes);

app.get('/',(req,res)=>{
    res.send('Welcome to the DockFile Generator API');
});


const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});