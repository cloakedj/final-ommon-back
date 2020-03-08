const express = require('express');
const router = express.Router();
const http = require('http').Server(router);
const io = require('socket.io')(http);

router.get('/chat', function(req, res) {
    res.render('chat', function(req, res) {
        io.sockets.on('connection', function(socket) {
            socket.on('username', function(username) {
                socket.username = username;
                io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
            });
        
            socket.on('disconnect', function(username) {
                io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
            })
        
            socket.on('chat_message', function(message) {
                io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
            });
        
        });
    });
});

// io.sockets.on('connection', function(socket) {
//     socket.on('username', function(username) {
//         socket.username = username;
//         io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
//     });

//     socket.on('disconnect', function(username) {
//         io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
//     })

//     socket.on('chat_message', function(message) {
//         io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
//     });

// });

module.exports = router;