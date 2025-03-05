const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const startCallButton = document.getElementById("startCall");
const muteAudioButton = document.getElementById("muteAudio");
const stopVideoButton = document.getElementById("stopVideo");
const shareScreenButton = document.getElementById("shareScreen");
const messageInput = document.getElementById("messageInput");
const sendMessageButton = document.getElementById("sendMessage");
const messagesDiv = document.getElementById("messages");

let localStream;
let peerConnection;
const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

// Step 1: Get User Media (Camera & Mic)
async function startMedia() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;
    } catch (error) {
        console.error("Error accessing media devices.", error);
    }
}

// Step 2: Create Peer Connection
function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);

    // Send local stream to the peer
    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    // Receive remote stream
    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    // ICE Candidate Exchange
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            console.log("New ICE candidate:", event.candidate);
            // Send ICE candidate to the remote peer (Needs signaling server)
        }
    };
}

// Step 3: Start Call
startCallButton.addEventListener("click", async () => {
    createPeerConnection();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    
    console.log("Offer created:", offer);
    // Send offer to the remote peer (Needs signaling server)
});

// Step 4: Mute/Unmute Audio
muteAudioButton.addEventListener("click", () => {
    localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled;
    muteAudioButton.textContent = localStream.getAudioTracks()[0].enabled ? "Mute Audio" : "Unmute Audio";
});

// Step 5: Start/Stop Video
stopVideoButton.addEventListener("click", () => {
    localStream.getVideoTracks()[0].enabled = !localStream.getVideoTracks()[0].enabled;
    stopVideoButton.textContent = localStream.getVideoTracks()[0].enabled ? "Stop Video" : "Start Video";
});

// Step 6: Screen Sharing
shareScreenButton.addEventListener("click", async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    localVideo.srcObject = screenStream;
    const screenTrack = screenStream.getVideoTracks()[0];

    peerConnection.getSenders().forEach(sender => {
        if (sender.track.kind === "video") {
            sender.replaceTrack(screenTrack);
        }
    });

    screenTrack.onended = () => {
        localVideo.srcObject = localStream;
        peerConnection.getSenders().forEach(sender => {
            if (sender.track.kind === "video") {
                sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
        });
    };
});

// Step 7: Simple Chat Feature (Local Messages)
sendMessageButton.addEventListener("click", () => {
    const message = messageInput.value;
    if (message.trim()) {
        messagesDiv.innerHTML += `<p><b>You:</b> ${message}</p>`;
        messageInput.value = "";
    }
});

// Start Media on Page Load
startMedia();
