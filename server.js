// importing packages

const express = require('express')
const http = require('http').createServer(app)
const io = require('socket.io')(http);

// starting up server

const app = express()
const PORT = process.env.PORT || 3000

// listening server
http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

// adding '/public' directory as '/' path for frontend
app.use(express.static(__dirname + '/public'))

// adding root route

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// creating array to store socket connections
let connectedClientsList = [];


// this will run whenever a socket connects to server
io.on('connection', (socket) => {
    
    /* 'joining-details' will be fired from frontend which 
       will give us user details to setup in our server */

    socket.on('joining-details', (data) => {
        
        // storing data in their socket object to use data later.
        
        socket.name = data.name;
        socket.joinid = data.id;

        // joining a user in "room" so that 2nd person can connect with 1st.

        socket.join(data.id);

        // adding user data in array to use later.

        connectedClientsList.push(data)

        /* sending event back to all connected frontend connections
            and update them that a new connection joined */

        io.emit('connected-clients', connectedClientsList);

    });

    // listening for "message" event from any frontend client
    socket.on('message', (data) => {

        /* sending data to desired "room" with there message and information
           which we are receiving in "data" variable */

        socket.to(data.to).emit('message', data);
    
    })

    // this event automatically fires when a socket gets disconnected.
    socket.on('disconnect', () => {
        /* filtering out which socket connection got disconnected
            and removing it from socket connections array */
        
            connectedClientsList = connectedClientsList.filter((item) => (item.id !== socket.joinid));
        // re updating list on frontend of connected sockets
        io.emit('connected-clients', connectedClientsList)
    })

})