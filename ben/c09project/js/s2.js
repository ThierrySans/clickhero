(function(){
    "use strict";

    // player constructor
    var Player = function(data){
        this.username = data.username;
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.role = data.role;
        this.dx = 4;
        this.dy = 4;
    }

    /*var Game = function(data){
        this.powerX;
        this.powerY;
    }*/

    var currUser = "LeiSurrre";
    var local, other;
    //var game = new Game();

    var playerWidth = 30;

    var powerX, powerY;
    var itemWidth = 10;

    var color1 = "red";
    var color2 = "orange";
    var pLeft = false, pRight = false, pUp = false, pDown = false;
    var p2Left = false, p2Right = false, p2Up = false, p2Down = false;

    function init(username, pid) {
        var canvas=document.getElementById("game_board");
        canvas.setAttribute('width', '800px');
        canvas.setAttribute('height', '500px');
        var ctx = canvas.getContext("2d");
        if (pid == "p1") {
            other = new Player({'username':username, 'id':"p1", 'x':100, 'y':100, 'role':"run"});
            local = new Player({'username':currUser, 'id':"p2", 'x':700, 'y':400, 'role':"catch"});
            local.dx = 5;
            local.dy = 5;
        } else if (pid == "p2") {
            local = new Player({'username':currUser, 'id':"p1", 'x':100, 'y':100, 'role':"run"});
            other = new Player({'username':username, 'id':"p2", 'x':700, 'y':400, 'role':"catch"});
            other.dx = 5;
            other.dy = 5;
        }
        makePowerUp();
        document.dispatchEvent(new CustomEvent("initDone",{"p1":local, "p2":other, "powerX":powerX, "powerY":powerY}));
        draw();
    }

    function initSync(dataP1,dataP2,dataX,dataY) {
        if (dataP1.username == currUser) {
            local = dataP1;
            other = dataP2;
        } else if {dataP2.username == currUser}{
            local = dataP2;
            other = dataP1;
        }
        powerX = dataX;
        powerY = dataY;
        draw();
    };

    function gameSync(dataP1,dataP2,dataX,dataY) {
        if (dataP1.username == currUser) {
            local = dataP1;
            other = dataP2;
        } else if {dataP2.username == currUser}{
            local = dataP2;
            other = dataP1;
        }
        powerX = dataX;
        powerY = dataY;
    };

    // keyboard move ball
    function detectCollision(x1,y1,x2,y2,width,height) {
        return (x1 > x2 && x1 < x2 + width && y1 > y2 && y1 < y2 + width);
    }

    function drawPlayer(p) {
        if (p.id == "p1") {
            ctx.fillStyle = color1;
        } else {
            ctx.fillStyle = color2;
        }
        ctx.fillRect(p.x, p.y, playerWidth, playerWidth);
    }

    function drawItem() {
        ctx.fillStyle = "blue";
        ctx.fillRect(powerX, powerY, itemWidth, itemWidth);
    }

    function switchRole() {
        if (local.role == "catch") {
            local.role = "run";
            local.dx = 4;
            local.dy = 4;
        } else {
            local.role = "catch";
            local.dx = 5;
            local.dy = 5;
        }

        if (other.role == "catch") {
            other.role = "run";
            other.dx = 4;
            other.dy = 4;
        } else {
            other.role = "catch";
            other.dx = 5;
            other.dy = 5;
        }
    }

    function makePowerUp() {
        var valid = false;
        while (!valid) {
            powerX = parseInt((canvas.width - itemWidth)*Math.random());
            powerY = parseInt((canvas.height - itemWidth)*Math.random());
            if (!detectCollision(powerX, powerY, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(powerX, powerY + itemWidth, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY + itemWidth, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(powerX, powerY, other.x, other.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY, other.x, other.y, playerWidth, playerWidth) &&
                !detectCollision(powerX, powerY + itemWidth, other.x, other.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY + itemWidth, other.x, other.y, playerWidth, playerWidth)) {
                valid = true;
            }
        }
    }

    function detectPowerUp(p) {
        var cover = (detectCollision(powerX, powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(powerX + itemWidth, powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(powerX, powerY + itemWidth, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(powerX + itemWidth, powerY + itemWidth, p.x, p.y, playerWidth, playerWidth));
        if (cover) {
            if (p.role == "catch") {
                p.dx ++;
                p.dy ++;
            } else if (p.role == "run"){
                switchRole();
            }
            makePowerUp();
            document.dispatchEvent(new CustomEvent("powerUpTaken", {"p1":local, "p2":other, "powerX":powerX, "powerY":powerY}));
        }
    }

    function detectCatch() {
        var cover = (detectCollision(local.x, local.y, other.x, other.y, playerWidth, playerWidth) ||
                detectCollision(local.x + playerWidth, local.y, other.x, other.y, playerWidth, playerWidth) ||
                detectCollision(local.x, local.y + playerWidth, other.x, other.y, playerWidth, playerWidth) ||
                detectCollision(local.x + playerWidth, local.y + playerWidth, other.x, other.y, playerWidth, playerWidth));
        if (cover) {
            if (local.role == "catch") {
                console.log("Local win");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "80px Arial";
                ctx.fillText("You WIN!!!",200,100);
            } else {
                console.log("Other win");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "80px Arial";
                ctx.fillStyle = "black";
                ctx.fillText("You LOSE...",200,100);
            }
        }
        return cover;
    }

    function moveLocalPlayer() {
        /* Up arrow was pressed */
        if (pUp && local.y - local.dy > 0) {
            local.y -= local.dy;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        } else if (pUp && local.y - local.dy <= 0) {
            local.y = 0;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        }
        /* Down arrow was pressed */
        else if (pDown && local.y + local.dy + playerWidth < canvas.height) {
            local.y += local.dy;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        } else if (pDown && local.y + local.dy + playerWidth >= canvas.height) {
            local.y = canvas.height - playerWidth;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        }
        /* Left arrow was pressed */
        else if (pLeft && local.x - local.dx > 0) {
            local.x -= local.dx;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        } else if (pLeft && local.x - local.dx <= 0) {
            local.x = 0;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        }
        /* Right arrow was pressed */
        else if (pRight && local.x + local.dx + playerWidth < canvas.width){
            local.x += local.dx;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        } else if (pRight && local.x + local.dx + playerWidth >= canvas.width) {
            local.x = canvas.width - playerWidth;
            document.dispatchEvent(new CustomEvent("playerMoved",{'x':local.x,'y':local.y}));
        }
    }

    function moveOtherPlayer(x,y) {
        other.x = x;
        other.y = y;
    }

    function keyUpHandler(e){
        if (e.keyCode == 38){
            pUp = false;
        }
        else if (e.keyCode == 40){
            pDown = false;
        }
        else if (e.keyCode == 37){
            pLeft = false;
        }
        else if (e.keyCode == 39){
            pRight = false;
        }
    }

    function keyDownHandler(e){
        /* Up arrow was pressed */
        if (e.keyCode == 38){
            pUp = true;
        }
        /* Down arrow was pressed */
        else if (e.keyCode == 40){
            pDown = true;
        }
        /* Left arrow was pressed */
        else if (e.keyCode == 37){
            pLeft = true;
        }
        /* Right arrow was pressed */
        else if (e.keyCode == 39){
            pRight = true;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        moveLocalPlayer();
        if (detectCatch()){
            return;
        }
        detectPowerUp(local);
        drawItem();
        drawPlayer(local);
        drawPlayer(other);
        requestAnimationFrame(draw);
    }

    document.addEventListener("keydown", keyDownHandler, true);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("otherPlayerMoved", function(e){
        moveOtherPlayer(e.x, e.y);
    });
    document.addEventListener("gameStarted", function(e){
        init(e.username, e.pid);
    });
    document.addEventListener("otherSideInited", function(e){
        sync(e.p1, e.p2, e.powerX, e.powerY);
    });

}());