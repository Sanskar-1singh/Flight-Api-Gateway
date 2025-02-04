const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const {Logger}=require('./config')
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.text());

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    Logger.info("successfully started server",{});
});
