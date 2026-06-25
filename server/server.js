const express=require("express");
const http=require("http");
const cors=require("cors");
const {Server}=require("socket.io");


const app=express();

app.use(cors());


const server=http.createServer(app);


const io=new Server(server,{
cors:{
origin:"*"
}
});



let rooms={};



io.on("connection",(socket)=>{


console.log(
"Device connected:",
socket.id
);



socket.on(
"create-room",
(room)=>{


rooms[room]=true;

socket.join(room);


socket.emit(
"room-created",
room
);


});





socket.on(
"join-room",
(room)=>{


if(rooms[room])
{

socket.join(room);


io.to(room)
.emit(
"peer-ready"
);


}

});





socket.on(
"signal",
(data)=>{


socket.to(data.room)
.emit(
"signal",
data.signal
);


});




socket.on(
"disconnect",
()=>{

console.log(
"left"
)

});


});





server.listen(
5000,
()=>console.log(
"SERVER RUNNING"
)
);