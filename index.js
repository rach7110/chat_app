var express = require('express');             
var app = express();                         //Express framework initializes 'express' to be a function handler.
var http = require('http').Server(app);     //Supply 'app' to the HTTP server.
var io = require('socket.io')(http);            // Initialize a new instance of socket.io and pass it the server object, http.

const PORT = process.env.PORT || 3000;

//Serve static files with Express.
app.use("/css", express.static(__dirname + '/css'));

app.get('/', function(req, res) {           // Define a route handler.
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {      // Listen on the 'connection' event for incoming sockets.
    
    //Broadcast to users a new message.
    socket.on('chat message', function(msg) {
        var time = new Date().toLocaleString("en-US", {timeZone: "America/New_York"});
        io.emit('chat message', msg, time);
    });
    //Broadcast to users when someone connects.
    io.emit('user enter', 'A user has entered the chat room.');    
    //Broadcast to users when someone disconnects.
    socket.on('disconnect', function() {
        io.emit('user exit', 'A user has exited the chat room.');
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