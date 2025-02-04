const express = require('express');

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');
const {Logger}=require('./config');
const rateLimit=require('express-rate-limit');
const {createProxyMiddleware}=require('http-proxy-middleware');
const app = express();

const limiter=rateLimit({
    windowMs:2*60*1000, //2 minutes
    max:50,//limit each ip to 50 request per window
    message: {
        status: 429,
        error: "Too many request",
        message: "You have exceeded the request limit. Please try again later."
    },
});


app.use(limiter);

app.use('/flightsService',createProxyMiddleware({target:'http://localhost:3000/',changeOrigin:true}));
app.use('/bookingsService', createProxyMiddleware({
    target: 'http://localhost:4000/',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
        if (req.body) {
            let bodyData = JSON.stringify(req.body);
            proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
            proxyReq.setHeader('Content-Type', 'application/json');
            proxyReq.write(bodyData);
        }
    }
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));   
app.use(express.text());

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);
    Logger.info("successfully started server",{});
});
