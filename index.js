var express = require('express');             
var app = express();                         //Express framework initializes 'express' to be a function handler.
var http = require('http').Server(app);     //Supply 'app' to the HTTP server.
var io = require('socket.io')(http);       // Initialize a new instance of socket.io and pass it the server object, http.
var usernames = [];                         

const PORT = process.env.PORT || 3000;

//Serve static files with Express.
app.use("/public", express.static(__dirname + '/public'));

app.get('/', function(req, res) {           // Define a route handler.
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {      // Listen on the 'connection' event for incoming sockets.
    
    //Broadcast to users when someone connects (and update users list).
    socket.on('new user', function(data, callback) {
        if(usernames.indexOf(data) != -1 ) {
            callback(false);
        } else {
            socket.username = data;
            usernames.push(socket.username);
            callback(true);
            io.emit('user enter', socket.username + " has entered the chat room.");        
            io.emit('usernames', usernames);
        }
    });

    //Broadcast to users when someone disconnects (and update users list).
    socket.on('disconnect', function(data) {
        if(!socket.username) return;

        usernames.splice(usernames.indexOf(socket.username), 1)
        io.emit('user exit', socket.username + " has exited the chat room.");
        io.emit('usernames', usernames);
    });

    //Broadcast to users a new message.
    socket.on('chat message', function(msg) {
        var time = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        io.emit('chat message', msg, time, socket.username);
    });

    //Broadcast when a user is typing.
    socket.on('user typing', function(charCount) {
        io.emit('user typing', charCount);
    });

});

http.listen(PORT, function() {              //Make the server listen on port 3000.
    console.log('listening on ' + PORT);
});


//Socket.IO is composed of two parts:
//1. A server that integrates with (or mounts on) the 
//Node.JS HTTP Server: socket.io
//2. A client library that loads on the browser side: 
//socket.io-client

//During development, socket.io serves the client 
//automatically for us.