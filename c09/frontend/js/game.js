var peer = new Peer({
  host: "localhost",
  port: 9000,
  path: '/peerjs'
})
    var currID;
    var requestedPeer;
    var currCon;
    var other_player;
    // Show this peer's ID.
    peer.on('open', function(id){
      model.patchId(id, function(error, data){
      });
      console.log(id);
      currID = id;
    }); 
    // Await connections from others
    peer.on('connection', connect);
    peer.on('error', function(err) {
      $("#error").css("display","block");
      $("#error").text("Cannot connect to the other player.");
    });
    // Handle a connection object.
    function connect(c) {
      // Handle a chat connection.
      console.log("connected");
        requestedPeer = c.peer;
        c.on('data', function(data) {  
        console.log(data);
        $("#error").text('');
            if (data.label === "init"){
            	console.log(data);
              other_player = data.username;
              document.dispatchEvent(new CustomEvent('gameStarted',{"detail": data}));
            }
            else if (data.label === "initsync"){
                document.dispatchEvent(new CustomEvent('otherSideInited',{"detail": data}));
            }
            else if (data.label === "move"){
                console.log("move");
                console.log(data);
                document.dispatchEvent(new CustomEvent('otherPlayerMoved',{"detail": data}));
            }
            else if (data.label === "change"){
                console.log("change");
                document.dispatchEvent(new CustomEvent('otherSideChangedGame',{"detail": data}));
            }
            else if (data.label === "invite"){
                console.log("invite");
                other_player = data.myname;
                document.dispatchEvent(new CustomEvent('showInvite',{"detail": data}));
            }
            else if (data.label === "decline"){
              console.log(data);
                other_player = data.friendname;
                console.log("decline");
                document.dispatchEvent(new CustomEvent('closeConnection',{"detail": data}));
            }
            });
          c.on('close', function() {
              if (c.label == "decline"){
                  $("#error").css("display","block");
                  $("#error").text(other_player + ' reject your request.');
              }
              else if (c.label === "invite"){
                  $("#error").css("display","block");
                  $("#error").text(other_player + ' has disconnected from the game.');
              }
            });
    }
    $(document).ready(function() {
      function doNothing(e){
        e.preventDefault();
        e.stopPropagation();
        }

    document.addEventListener("onInvite", function(e) {
        var requestedPeer = e.detail.friendId;
        var data = e.detail;
        data.inviterId = currID;
        data.label = "invite";
        var c = peer.connect(requestedPeer, {
            label: 'invite',
            serialization: 'json',
            metadata: {message: 'hi i want to chat with you!'}
        });
          c.on('open', function() {
            connect(c);
            document.dispatchEvent(new CustomEvent('onConnected', {"detail": data}));
          }); 
          c.on('error', function(err) { $("#error").text(err); });
    });

    document.addEventListener("onConnected", function(e) {
          var conns = peer.connections[requestedPeer];
          for (i = 0; i < conns.length; i++) { 
              if (conns[i].peer === requestedPeer){
                 currCon = i;
              }
          }
          console.log(currCon);
          var con = conns[currCon];
          var data = e.detail;
          data.label = "invite";
          con.send(data);
    });

    document.addEventListener("inviteAccept", function(e) {
        // var requestedPeer = e.detail.inviterId;
        // var data = e.detail;
        // console.log(requestedPeer);
        // document.getElementById("invite").innerHTML = ``;
        // document.getElementById("invite").style = "display:none";
        // var c = peer.connect(requestedPeer, {
        //     label: 'init',
        //     serialization: 'json',
        //     metadata: {message: 'hi i want to chat with you!'}
        //   });
        //   c.on('open', function() {
        //     console.log("open");
        //     console.log(e.detail);
        //     c.send({"username":e.detail.friendname, "pid":"p1"});
        //   }); 
        //   c.on('error', function(err) { $("#error").text(err); });
          var requestedPeer = e.detail.inviterId;
          var conns = peer.connections[requestedPeer];
          for (i = 0; i < conns.length; i++) { 
                if (conns[i].peer === requestedPeer){
                   currCon = i;
              }
          }
          console.log(currCon);
          var c = conns[currCon];
            c.send({"username":e.detail.friendname, "mode":e.detail.mode, "label":"init"});
          c.on('error', function(err) { $("#error").text(err); });
    });

      document.addEventListener("initDone", function(e) {
        // var c = peer.connect(requestedPeer, {
        //     label: 'initsync',
        //     serialization: 'json',
        //     metadata: {message: 'hi i want to chat with you!'}
        //   });
        //   c.on('open', function() {

        //       c.send(e.detail);
        //   }); 
        //   c.on('error', function(err) { $("#error").text(err); });

        // var cmove = peer.connect(requestedPeer, {
        //   label: 'move',
        //   serialization: 'json',
        //   metadata: {message: 'hi i want to chat with you!'}
        // });
        // cmove.on('open', function() {
        //      connect(cmove);
        // }); 
        // cmove.on('error', function(err) { $("#error").text(err); });

        // var cp = peer.connect(requestedPeer, {
        //     label: 'power',
        //     serialization: 'json',
        //     metadata: {message: 'hi i want to chat with you!'}
        //   });
        //   cp.on('open', function() {
        //       connect(cp)
        //   }); 
        //   cp.on('error', function(err) { $("#error").text(err); });
          var conns = peer.connections[requestedPeer];
          var c = conns[currCon];
          var data = e.detail;
          data.label = "initsync";
            c.send(data);
            c.on('error', function(err) { $("#error").text(err); });
          });

      document.addEventListener("playerMoved", function(e) {
          var conns = peer.connections[requestedPeer];
          var c = conns[currCon];
          var data = e.detail;
          data.label = "move";
            c.send(data);
            c.on('error', function(err) { $("#error").text(err); });
          });
    
      document.addEventListener("gameChanged", function(e) {
          var conns = peer.connections[requestedPeer];
          var c = conns[currCon];
          var data = e.detail;
            data.label = "change";
            c.send(data);
            c.on('error', function(err) { $("#error").text(err); });
          });

     document.addEventListener("inviteDecline", function(e) {
          var conns = peer.connections[requestedPeer];
          for (i = 0; i < conns.length; i++) { 
                if (conns[i].peer === requestedPeer){
                   currCon = i;
              }
          }
          var c = conns[currCon];
          var data = e.detail;
            data.label = "decline";
            c.send(data);
            c.on('error', function(err) { $("#error").text(err); });
          });
      document.addEventListener("closeConnection", function(e) {
          var conns = peer.connections[requestedPeer];
          for (i = 0; i < conns.length; i++) { 
                if (conns[i].peer === requestedPeer){
                   currCon = i;
              }
          }
          var c = conns[currCon];
          c.label = "decline";
          conns.splice (-1, 1);
          c.close();
          });

  // Close a connection.
  $('#close').click(function() {
    var data = e.detail;
    var peerId = $("pid").text();
    console.log(data);
    var conns = peer.connections[peerId]
    var c = conns[0]
      c.close();
  });
  // Goes through each active peer and calls FN on its connections.
  // Show browser version
  $('#browsers').text(navigator.userAgent);
});
// Make sure things clean up properly.
window.onunload = window.onbeforeunload = function(e) {
  if (!!peer && !peer.destroyed) {
    peer.destroy();
  }
};
