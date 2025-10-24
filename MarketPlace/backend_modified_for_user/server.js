const { registerProvider, getAvailableProviders } = require('./controllers/provider.controller');
require('./blockchain/listener');
const express=require('express');
const mongoose =require('mongoose');
const cors =require('cors');
const dockfileRoutes = require('./routes/dockfile.route');
const datafileRoutes = require('./routes/datafile.route');
require('dotenv').config();
const zipRouter = require("./routes/zip.route"); 
const { getAllJobs, getJobsByStatus, getJobById } = require('./controllers/job.controller');

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// 
let main=()=>{
    mongoose.connect(process.env.MONGO_URI
    ).then(()=>{
        console.log('Connected to MongoDB');
    }).catch((err)=>{
        console.error('MongoDB connection error:',err);
    });
};
main();

app.use('/api/dockfile',dockfileRoutes);
app.use('/api/datafile',datafileRoutes);
app.use("/api", zipRouter);
app.get("/api/jobs", getAllJobs);
app.get("/api/jobs/status/:status", getJobsByStatus);
app.get("/api/jobs/:id", getJobById);

app.get('/',(req,res)=>{
    res.send('Welcome to the DockFile Generator API');
});


const PORT=process.env.PORT || 3000;

app.post('/api/provider/register', (req, res) => registerProvider(req, res));
app.get('/api/provider/available', (req, res) => getAvailableProviders(req, res));

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});