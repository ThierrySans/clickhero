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

    // Show this peer's ID.
    peer.on('open', function(id){
      model.patchId(id);
      $('#pid').text(id);
    });
    // Await connections from others
    peer.on('connection', connect);
    peer.on('error', function(err) {
      console.log(err);
    })
    // Handle a connection object.
    function connect(c) {
      // Handle a chat connection.
        c.on('data', function(data) {
            console.log(data);
            if (data == "W"){
                document.dispatchEvent(new CustomEvent('moveUp',{
                    detail: $('#pid').text(id)
              }));
            }
            /* Down arrow was pressed */
            else if (data == "S"){
                document.dispatchEvent(new CustomEvent('moveDown',{
                    detail: $('#pid').text(id)
              }));
            }
            /* Left arrow was pressed */
            else if (data == "A"){
                document.dispatchEvent(new CustomEvent('moveLeft',{
                    detail: $('#pid').text(id)
              }));
            }
            /* Right arrow was pressed */
            else if (data == "D"){
                document.dispatchEvent(new CustomEvent('moveRight',{
                    detail: $('#pid').text(id)
              }));
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
    document.addEventListener("onStart", function(e) {
        var data = e.detail;
        var requestedPeer = data;
        var c = peer.connect(requestedPeer, {
            serialization: 'none',
            metadata: {message: 'hi i want to chat with you!'}
          });
          c.on('open', function() {
              document.dispatchEvent(new CustomEvent('onDrawMap',{
                detail: "hi"
              }));
          }); 
          c.on('error', function(err) { alert(err); });
    });
    document.addEventListener("onPlayerMove", function(e) {
        var data = e.detail;
        var peerId = $("pid").text();
        console.log(data);
        var conns = peer.connections[peerId]
        var c = conns[0]
            // For each active connection, send the message.
        c.send(data); 
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