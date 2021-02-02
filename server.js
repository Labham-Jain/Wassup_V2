const express = require('express')
const app = express()
const http = require('http').createServer(app)

const PORT = process.env.PORT || 3000

http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let connectedClientsList = [];

// Socket 
const io = require('socket.io')(http);
io.on('connection', (socket) => {
    
    socket.on('joining-details', (data) => {
        socket.name = data.name;
        socket.joinid = data.id;
        socket.join(data.id);
        connectedClientsList.push(data)
        io.emit('connected-clients', connectedClientsList)
    });

    socket.on('message', (data) => {
        socket.to(data.to).emit('message', data);
    })

    socket.on('disconnect', () => {
        connectedClientsList = connectedClientsList.filter((item) => (item.id !== socket.joinid));

        io.emit('connected-clients', connectedClientsList)
    })

})