$(function() {
    var socket = io();      // Global io from socket.io-client.
    var usernameError = $('#error');
    var usernameInput = $('#new-username');
    var users = $('#users-online');

    //New user connects.
    $('form#setUsername').submit(function() {
        socket.emit('new user', usernameInput.val(), function (data) {
            if(data){
                $('#usernameWrapper').hide();
                $('#contentWrap').show();
            } else {
                usernameError.html('sorry, that username has been taken, try another one!');
            }
        });

        usernameInput.val('');
        return false;
    });

    //Display online users.
    socket.on('usernames', function(usernames) {
        var onlineUsers = "<h5>online users:</h5><hr />";
        for(var i=0; i < usernames.length; i++) {
            onlineUsers += "<p>" + usernames[i] + "</p>";
        }

        users.html(onlineUsers);
    });

    //Display message when user enters chat room.
    socket.on('user enter',function(msg) {
        $('#messages').append($('<div class="user user-enter">').text(msg));                
    });  

    //Display message when user exits chat room.
    socket.on('user exit',function(msg) {
        $('#messages').append($('<div class="user user-exit">').text(msg));
    });

    //New message emitted to server.
    $('form#sendMessages').submit(function() {
        socket.emit('chat message', $('#new-message-box').val());
        $('#new-message-box').val('');
        return false;
    });

    //Display new message.
    socket.on('chat message', function(msg, time, user) {
        var newMessage = $("<div class='new-message row'>");
        var newMessageUser = $("<div class='new-message-user col-md-2'>").text(user);
        var newMessageText = $("<div class='new-message-text col-md-6'>").text(msg);
        var newMessageTime = $("<div class='new-message-time col-md-4'>").text(time);
        //Remove the row which indicated a user is typing.
        $('.user-typing').remove();
        //Append new row with user's message.
        $('#messages').append(newMessage);
        $(newMessage).append(newMessageUser).append(newMessageText).append(newMessageTime);
    });

    //User is typing.
    $('#new-message-box').on('keypress', function (e) {
        var char = (e.which);
        var charCount = $('#new-message-box').val().length;

        //If user hits any key except 'return', emit event.
        if(char !== 13 ) {
            socket.emit('user typing', charCount);
        }
    });

    socket.on('user typing', function(charCount) {
        var newTypingBox = $("<div class='user-typing row'>");
        var isTyping = $('.user-typing').length;

        //Insert a new row when user begins typing.
        if(charCount === 0 && isTyping === 0) {
            $('#messages').append(newTypingBox);
        }

        //Display '...' while user is typing.
        if(charCount % 4 !=0 ) {
            $('.user-typing').append('.');
        } else {
            $('.user-typing').empty();
            $('.user-typing').append('.');
        }
    });
});