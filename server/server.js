const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

app.use(cors());
app.use(express.json());


// serve frontend
app.use(express.static(path.join(__dirname,"public")));


const uploadFolder = path.join(__dirname,"uploads");


if(!fs.existsSync(uploadFolder)){
    fs.mkdirSync(uploadFolder);
}


const storage = multer.diskStorage({

destination:(req,file,cb)=>{
    cb(null,uploadFolder);
},

filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
}

});


const upload = multer({
    storage
});


let rooms={};



function createCode(){

return Math.random()
.toString(36)
.substring(2,7)
.toUpperCase();

}



// create room
app.get("/create-room",(req,res)=>{

let code=createCode();


rooms[code]={
    files:[]
};


setTimeout(()=>{

delete rooms[code];

},10*60*1000);



res.json({
    code
});


});




// upload file

app.post("/upload/:code",
upload.single("file"),
(req,res)=>{


let code=req.params.code;


if(!rooms[code]){

return res.status(404).json({
error:"room expired"
});

}



let file={

name:req.file.originalname,

file:req.file.filename

};



rooms[code].files.push(file);



io.to(code).emit(
"file",
file
);



res.json({
success:true
});


});




// download

app.get("/download/:file",(req,res)=>{


let filePath =
path.join(
uploadFolder,
req.params.file
);


res.download(filePath);


});




// socket

io.on("connection",(socket)=>{


socket.on("join",(code)=>{


if(rooms[code]){


socket.join(code);


socket.emit(
"files",
rooms[code].files
);


}


});


});




// homepage fallback

app.get("*",(req,res)=>{

res.sendFile(
path.join(__dirname,"public","index.html")
);

});



const PORT =
process.env.PORT || 5000;


server.listen(PORT,()=>{

console.log(
"SERVER RUNNING ON "+PORT
);

});
