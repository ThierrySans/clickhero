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
    
    var canvas=document.getElementById("game_board");
    canvas.setAttribute('width', '800px');
    canvas.setAttribute('height', '500px');
    var ctx = canvas.getContext("2d");
    var p1 = new Player({'username':"p1", 'id':"p1", 'x':10, 'y':10, 'role':"run"});
    var p2 = new Player({'username':"p2", 'id':"p2", 'x':720, 'y':460, 'role':"catch"});
    p2.dx = 5;
    p2.dy = 5;
    var playerWidth = 30;

    var powerX, powerY;
    var itemWidth = 10;

    var mapColor = "#dcdcdc";

    // keyboard move ball
    var color1 = "red";
    var color2 = "orange";
    var p1Left = false, p1Right = false, p1Up = false, p1Down = false;
    var p2Left = false, p2Right = false, p2Up = false, p2Down = false;

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

    function detectCollision(x1,y1,x2,y2,width,height) {
        return (x1 >= x2 && x1 <= x2 + width && y1 >= y2 && y1 <= y2 + width);
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
        ctx.fillRect(780,420,100,100);
    }

    function switchRole() {
        if (p1.role == "catch") {
            p1.role = "run";
            p1.dx = 4;
            p1.dy = 4;
        } else {
            p1.role = "catch";
            p1.dx = 5;
            p1.dy = 5;
        }

        if (p2.role == "catch") {
            p2.role = "run";
            p2.dx = 4;
            p2.dy = 4;
        } else {
            p2.role = "catch";
            p2.dx = 5;
            p2.dy = 5;
        }
    }

    function makePowerUp() {
        var valid = false;
        while (!valid) {
            powerX = parseInt((canvas.width - itemWidth)*Math.random());
            powerY = parseInt((canvas.height - itemWidth)*Math.random());
            if ((powerX > 2 && powerY > 2 && powerX < canvas.width - 2 && powerY < canvas.height - 2) &&
                !detectCollision(powerX, powerY, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(powerX, powerY + itemWidth, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY + itemWidth, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(powerX, powerY, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectCollision(powerX, powerY + itemWidth, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectCollision(powerX + itemWidth, powerY + itemWidth, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectWall(powerX - 2, powerY - 2, itemWidth + 2, itemWidth + 2)) {
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
        }
    }

    function detectCatch() {
        var cover = (detectCollision(p1.x, p1.y, p2.x, p2.y, playerWidth, playerWidth) ||
                detectCollision(p1.x + playerWidth, p1.y, p2.x, p2.y, playerWidth, playerWidth) ||
                detectCollision(p1.x, p1.y + playerWidth, p2.x, p2.y, playerWidth, playerWidth) ||
                detectCollision(p1.x + playerWidth, p1.y + playerWidth, p2.x, p2.y, playerWidth, playerWidth));
        if (cover) {
            if (p1.role == "catch") {
                console.log("p1 win");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "80px Arial";
                ctx.fillText("P1 WIN!!!",200,100);
            } else {
                console.log("p2 win");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = "80px Arial";
                ctx.fillStyle = "black";
                ctx.fillText("P2 WIN!!!",200,100);
            }
        }
        return cover;
    }

    function movePlayers() {
        if (p1Up) {
            var d = wallDistance("up",p1);
            console.log(d);
            if (d > 0) {
                d -= 1;
                p1.y -= d;
            } else {
                if (p1.y - p1.dy > 0) {
                    p1.y -= p1.dy;
                } else {
                    p1.y = 1;
                }
            }
        } else if (p1Down) {
            var d = wallDistance("down",p1);
            if (d > 0) {
                d -= 1;
                p1.y += d;
            } else {
                if (p1.y + p1.dy + playerWidth < canvas.height) {
                    p1.y += p1.dy;
                } else {
                    p1.y = canvas.height - playerWidth - 1;
                }
            }
        } else if (p1Left) {
            var d = wallDistance("left",p1);
            if (d > 0) {
                d -= 1;
                p1.x -= d;
            } else {
                if (p1.x - p1.dx > 0) {
                    p1.x -= p1.dx;
                } else {
                    p1.x = 1;
                }
            }
        } else if (p1Right) {
            var d = wallDistance("right",p1);
            if (d > 0) {
                d -= 1;
                p1.x += d;
            } else {
                if (p1.x + p1.dx + playerWidth < canvas.width) {
                    p1.x += p1.dx;
                } else {
                    p1.x = canvas.width - playerWidth - 1;
                }
            }
        }
/*
        // Up arrow was pressed
        if (p1Up && p1.y - p1.dy > 0) {
            p1.y -= p1.dy;
        } else if (p1Up && p1.y - p1.dy <= 0) {
            p1.y = 0;
        }
        // Down arrow was pressed
        else if (p1Down && p1.y + p1.dy + playerWidth < canvas.height) {
            p1.y += p1.dy;
        } else if (p1Down && p1.y + p1.dy + playerWidth >= canvas.height) {
            p1.y = canvas.height - playerWidth;
        }
        // Left arrow was pressed
        else if (p1Left && p1.x - p1.dx > 0) {
            p1.x -= p1.dx;
        } else if (p1Left && p1.x - p1.dx <= 0) {
            p1.x = 0;
        }
        // Right arrow was pressed
        else if (p1Right && p1.x + p1.dx + playerWidth < canvas.width){
            p1.x += p1.dx;
        } else if (p1Right && p1.x + p1.dx + playerWidth >= canvas.width) {
            p1.x = canvas.width - playerWidth;
        }

        // Up arrow(w) was pressed
        if (p2Up && p2.y - p2.dy > 0){
            p2.y -= p2.dy;
        } else if (p2Up && p2.y - p2.dy <= 0) {
            p2.y = 0;
        }
        // Down arrow(s) was pressed
        else if (p2Down && p2.y + p2.dy + playerWidth < canvas.height){
            p2.y += p2.dy;
        } else if (p2Down && p2.y + p2.dy + playerWidth >= canvas.height) {
            p2.y = canvas.height - playerWidth;
        }
        // Left arrow(a) was pressed 
        else if (p2Left && p2.x - p2.dx > 0){
            p2.x -= p2.dx;
        } else if (p2Left && p2.x - p2.dx <= 0) {
            p2.x = 0;
        }
        // Right arrow(d) was pressed
        else if (p2Right && p2.x + p2.dx + playerWidth < canvas.width){
            p2.x += p2.dx;
        } else if (p2Right && p2.x + p2.dx + playerWidth >= canvas.width) {
            p2.x = canvas.width - playerWidth;
        }*/

        if (p2Up) {
            var d = wallDistance("up",p2);
            console.log(d);
            if (d > 0) {
                d -= 1;
                p2.y -= d;
            } else {
                if (p2.y - p2.dy > 0) {
                    p2.y -= p2.dy;
                } else {
                    p2.y = 1;
                }
            }
        } else if (p2Down) {
            var d = wallDistance("down",p2);
            console.log(d);
            if (d > 0) {
                d -= 1;
                p2.y += d;
            } else {
                if (p2.y + p2.dy + playerWidth < canvas.height) {
                    p2.y += p2.dy;
                } else {
                    p2.y = canvas.height - playerWidth - 1;
                }
            }
        } else if (p2Left) {
            var d = wallDistance("left",p2);
            if (d > 0) {
                d -= 1;
                p2.x -= d;
            } else {
                if (p2.x - p2.dx > 0) {
                    p2.x -= p2.dx;
                } else {
                    p2.x = 1;
                }
            }
        } else if (p2Right) {
            var d = wallDistance("right",p2);
            if (d > 0) {
                d -= 1;
                p2.x += d;
            } else {
                if (p2.x + p2.dx + playerWidth < canvas.width) {
                    p2.x += p2.dx;
                } else {
                    p2.x = canvas.width - playerWidth - 1;
                }
            }
        }
    }

    function keyUpHandler(e){
        if (e.keyCode == 38){
            p1Up = false;
        }
        else if (e.keyCode == 40){
            p1Down = false;
        }
        else if (e.keyCode == 37){
            p1Left = false;
        }
        else if (e.keyCode == 39){
            p1Right = false;
        }

        if (e.keyCode == 87){
            p2Up = false;
        }
        else if (e.keyCode == 83){
            p2Down = false;
        }
        else if (e.keyCode == 65){
            p2Left = false;
        }
        else if (e.keyCode == 68){
            p2Right = false;
        }
    }

    function keyDownHandler(e){
        /* Up arrow was pressed */
        if (e.keyCode == 38){
            p1Up = true;
        }
        /* Down arrow was pressed */
        else if (e.keyCode == 40){
            p1Down = true;
        }
        /* Left arrow was pressed */
        else if (e.keyCode == 37){
            p1Left = true;
        }
        /* Right arrow was pressed */
        else if (e.keyCode == 39){
            p1Right = true;
        }

        /* Up arrow(w) was pressed */
        if (e.keyCode == 87){
            p2Up = true;
        }
        /* Down arrow(s) was pressed */
        else if (e.keyCode == 83){
            p2Down = true;
        }
        /* Left arrow(a) was pressed */
        else if (e.keyCode == 65){
            p2Left = true;
        }
        /* Right arrow(d) was pressed */
        else if (e.keyCode == 68){
            p2Right = true;
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap();
        movePlayers();
        if (detectCatch()){
            return;
        }
        detectPowerUp(p1);
        detectPowerUp(p2);
        drawItem();
        drawPlayer(p1);
        drawPlayer(p2);
        requestAnimationFrame(draw);
    }

    drawMap();
    makePowerUp();
    draw();

    document.addEventListener("keydown", keyDownHandler, true);
    document.addEventListener("keyup", keyUpHandler, false);

}());