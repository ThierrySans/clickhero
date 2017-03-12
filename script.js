(function(){
    "use strict";

    // player constructor
    var Player = function(data){
        this.username = data.username;
        this.x = data.x;
        this.y = data.y;
        this.role = data.role;
        this.dx = 4;
        this.dy = 4;
    }
    
    var canvas=document.getElementById("game_board");
    var ctx = canvas.getContext("2d");
    var p1 = new Player({'username':"p1", 'x':100, 'y':100, 'role':"run"});
    var p2 = new Player({'username':"p2", 'x':700, 'y':400, 'role':"catch"});
    p2.dx = 5;
    p2.dy = 5;
    var playerWidth = 30;

    // hit wall
    /*var ballRadius = 10;
    var x = canvas.width/2;
    var y = canvas.height-30;
    var dx = 0.5;
    var dy = -0.5;
    var dx2 = 0.8;
    var dy2 = -0.8;
    var x2 = 100;
    var y2 = 100;
    var hit = 0;
    var hit2 = 0;
    var color1 = "#"+((1<<24)*Math.random()|0).toString(16);
    var color2 = "#"+((1<<24)*Math.random()|0).toString(16);

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI*2);
        if (hit == 1) {
            color1 = "#"+((1<<24)*Math.random()|0).toString(16);
            ctx.fillStyle = color1;
            hit = 0;
        } else {
            ctx.fillStyle = color1;
        }
        ctx.fill();
        ctx.closePath();
    }

    function drawBall2() {
        ctx.beginPath();
        ctx.arc(x2, y2, ballRadius, 0, Math.PI*2);
        if (hit2 == 1) {
            color2 = "#"+((1<<24)*Math.random()|0).toString(16);
            ctx.fillStyle = color2;
            hit2 = 0;
        } else {
            ctx.fillStyle = color2;
        }
        ctx.fill();
        ctx.closePath();
    }


    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBall();
        drawBall2();
        
        if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) {
            dx = -dx;
            hit = 1;
        } else if(y + dy > canvas.height-ballRadius || y + dy < ballRadius) {
            dy = -dy;
            hit = 1;
        } else if(x2 + dx2 > canvas.width-ballRadius || x2 + dx2 < ballRadius) {
            dx2 = -dx2;
            hit2 = 1;
        } else if(y2 + dy2 > canvas.height-ballRadius || y2 + dy2 < ballRadius) {
            dy2 = -dy2;
            hit2 = 1;
        }
        
        x += dx;
        y += dy;
        x2 +=dx2;
        y2 += dy2;
    }

    setInterval(draw, 10);*/

    // follow cursor
    /*var targetX = 0,
    targetY = 0,
    x = 10,
    y = 10,
    velX = 0,
    velY = 0,
    speed = 4;

    function update(){
        var tx = targetX - x,
            ty = targetY - y,
            dist = Math.sqrt(tx*tx+ty*ty),
            rad = Math.atan2(ty,tx),
            angle = rad/Math.PI * 180;

        velX = (tx/dist)*speed;
        velY = (ty/dist)*speed;
        
        if (targetX > x + velX && velX >= 0) {
            x += velX;
        } else if (targetX < x + velX && velX >= 0) {
            x = targetX;
        } else if (targetX < x + velX && velX < 0) {
            x += velX;
        } else if (targetX > x + velX && velX < 0) {
            x = targetX;
        }

        if (targetY > y + velY) {
            y += velY;
        } else if (targetY < y + velY && velY >= 0) {
            y = targetY;
        } else if (targetY < y + velY && velY < 0) {
            y += velY;
        } else if (targetY > y + velY && velY < 0) {
            y = targetY;
        }

        ctx.clearRect(0,0,800,500);
        ctx.beginPath();
        ctx.arc(x,y,20,0,Math.PI*2);
        ctx.fillStyle = "#0095DD";
        ctx.fill();
        ctx.closePath();

        setTimeout(update,10);
    }

    update();

    canvas.addEventListener("mousemove", function(e){
        targetX = e.clientX - canvas.offsetLeft;
        targetY = e.clientY - canvas.offsetTop;
    });*/

    //  pick color
    /*var mouseX, mouseY;
    var grd = ctx.createLinearGradient(0,0,200,0);
    var mycolor;
    grd.addColorStop(0,"red");
    grd.addColorStop(1,"white");

    // Fill with gradient
    ctx.fillStyle = grd;
    ctx.fillRect(10,10,150,80);

    ctx.fillStyle = "#0095DD";
    ctx.fillRect(90,190,150,80);

    ctx.fillStyle = "#000000";
    ctx.fillRect(100,70,150,80);

    ctx.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);
    ctx.fillRect(560,70,150,80);

    ctx.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);
    ctx.fillRect(420,300,150,80);


    function update(){
        console.log(mouseX, mouseY);
        mycolor = ctx.getImageData(mouseX,mouseY,1,1);
        console.log("color", mycolor);

        ctx.clearRect(500,500,800,500);
        ctx.beginPath();
        ctx.arc(700,400,20,0,Math.PI*2);
        ctx.fillStyle = mycolor;
        ctx.fill();

    }

    setInterval(update, 1000);

    canvas.addEventListener("mousemove", function(e){
    mouseX = e.clientX - canvas.offsetLeft;
    mouseY = e.clientY - canvas.offsetTop;
    });*/


    // keyboard move ball
    var color1 = "#"+((1<<24)*Math.random()|0).toString(16);
    var color2 = "#"+((1<<24)*Math.random()|0).toString(16);
    var p1Left = false, p1Right = false, p1Up = false, p1Down = false;
    var p2Left = false, p2Right = false, p2Up = false, p2Down = false;

    function drawPlayer(p) {
        if (p.role == "catch") {
            ctx.fillStyle = color1;
        } else {
            ctx.fillStyle = color2;
        }
        ctx.fillRect(p.x, p.y, playerWidth, playerWidth);
    }

    function movePlayers() {
        /* Up arrow was pressed */
        if (p1Up && p1.y - p1.dy > 0) {
            p1.y -= p1.dy;
        } else if (p1Up && p1.y - p1.dy <= 0) {
            p1.y = 0;
        }
        /* Down arrow was pressed */
        else if (p1Down && p1.y + p1.dy + playerWidth < canvas.height) {
            p1.y += p1.dy;
        } else if (p1Down && p1.y + p1.dy + playerWidth >= canvas.height) {
            p1.y = canvas.height - playerWidth;
        }
        /* Left arrow was pressed */
        else if (p1Left && p1.x - p1.dx > 0) {
            p1.x -= p1.dx;
        } else if (p1Left && p1.x - p1.dx <= 0) {
            p1.x = 0;
        }
        /* Right arrow was pressed */
        else if (p1Right && p1.x + p1.dx + playerWidth < canvas.width){
            p1.x += p1.dx;
        } else if (p1Right && p1.x + p1.dx + playerWidth >= canvas.width) {
            p1.x = canvas.width - playerWidth;
        }

        /* Up arrow(w) was pressed */
        if (p2Up && p2.y - p2.dy > 0){
            p2.y -= p2.dy;
        } else if (p2Up && p2.y - p2.dy <= 0) {
            p2.y = 0;
        }
        /* Down arrow(s) was pressed */
        else if (p2Down && p2.y + p2.dy + playerWidth < canvas.height){
            p2.y += p2.dy;
        } else if (p2Down && p2.y + p2.dy + playerWidth >= canvas.height) {
            p2.y = canvas.height - playerWidth;
        }
        /* Left arrow(a) was pressed */
        else if (p2Left && p2.x - p2.dx > 0){
            p2.x -= p2.dx;
        } else if (p2Left && p2.x - p2.dx <= 0) {
            p2.x = 0;
        }
        /* Right arrow(d) was pressed */
        else if (p2Right && p2.x + p2.dx + playerWidth < canvas.width){
            p2.x += p2.dx;
        } else if (p2Right && p2.x + p2.dx + playerWidth >= canvas.width) {
            p2.x = canvas.width - playerWidth;
        }
    }

    function keyUpHandler(e){
        if (e.keyCode == 87){
            p1Up = false;
        }
        else if (e.keyCode == 83){
            p1Down = false;
        }
        else if (e.keyCode == 65){
            p1Left = false;
        }
        else if (e.keyCode == 68){
            p1Right = false;
        }
    }

        function keyDownHandler(e){
        /* Up arrow was pressed */
        if (e.keyCode == 87){
            p1Up = true;
        }
        /* Down arrow(s) was pressed */
        else if (e.keyCode == 83){
            p1Down = true;
        }
        /* Left arrow(a) was pressed */
        else if (e.keyCode == 65){
            p1Left = true;
        }
        /* Right arrow(d) was pressed */
        else if (e.keyCode == 68){
            p1Right = true;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        movePlayers();
        drawPlayer(p1);
        drawPlayer(p2);
        requestAnimationFrame(draw);
    }

    draw();

    document.addEventListener('keydown', keyDownHandler, true);
    document.addEventListener("keyup", keyUpHandler, false);
    //document.addEventListener('keydown',doP2KeyDown,true);
    
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


    var connectedPeers = {}; 
    // Show this peer's ID.
    peer.on('open', function(id){
      $('#pid').text(id);
    });
    // Await connections from others
    peer.on('connection', connect);
    peer.on('error', function(err) {
      console.log(err);
    })
    // Handle a connection object.
    function connect(c) {
        var chatbox = $('<div></div>').addClass('connection').addClass('active').attr('id', c.peer);
    var header = $('<h1></h1>').html('Chat with <strong>' + c.peer + '</strong>');
    var messages = $('<div><em>Peer connected.</em></div>').addClass('messages');
    chatbox.append(header);
    chatbox.append(messages);

      // Handle a chat connection.
        c.on('data', function(data) {
            console.log(data);
            if (data == "W"){
                p2Up = true;
                console.log("hi!");
            }
            /* Down arrow was pressed */
            else if (data == "S"){
                p2Down = true;
            }
            /* Left arrow was pressed */
            else if (data == "A"){
                p2Left = true;
            }
            /* Right arrow was pressed */
            else if (data == "D"){
                p2Right = true;
            }
            else if (data == "w"){
                p2Up = false;
            }
            /* Down arrow was pressed */
            else if (data == "s"){
                p2Down = false;
            }
            /* Left arrow was pressed */
            else if (data == "a"){
                p2Left = false;
            }
            /* Right arrow was pressed */
            else if (data == "d"){
                p2Right = false;
            }
        });
            c.on('close', function() {
              alert(c.peer + ' has left the chat.');
              if ($('.connection').length === 0) {
                $('.filler').show();
              }
              delete connectedPeers[c.peer];
            });
      connectedPeers[c.peer] = 1;
    }
    $(document).ready(function() {
      function doNothing(e){
        e.preventDefault();
        e.stopPropagation();
    }
  $('#connect').click(function() {
    var requestedPeer = $('#rid').val();
        if (!connectedPeers[requestedPeer]) {
          // Create 2 connections, one labelled chat and another labelled file.
          var c = peer.connect(requestedPeer, {
            serialization: 'none',
            metadata: {message: 'hi i want to chat with you!'}
          });
          c.on('open', function() {
            connect(c);
          });
          c.on('error', function(err) { alert(err); });
        }
  });
  $(document).keydown(function(e) {
        var msg;
            if(e.which == 65) {
             msg = "A";             
            }
            else if(e.which == 68) {
             msg = "D";             
            }
            else if(e.which == 83) {
             msg = "S";             
            }
            else if (e.which == 87) {
             msg = "W";
            }
            console.log(msg);
            // For each active connection, send the message.
            eachActiveConnection(function(c, $c) {
              c.send(msg);
            });
      });
   $(document).keyup(function(e) {
        var msg;
            if(e.which == 65) {
             msg = "a";             
            }
            else if(e.which == 68) {
             msg = "d";             
            }
            else if(e.which == 83) {
             msg = "s";             
            }
            else if (e.which == 87) {
             msg = "w";             
            }
            // For each active connection, send the message.
            console.log(msg);
            eachActiveConnection(function(c, $c) {
              console.log(msg);
              c.send(msg);
            });
      });            
  // Connect to a peer 
  // $('#connect').click(function() {
  //   var requestedPeer = $('#rid').val();
  //   if (!connectedPeers[requestedPeer]) {
  //     // Create 2 connections, one labelled chat and another labelled file.
  //     var c = peer.connect(requestedPeer, {
  //       label: 'chat',
  //       serialization: 'none',
  //       metadata: {message: 'hi i want to chat with you!'}
  //     });
  //     c.on('open', function() {
  //       connect(c);
  //     });
  //     c.on('error', function(err) { alert(err); });
  //     var f = peer.connect(requestedPeer, { label: 'file', reliable: true });
  //     f.on('open', function() {
  //       connect(f);
  //     });
  //     f.on('error', function(err) { alert(err); });
  //   }
  //   connectedPeers[requestedPeer] = 1;
  // });
  function eachActiveConnection(fn) {
      var peerId = $(this).attr('id');
      var actives = $('.active');
      console.log(peerId);
      actives.each(function() {
        var conns = peer.connections[peerId];
        var conn = conns[0];
        fn(conn0, $(this));
    });
  }
  // Close a connection.
  $('#close').click(function() {
    eachActiveConnection(function(c) {
      c.close();
    });
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
}());