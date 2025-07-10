const express = require('express')
const http = require('http')
const socketio = require('socket.io')

const connect = require('./config/database-config')
const Chat = require('./models/chat')

const app = express();
const server = http.createServer(app);
const io = socketio(server);


io.on('connection',(socket)=>{
    // console.log('a user connected',socket.id)

    // socket.on('from_client',()=>{
    //     console.log('Event comming from client')
    // })

    socket.on('join_room',(data)=>{
        // console.log('joined a room',data.roomid)
        socket.join(data.roomid)
    })

    socket.on('msg_send',async(data,callback)=>{
        console.log(data)
        //io.emit('msg_rcvd',data)
        //socket.emit('msg_rcvd',data)
        //socket.broadcast.emit('msg_rcvd',data)
        const chat = await Chat.create({
            roomId: data.roomid,
            user: data.username,
            content:data.msg
        })
        // Send to others
        socket.broadcast.to(data.roomid).emit('msg_rcvd',data);

        // Acknowledge to sender
        callback({ status :'ok',...data});  // Sends data back to sender

        //io.to(data.roomid).emit('msg_rcvd',data)
     });

     socket.on('typing',(data)=>{
        socket.broadcast.to(data.roomid).emit('someone_typing',{username:data.username})
        
     })
})

app.set('view engine','ejs');
app.use('/',express.static(__dirname+'/public'))

app.get('/chat/:roomId',async(req,res)=>{
    const chats = await Chat.find({
        roomId: req.params.roomId
    }).select('content user')
    res.render('index',{
        name: "VIjay",
        id: req.params.roomId,
        chats:chats
    })
})

server.listen(3000,async()=>{
    console.log('Server started at 3000')
    await connect();
    console.log("mongo db connected")
})