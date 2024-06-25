let localStream;
let username;
let remoteUser;
let url = new URL(window.location.href);
username = url.searchParams.get("username");
remoteUser = url.searchParams.get("remoteuser");
let peerConnection;
let remoteStream;
let sendchannel;
let receivechannel;
let msginput=document.querySelector("#msg-input")
let msgsendbtn=document.querySelector(".msg-send-button")
let chattextarea=document.querySelector(".chat-text-area")

var omeid=localStorage.getItem("omeid")
if(omeid){
  username=omeid
  try {
   axios.put(`http://localhost:3000/revisiting/${username}`)
  } catch (error) {
    console.log(error)
  }
}else{
  try {
    const {data}=await axios.get("http://localhost:3000/users")
    console.log("data",data)
    //localStorage.setItem("omeid",data._id)
    username=data._id
  } catch (error) {
    console.log(error)
  }
  
}

let init = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    document.getElementById("user-1").srcObject = localStream;

        const {data}=await axios.get(`http://localhost:3000/remoteuser/${username}`)
        console.log("remoteuser:",data)
        if(data[0]){
          if(data[0]._id==remoteUser || data[0]._id==username){
                   
          }else{remoteUser=data[0]._id}
        }
        createOffer();
      
  }
   catch (error) {
      console.log(error)
    }
   
  };

  

init();

let socket = io.connect();

socket.on("connect", () => {
  if (socket.connected) {
    socket.emit("userconnect", {
      displayName: username,
    });
  }
});
let servers = {
  iceServers: [
    {
      urls: ["stun:stun1.1.google.com:19302", "stun:stun2.1.google.com:19302"],
    },
  ],
};

let createPeerConnection = async () => {
  peerConnection = new RTCPeerConnection(servers);

  remoteStream = new MediaStream();

  document.getElementById("user-2").srcObject = remoteStream;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
  peerConnection.ontrack = async (event) => {
    event.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  };

  remoteStream.oninactive = () => {
    remoteStream.getTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
    peerConnection.close();
  };

  peerConnection.onicecandidate = async (event) => {
    if (event.candidate) {
      socket.emit("candidateSentToUser", {
        username: username,
        remoteUser: remoteUser,
        iceCandidateData: event.candidate,
      });
    }
  };

 sendchannel=peerConnection.createDataChannel("senddatachannel");
  sendchannel.onopen=()=>{
    console.log("data channel is open to use")
    onsendchannelstatechange()
  }  

  peerConnection.ondatachannel=(event)=>{
      receivechannel=event.channel;
      receivechannel.onopen=()=>{
        onreceivechannelstatechange();}
      receivechannel.onmessage=(event)=>{
          console.log("received message")
          chattextarea.innerHTML +="<div style='margin-top:2px; margin-bottom:2px;'><b>Stranger:</b>"+event.data+"</div>"; 
      };
      receivechannel.onclose=()=>{onreceivechannelstatechange();}
  }
  /*sendchannel.onmessage = function(event) {
    // Your code to handle the incoming message
  };*/
};

const onsendchannelstatechange=()=>{
   const readystate=sendchannel.readyState;
   console.log("send channel state is:",readystate);
   if(readystate==="open"){
    console.log("open to receive and send data-onsendchannelstatechange")
   }
   else{
    console.log("readystate is closed-onsendchannelstatechange")
   }
};

const onreceivechannelstatechange=()=>{
  const readystate=receivechannel.readyState;
  console.log("receive channel state is:",readystate);
  if(readystate==="open"){
   console.log("open to receive and send data-onreceivechannelstatechange")
  }
  else{
   console.log("readystate is closed-onreceivechannelstatechange")
  }
};

let createOffer = async () => {
   createPeerConnection();
  let offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("offerSentToRemote", {
    username: username,
    remoteUser: remoteUser,
    offer: peerConnection.localDescription,
  });
};

let createAnswer = async (data) => {
  remoteUser = data.username;

  createPeerConnection();
  await peerConnection.setRemoteDescription(data.offer);
  let answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit("answerSentToUser1", {
    answer: answer,
    sender: data.remoteUser,
    receiver: data.username,
  });
};

socket.on("ReceiveOffer", function (data) {
  createAnswer(data);
});

let addAnswer = async (data) => {
  if (!peerConnection.currentRemoteDescription) {
    peerConnection.setRemoteDescription(data.answer);
  }
  document.querySelector(".next-chat").style.pointerEvents = "auto";
   axios.put(`http://localhost:3000/update/${username}`)
  

};

socket.on("ReceiveAnswer", function (data) {
  addAnswer(data);
});

socket.on("candidateReceiver", function (data) {
  peerConnection.addIceCandidate(data.iceCandidateData);
});

socket.on("closedremoteuser",async (data)=>{
  remoteUser=data.username
  await axios.put(`http://localhost:3000/updateonnext/${username}`,)

       fetchnextuser(remoteUser)
})

msgsendbtn.addEventListener("click",()=>{
  let msgdata=msginput.value
  chattextarea.innerHTML +="<div style='margin-top:2px; margin-bottom:2px;'><b>Me:</b>"+msgdata+"</div>";
  if(sendchannel){
    onsendchannelstatechange()
    sendchannel.send(msgdata)
  }
  else{
    receivechannel.send(msgdata)
  }
})

window.addEventListener("unload",async ()=>{
  
 await axios.put(`http://localhost:3000/leavinguser/${username}`)
  
})

async function closeConnection(){
       await peerConnection.close()
       await socket.emit("remoteuserclosed",{
        username,remoteUser
       })
       await axios.put(`http://localhost:3000/updateonnext/${username}`,)

       fetchnextuser(remoteUser)
}

async function fetchnextuser(remoteUser){
  const {data}=await axios.post("http://localhost:3000/getnextuser",{
    username,remoteUser
  })
  if(data[0]){
      if(data[0]._id==remoteUser || data[0]._id==username){
               
      }else{remoteUser=data[0]._id}
    
    createOffer();
  
}
  }

document.querySelector(".next-chat").onClick=function (){
  document.querySelector(".chat-text-area").innerHTML="";
  if(peerConnection.connectionState==="connected" || peerConnection.iceCandidateState==="connected"){
    closeConnection();
    console.log("user closed")
  }else{
    fetchnextuser(remoteUser)
    console.log("moving to next user")
  }
  
}