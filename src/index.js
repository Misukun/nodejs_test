// Dependences
const express = require('express');
const fs = require('fs');
const redis = require('redis');
const app = express();
const port = 3000;
const redisClient = redis.createClient();

// use middleware to express POST request ans JSON´s
app.use(express.urlencoded({extended:true}));
app.use(express.json());

// check connections to Redis
redisClient.on('connect', () => {
    console.log('connected');
})
redisClient.on('error', (error) => {
    console.log(error);
})

// Display in browser the wiev form and refress the result of count
function getCounts (req, res) {
    const header = '<h1>Count Display:</h1>';
    const form = '<form id="form" method="post" action="/track">'
        + '<p><label for="count">how much do you want to increase the count?</label></p>'
        + '<p><input type="text" name="count" id="count"></p>'
        + '<p><label for="reset">Do you want reset the count?</label></p>'
        + '<p><select for="reset" name="reset" id="reset">'
        + '     <option value="true">YES</option>' 
        + '     <option value="false" selected="selected">NO</option>' 
        + '</select></p>'  
        + '<p><input type="submit" value="Send"/></p>'
        + '';
        + '</form>'

    let dataSend;
    let info;

    redisClient.get('count', (err, data) => {
        if (err) throw err;

        if (data) {
            dataSend = parseInt(data);

            info = `<p>The actualy value of count is: ${dataSend}</p>`;

            return res.send('<html><body>'
                + header
                + form
                + info
                + '</html></body>'
            );
            
        } else {
            dataSend = 0;

            redisClient.set('count', dataSend, (err, data) => {

                if (err) throw err;

                info = `<p>The actualy value of count is: ${dataSend}</p>`;

                return res.send('<html><body>'
                    + header
                    + form
                    + info
                    + '</html></body>'
                );
        
            })
        }
    });   
}

// Post Method
function postTracks (req, res) {

    let toSave = JSON.stringify(req.body);

    // save file in JSON
    fs.writeFileSync('./backups/data.json', toSave, 'utf-8');


    let objectToUse = {
        count: parseInt(req.body.count) || 'error',
        reset: (req.body.reset === 'true')
    }

    let dataSend;

    if (objectToUse.count !== 'error' && !objectToUse.reset) {

        redisClient.get('count', (err, data) => {
            if (err) throw err;
            
            if (data) {
                dataSend = parseInt(data) + objectToUse.count;
                redisClient.set('count', dataSend, (err, data) => {

                    if (err) throw err;
            
                })
    
            } else {
                dataSend = objectToUse.count;
                redisClient.set('count', dataSend, (err, data) => {
    
                    if (err) throw err;
            
                })
            }

            return res.redirect('/count');

        })     


    } else if (objectToUse.reset) {
        redisClient.set('count', 0, (err, data) => {
            if (err) throw err;

            return res.redirect('/count');

        })  

    } else {
        return res.redirect('/count');
    }

}

app.post('/track', postTracks);

app.get('/count', getCounts);

app.get('/', (req, res) => {
    res.send('<h1>This is the main page of the test of node.js.</h1>' 
        + '<p>Please, use "/count" route in the browser to see the count key or <a href="/count">click here</a>.</p>'   
    );
})

app.get('**', (req, res) => {
    res.send('This path doesn´t exisit. Please, use "/" or "/count"');
})

app.listen(port, () => {
    console.log(`Node.js test listening at http://localhost:${port}`)
})

module.exports = app.listen(3001);