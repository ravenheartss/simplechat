// SENG 513 Assignment 3 -- Winter 2020
// Name: Shankar Ganesh
// UCID: 30055527
// Tutorial/Lab: T01/B01

// Packages needed. 
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var client = require('express');
var cookie = require('cookies');
var cookie_parser = require('cookie-parser');

// All connected users.
let users = [];
// Message_history
let message_history = [];

// COlour of user
let colour_new;
// User id of user
let user;
// Current time. 
let time;
// Number of users.
let nusers = 0;
// max messages stored on the server
let max_msgs = 500;

// Set to listen to port 3000
http.listen(3000, function(){
    console.log('listening on *:3000');
});

app.use(cookie_parser());

io.on('connection', function(socket){
    // Get time and date
    time = getTime();
    // User id of a user who disconnects
    let discon_user;
    // Create a new userid and send to client.
    // Also send all the connected clients and message_history
    socket.on('init', function(){
        let uid_temp = "user" + nusers;
        users.push(uid_temp);
        nusers++;
        discon_user = uid_temp;
        socket.emit('init', uid_temp);
        io.emit('conn_users', users);
        socket.emit('messages', message_history);
    });

    // If a user has disocnnected then remove them from the users list
    socket.on('disconnect', function(){
        users = users.filter(function(value, index, arr){
            return value != discon_user;
        });
        io.emit('conn_users', users);
    });

    // If user already had a username.
    // Add to connected users and send message history and connected users.
    socket.on('setup', function(uid){
        if(!users.includes(uid)){
            users.push(uid);
            uu = uid;
        }
        
        io.emit('conn_users', users);
        socket.emit('messages', message_history);
    });

    // Message is being sent. 
    socket.on('chat', function(msg_shown, uid, colour){
        // Split the message
        let msg_split = msg_shown.split(" ");
        // If first wird is /nick then change nickname and 
        // send a confirmation to client. 
        if (msg_split[0] === "/nick"){
            user = msg_split[1];
            let index_loc = users.indexOf(uid);
            users[index_loc] = user;
            socket.emit('change_uid', user);
            io.emit('conn_users', users);
            time = getTime();
            let message = "Nicname changed to " + user;
            socket.emit('chat', message, time, "Server", "#FFFFFF");
        }
        // If first word is /nickcolor then change colour and 
        // sned confirmation to client.
        else if (msg_split[0] === "/nickcolor"){
            let message = "";
            colour_new = msg_split[1];
            colour_new = "#" + colour_new;
            // If colour is not valid, send error message
            if(/^#[0-9A-F]{6}$/i.test(colour_new)){
                socket.emit('colour_change', colour_new);
                time = getTime();
                message = "Colour changed to " + colour_new;
            }
            else{
                time = getTime();
                message = "Colour not valid. Please enter a colour in the form RRGGBB";
            }
            socket.emit('chat', message, time, "Server", "#FFFFFF");
        }

        // Send message to all clients.
        // Message is stored as a 4-tuple. 
        else{
            time  = getTime();
            tuple4 = [msg_shown, time, uid, colour];
            if (message_history.length >= max_msgs){
                message_history = [];
            }
            message_history.push(tuple4);
            io.emit('chat', msg_shown, time, uid, colour);
        }
    });

});

// Get the time and data in a pretty format.
function getTime() {
    let temp;
    let date = new Date();
    let hour = date.getHours();
    let minutes = date.getMinutes();
    
    if(minutes < 10)
    {
        minutes = "0" + minutes;
    }

    if(hour > 12){
        hour = "0" + (hour - 12); 
        temp = hour + ":" + minutes + " P.M.";
    }else{
        hour = "0" + hour;
        temp = hour + ":" + minutes + " A.M.";
    }

    
    d = date.toDateString;
    temp = temp + "  |  " + date.toDateString();
    return temp;
}

// Load the files in the client folder.
app.use(client.static(__dirname + '/client'));