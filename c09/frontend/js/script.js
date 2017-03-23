(function(){
    "use strict";

    // player constructor
    var Player = function(data){
        this.username = data.username;
        this.id = data.id;
        this.x = data.x;
        this.y = data.y;
        this.role = data.role;
        this.dx = defaultSp;
        this.dy = defaultSp;
    }

    /*var Game = function(data){
        this.powerX;
        this.powerY;
    }*/

    var canvas, ctx;

    var local, other;
    //var game = new Game();

    var playerWidth = 30;
    var defaultSp = 2;

    var powerX, powerY;
    var itemWidth = 10;

    var mapColor = "#dcdcdc";

    var color1 = "red";
    var color2 = "orange";
    var pLeft = false, pRight = false, pUp = false, pDown = false;

    function init(username, pid) {
        document.getElementById("game_map").style.display = "block";
        document.getElementById("game").innerHTML = "";
        canvas=document.getElementById("game_board");
        canvas.setAttribute('width', '800px');
        canvas.setAttribute('height', '500px');
        ctx = canvas.getContext("2d");
        model.getActiveUsername(function (err, currUser) {
            if (pid == "p1") {
                other = new Player({'username':username, 'id':"p1", 'x':10, 'y':10, 'role':"run"});
                local = new Player({'username':currUser, 'id':"p2", 'x':760, 'y':460, 'role':"catch"});
            } else if (pid == "p2") {
                local = new Player({'username':currUser, 'id':"p1", 'x':10, 'y':10, 'role':"run"});
                other = new Player({'username':username, 'id':"p2", 'x':760, 'y':460, 'role':"catch"});
            }
        });

        drawMap();
        makePowerUp();
        var data = {"p1":local, "p2":other, "powerX":powerX, "powerY":powerY};
        document.dispatchEvent(new CustomEvent("initDone", {'detail':data}));
        draw();
    }

    function initSync(dataP1,dataP2,dataX,dataY) {
        document.getElementById("game_map").style.display = "block";
        document.getElementById("game").innerHTML = "";
        canvas=document.getElementById("game_board");
        canvas.setAttribute('width', '800px');
        canvas.setAttribute('height', '500px');
        ctx = canvas.getContext("2d");
        model.getActiveUsername(function(err, currUser) {
        if (dataP1.username == currUser) {
            local = dataP1;
            other = dataP2;
        } else if (dataP2.username == currUser){
            local = dataP2;
            other = dataP1;
        }
        });
        powerX = dataX;
        powerY = dataY;
        draw();
    };

    function gameSync(dataP1,dataP2,dataX,dataY) {
        if (dataP1.username == local.username) {
            local = dataP1;
            other = dataP2;
        } else if (dataP2.username == local.username){
            local = dataP2;
            other = dataP1;
        }
        powerX = dataX;
        powerY = dataY;
    };

    function fillColorBit(c) {
        while (c.length < 6) {
            c = "0" + c;
        }
        return c;
    }

    function parseColor(color) {
        var s1 = ((color.data[0]<<16)|0);
        var s2 = ((color.data[1]<<8)|0);
        var s3 = ((color.data[2])|0);
        var s4 = ((s1 + s2 + s3)|0).toString(16);
        s4 = fillColorBit(s4);
        return "#" + s4;
    }

    // keyboard move ball
    function detectCollision(x1,y1,x2,y2,width,height) {
        return (x1 > x2 && x1 < x2 + width && y1 > y2 && y1 < y2 + width);
    }

    function detectWall(x,y,width,height) {
        var c1 = parseColor(ctx.getImageData(x,y,1,1));
        var c2 = parseColor(ctx.getImageData(x + width,y,1,1));
        var c3 = parseColor(ctx.getImageData(x,y + height,1,1));
        var c4 = parseColor(ctx.getImageData(x + width,y + height,1,1));
        console.log(c1,c2,c3,c4);
        console.log(c1 == mapColor || c2 == mapColor || c3 == mapColor || c4 == mapColor);
        return (c1 == mapColor || c2 == mapColor || c3 == mapColor || c4 == mapColor);

    }

    function wallDistance(dir, p) {
        var i;
        var dy = p.dy;
        var dx = p.dx;
        if (dir == "up") {
            for (i = 1; i <= dy; i++) {
                var c1 = parseColor(ctx.getImageData(p.x,p.y - i,1,1));
                var c2 = parseColor(ctx.getImageData(p.x + playerWidth,p.y - i,1,1));
                console.log(c1, c2);
                if (c1 == mapColor || c2 == mapColor) {
                    return i;
                }
            }
        } else if (dir == "down") {
            for (i = 1; i <= dy; i++) {
                var c1 = parseColor(ctx.getImageData(p.x,p.y + playerWidth + i,1,1));
                var c2 = parseColor(ctx.getImageData(p.x + playerWidth,p.y + playerWidth + i,1,1));
                if (c1 == mapColor || c2 == mapColor) {
                    return i;
                }
            }
        } else if (dir == "left") {
            for (i = 1; i <= dx; i++) {
                var c1 = parseColor(ctx.getImageData(p.x - i,p.y,1,1));
                var c2 = parseColor(ctx.getImageData(p.x - i,p.y + playerWidth,1,1));
                if (c1 == mapColor || c2 == mapColor) {
                    return i;
                }
            }
        } else if (dir == "right") {
            for (i = 1; i <= dx; i++) {
                var c1 = parseColor(ctx.getImageData(p.x + playerWidth + i,p.y,1,1));
                var c2 = parseColor(ctx.getImageData(p.x + playerWidth + i,p.y + playerWidth,1,1));
                if (c1 == mapColor || c2 == mapColor) {
                    return i;
                }  
            }
        }
        // wall not found
        return -1;
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

    function drawMap() {
        ctx.fillStyle = mapColor;
        ctx.fillRect(60,60,100,100);
        ctx.fillRect(60,240,100,100);
        ctx.fillRect(60,420,100,100);
        ctx.fillRect(240,0,100,100);
        ctx.fillRect(240,180,100,100);
        ctx.fillRect(240,360,100,100);
        ctx.fillRect(420,60,100,100);
        ctx.fillRect(420,240,100,100);
        ctx.fillRect(420,420,100,100);
        ctx.fillRect(600,0,100,100);
        ctx.fillRect(600,180,100,100);
        ctx.fillRect(600,360,100,100);
        ctx.fillRect(780,60,100,100);
        ctx.fillRect(780,240,100,100);
    }

    function switchRole() {
        if (local.role == "catch") {
            local.role = "run";
            local.dx = defaultSp;
            local.dy = defaultSp;
        } else {
            local.role = "catch";
            local.dx = defaultSp;
            local.dy = defaultSp;
        }

        if (other.role == "catch") {
            other.role = "run";
            other.dx = defaultSp;
            other.dy = defaultSp;
        } else {
            other.role = "catch";
            other.dx = defaultSp;
            other.dy = defaultSp;
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
                !detectCollision(powerX + itemWidth, powerY + itemWidth, other.x, other.y, playerWidth, playerWidth) &&
                !detectWall(powerX, powerY, itemWidth, itemWidth)) {
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
            var data = {"p1":local, "p2":other, "powerX":powerX, "powerY":powerY};
            document.dispatchEvent(new CustomEvent("powerUpTaken", {'detail':data}));
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
                ctx.fillStyle = "red";
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
        /*// Up arrow was pressed
        if (pUp && local.y - local.dy > 0) {
            local.y -= local.dy;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pUp && local.y - local.dy <= 0) {
            local.y = 0;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        }
        // Down arrow was pressed
        else if (pDown && local.y + local.dy + playerWidth < canvas.height) {
            local.y += local.dy;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pDown && local.y + local.dy + playerWidth >= canvas.height) {
            local.y = canvas.height - playerWidth;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        }
        // Left arrow was pressed
        else if (pLeft && local.x - local.dx > 0) {
            local.x -= local.dx;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pLeft && local.x - local.dx <= 0) {
            local.x = 0;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        }
        // Right arrow was pressed
        else if (pRight && local.x + local.dx + playerWidth < canvas.width){
            local.x += local.dx;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pRight && local.x + local.dx + playerWidth >= canvas.width) {
            local.x = canvas.width - playerWidth;
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        }*/
        if (pUp) {
            var d = wallDistance("up",local);
            if (d > 0) {
                d -= 1;
                local.y -= d;
            } else {
                if (local.y - local.dy > 0) {
                    local.y -= local.dy;
                } else {
                    local.y = 0;
                }
            }
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pDown) {
            var d = wallDistance("down",local);
            if (d > 0) {
                d -= 1;
                local.y += d;
            } else {
                if (local.y + local.dy + playerWidth < canvas.height) {
                    local.y += local.dy;
                } else {
                    local.y = canvas.height - playerWidth;
                }
            }
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pLeft) {
            var d = wallDistance("left",local);
            if (d > 0) {
                d -= 1;
                local.x -= d;
            } else {
                if (local.x - local.dx > 0) {
                    local.x -= local.dx;
                } else {
                    local.x = 0;
                }
            }
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
        } else if (pRight) {
            var d = wallDistance("right",local);
            if (d > 0) {
                d -= 1;
                local.x += d;
            } else {
                if (local.x + local.dx + playerWidth < canvas.width) {
                    local.x += local.dx;
                } else {
                    local.x = canvas.width - playerWidth;
                }
            }
            document.dispatchEvent(new CustomEvent("playerMoved",{'detail':{'x':local.x,'y':local.y}}));
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
        drawMap();
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
        var data = e.detail;
        moveOtherPlayer(data.x, data.y);
    });
    document.addEventListener("otherSidePowerUp", function(e){
        var data = e.detail;
        gameSync(data.p1, data.p2, data.powerX, data.powerY);
    });
    document.addEventListener("gameStarted", function(e){
        var data = e.detail;
        init(data.username, data.pid);
    });
    document.addEventListener("otherSideInited", function(e){
        var data = e.detail;
        initSync(data.p1, data.p2, data.powerX, data.powerY);
    });

}(model));
