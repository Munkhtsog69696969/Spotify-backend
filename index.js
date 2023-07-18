require("dotenv").config();
const express=require("express");
const cors=require("cors");
const querystring=require("querystring");
const request=require("request");
const qs = require('qs');
const axios=require("axios");


const app=express();
const port=process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const {stringGenerator}=require("./helper/randomStringGenerator");

app.get("/",(req,res)=>{
    res.send("Server")
})


app.get("/login",(req,res)=>{
    var state = stringGenerator(16);
    var scope = 'user-read-private user-read-email';

    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
        response_type: 'code',
        client_id:process.env.CLIENT_ID,
        scope: scope,
        redirect_uri:process.env.REDIRECT_URI,
        state: state
    }));
});

app.get('/callback',async(req, res)=>{
    var code = req.query.code || null;
    var state = req.query.state || null;

    if (state === null) {
        res.redirect('/#' +
        querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer.from(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET).toString('base64'))
            },
            json: true
        };


        request.post(authOptions,async function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var access_token = body.access_token;
                // res.send({
                //     'access_token': access_token
                // });
                const response = await axios.get("https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg", {
                    headers: {
                      "Authorization": `Bearer ${access_token}`
                    }
                });

                res.send(response)
            }
        });
    }
});

app.listen(port,()=>{
    console.log("Server listening",port);
})

