var peer = new Peer({
  // Set API key for cloud server (you don't need this if you're running your
  // own.
  key: 'x7fwx2kavpy6tj4i',
  // Set highest debug level (log everything!).
  debug: 3,
  // Set a logging function:
  logFunction: function() {
    var copy = Array.prototype.slice.call(arguments).join(' ');
    $('.log').append(copy + '<br>');
        }
    });
    var currID;
    var requestedPeer;
    var currCon;
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
      console.log(err);
    });
    // Handle a connection object.
    function connect(c) {
      // Handle a chat connection.
      console.log("connected");
        requestedPeer = c.peer;
        c.on('data', function(data) {  
        console.log(c.label); 
            if (c.label === "init"){
              document.dispatchEvent(new CustomEvent('gameStarted',{"detail": data}));
            }
            else if (c.label === "initsync"){
                document.dispatchEvent(new CustomEvent('otherSideInited',{"detail": data}));
            }
            else if (c.label === "move"){
                console.log("move");
                console.log(data);
                document.dispatchEvent(new CustomEvent('otherPlayerMoved',{"detail": data}));
            }
            else if (c.label === "power"){
                console.log("move");
                console.log(data);
                document.dispatchEvent(new CustomEvent('otherSidePowerUp',{"detail": data}));
            }
            });
          c.on('close', function() {
              alert(c.peer + ' has left the chat.');
            });
    }
    $(document).ready(function() {
      function doNothing(e){
        e.preventDefault();
        e.stopPropagation();
        }
    $("#connect").click(function() {
       console.log("click");
        var requestedPeer = $("#rid").val();
        console.log(requestedPeer);
        var c = peer.connect(requestedPeer, {
            label: 'init',
            serialization: 'json',
            metadata: {message: 'hi i want to chat with you!'}
          });
          c.on('open', function() {
            console.log("open");
              c.send({"username":"Jerry", "pid":"p1"});
          }); 
          c.on('error', function(err) { alert(err); });

    });
    document.addEventListener("onStart", function(e) {
        var requestedPeer = e.detail.friendId;
        console.log(requestedPeer);
        var c = peer.connect(requestedPeer, {
            label: 'init',
            serialization: 'json',
            metadata: {message: 'hi i want to chat with you!'}
          });
          c.on('open', function() {
            console.log("open");
            c.send({"username":e.detail.myname, "pid":"p1"});
          }); 
          c.on('error', function(err) { alert(err); });
    });
    // document.addEventListener("onPlayerMove", function(e) {
    //     var data = e.detail;
    //     var peerId = $("pid").text();
    //     console.log(data);
    //     var conns = peer.connections[peerId]
    //     var c = conns[0]
    //         // For each active connection, send the message.
    //     c.send(data); 
    //   });

      document.addEventListener("initDone", function(e) {
        var c = peer.connect(requestedPeer, {
            label: 'initsync',
            serialization: 'json',
            metadata: {message: 'hi i want to chat with you!'}
          });
          c.on('open', function() {
              c.send(e.detail);
          }); 
          c.on('error', function(err) { alert(err); });

        var cmove = peer.connect(requestedPeer, {
          label: 'move',
          serialization: 'json',
          metadata: {message: 'hi i want to chat with you!'}
        });
        cmove.on('open', function() {
             connect(cmove);
        }); 
        cmove.on('error', function(err) { alert(err); });

        var cp = peer.connect(requestedPeer, {
            label: 'power',
            serialization: 'json',
            metadata: {message: 'hi i want to chat with you!'}
          });
          cp.on('open', function() {
              connect(cp)
          }); 
          cp.on('error', function(err) { alert(err); });

          });
      
      // document.addEventListener("createMove", function(e) {
      //   var cmove = peer.connect(requestedPeer, {
      //     label: 'move',
      //     serialization: 'json',
      //     metadata: {message: 'hi i want to chat with you!'}
      //   });
      //   cmove.on('open', function() {
      //        connect(cmove);
      //   }); 
      //   cmove.on('error', function(err) { alert(err); });
      // });

      document.addEventListener("playerMoved", function(e) {
          var conns = peer.connections[requestedPeer];
          var c = conns[2];
          var data = e.detail;
            c.send(data);
            c.on('error', function(err) { alert(err); });
          });

      document.addEventListener("powerUpTaken", function(e) {
          var conns = peer.connections[requestedPeer];
          var c = conns[3];
          var data = e.detail;
            c.send(data);
            c.on('error', function(err) { alert(err); });
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
