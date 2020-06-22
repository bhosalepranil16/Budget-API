const express = require('express')
const mongoose =  require('mongoose')
const app = express()

require('dotenv').config();

const port = process.env.PORT;

mongoose.connect(process.env.MONGODB_URL,{
    useCreateIndex : true,
    useUnifiedTopology : true,
    useNewUrlParser : true,
    useFindAndModify : true
});

const budgetRoutes = require('./Routes/routes')
app.use(express.json())
app.use(budgetRoutes)

app.listen(port,() => {
    console.log(`Server is on port ${port}`);
})