const socket=io(
"https://securedrop-server.onrender.com"
);

let peer;

let channel;

let room;



function createRoom(){


room=
Math.random()
.toString(36)
.substring(2,7)
.toUpperCase();



document
.getElementById("room")
.innerHTML=
"CODE: "+room;



socket.emit(
"create-room",
room
);



start(true);


}





function joinRoom(){


room=
document
.getElementById("join")
.value;



socket.emit(
"join-room",
room
);


start(false);


}




function start(caller){


peer =
new RTCPeerConnection();


peer.onicecandidate=e=>{


if(e.candidate)

socket.emit(
"signal",
{
room,
signal:e.candidate
}
);


};




if(caller){


channel=
peer.createDataChannel(
"file"
);



channel.onopen=()=>{

status.innerHTML=
"Connected";

};



}
else{


peer.ondatachannel=e=>{


channel=e.channel;


channel.onmessage=
receive;


};


}




socket.on(
"signal",
async data=>{


if(data.type==="offer")
{


await peer.setRemoteDescription(
data
);



let ans=
await peer.createAnswer();


await peer.setLocalDescription(
ans
);



socket.emit(
"signal",
{
room,
signal:ans
}
);



}



else if(data.type==="answer")
{


await peer.setRemoteDescription(
data
);



}



else{


await peer.addIceCandidate(
data
);



}


});





if(caller)

makeOffer();



}




async function makeOffer(){


let offer=
await peer.createOffer();


await peer.setLocalDescription(
offer
);



socket.emit(
"signal",
{
room,
signal:offer
}
);


}




function sendFile(){


let file=
document
.getElementById("file")
.files[0];



let reader=
new FileReader();



reader.onload=e=>{


channel.send(
e.target.result
);



alert(
"File Sent"
);



}



reader.readAsArrayBuffer(
file
);



}




function receive(e){



let blob=
new Blob(
[e.data]
);



let link=
document.createElement("a");


link.href=
URL.createObjectURL(blob);



link.download=
"received-file";


link.click();


}