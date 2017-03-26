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
        this.point = 0;
    }

    var canvas=document.getElementById("game_board");
    canvas.setAttribute('width', '800px');
    canvas.setAttribute('height', '500px');
    var ctx = canvas.getContext("2d");
    var p1;
    var p2;
    var game;
    var playerWidth = 30;

    var powerX, powerY;
    var itemWidth = 10;

    var mapColor = "#dcdcdc";

    // keyboard move ball
    var color1 = "#fb4000";
    var color2 = "#1ba990";
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
        //console.log(c1 == mapColor || c2 == mapColor || c3 == mapColor || c4 == mapColor);
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
        ctx.fillStyle = "#ffa500";
        ctx.fillRect(powerX, powerY, itemWidth, itemWidth);
    }

    function drawMap(map) {
        ctx.fillStyle = mapColor;
        if (map > 7) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
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
        } else if (map < 4) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillRect(100,100,600,300);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function makeValidPosition() {
        var valid = false;
        var newX, newY;
        while (!valid) {
            newX = parseInt((canvas.width - itemWidth)*Math.random());
            newY = parseInt((canvas.height - itemWidth)*Math.random());
            if ((newX > 2 && newY > 2 && newX < canvas.width - 2 && newY < canvas.height - 2) &&
                !detectCollision(newX, newY, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(newX, newY + itemWidth, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY + itemWidth, p1.x, p1.y, playerWidth, playerWidth) &&
                !detectCollision(newX, newY, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectCollision(newX, newY + itemWidth, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY + itemWidth, p2.x, p2.y, playerWidth, playerWidth) &&
                !detectWall(newX - 2, newY - 2, itemWidth + 2, itemWidth + 2)) {
                valid = true;
            }
        }
        return [newX, newY];
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

    function countdown() {
        if (game.time < 0) {
            return;
        }
        document.getElementById('countdown').innerHTML = ('0' + game.time).slice(-2);
        game.time -= 1;
        setTimeout(countdown,1000);
    }

    //--------------------------------------------------
    //---------------- game one algo -------------------
    //--------------------------------------------------
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
            var xy = makeValidPosition();
            powerX = xy[0];
            powerY = xy[1];
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

    function switchRole() {
        if (p1.role == "catch") {
            p1.role = "run";
            p1.dx = 4;
            p1.dy = 4;
        } else {
            p1.role = "catch";
            p1.dx = 4;
            p1.dy = 4;
        }

        if (p2.role == "catch") {
            p2.role = "run";
            p2.dx = 4;
            p2.dy = 4;
        } else {
            p2.role = "catch";
            p2.dx = 4;
            p2.dy = 4;
        }
    }


    //--------------------------------------------------
    //---------------- game two algo -------------------
    //--------------------------------------------------
    function detectPoint(p) {
        var cover = (detectCollision(powerX, powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(powerX + itemWidth, powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(powerX, powerY + itemWidth, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(powerX + itemWidth, powerY + itemWidth, p.x, p.y, playerWidth, playerWidth));
        if (cover) {
            p.point += 1;
            console.log(p);
            var xy = makeValidPosition();
            powerX = xy[0];
            powerY = xy[1];
        }
    }

    function comparePoints() {
        if (p1.point > p2.point) {
            console.log("p1 win");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("P1 WIN!!!",200,100);
        } else if (p2.point > p1.point) {
            console.log("p2 win");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("P2 WIN!!!",200,100);
        } else {
            console.log("draw");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("DRAW...",200,100);
        }
    }

    //--------------------------------------------------
    //---------------- game three algo -----------------
    //--------------------------------------------------

    function createMonster() {
        if (game.time < 0) {
            return;
        }
        var monster = {};
        monster.dx = parseInt(5*Math.random() + 1);
        monster.dy = parseInt(5*Math.random() + 1);
        monster.mode = parseInt(2*Math.random() + 1);
        game.monsters.push(monster);
        setTimeout(createMonster, 10000);
    }

    //--------------------------------------------------
    //-------------------- game init -------------------
    //--------------------------------------------------

    function gameOne() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(game.map);
        movePlayers();
        if (detectCatch()){
            return;
        }
        detectPowerUp(p1);
        detectPowerUp(p2);
        drawItem();
        drawPlayer(p1);
        drawPlayer(p2);
        requestAnimationFrame(gameOne);
    }

    function gameTwo() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (game.time < 0) {
            comparePoints();
            return;
        }
        drawMap(game.map);
        movePlayers();
        detectPoint(p1);
        detectPoint(p2);
        drawItem();
        drawPlayer(p1);
        drawPlayer(p2);
        requestAnimationFrame(gameTwo);

    }

    function gameThree() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (game.time < 0) {
            console.log("draw");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("DRAW...",200,100);
            return;
        }
        drawMap(game.map);
        movePlayers();
    }

    function init(mode) {
        game = {};
        game.map = parseInt(10*Math.random());
        game.mode = mode;
        p1 = new Player({'username':"p1", 'id':"p1", 'x':10, 'y':10, 'role':"run"});
        p2 = new Player({'username':"p2", 'id':"p2", 'x':720, 'y':460, 'role':"catch"});
        p1.point = 0;
        p2.point = 0;
        drawMap(game.map);
        if (game.mode == 1) {
            var xy = makeValidPosition();
            powerX = xy[0];
            powerY = xy[1];
            gameOne();
        } else if (game.mode == 2) {
            game.time = 10;
            var xy = makeValidPosition();
            powerX = xy[0];
            powerY = xy[1];
            gameTwo();
            countdown();
        } else if (game.mode == 3) {
            game.time = 60
            gameThree();
            createMonster();
            countdown();
        }
    };

    document.addEventListener("keydown", keyDownHandler, true);
    document.addEventListener("keyup", keyUpHandler, false);

    document.getElementById('mode1').onclick = function(e) {
        e.preventDefault();
        document.getElementById('gamemode').innerHTML = "CATCH & RUN";
        document.getElementById('countdown').innerHTML = "UNLIMITED";
        init(1);
    };

    document.getElementById('mode2').onclick = function(e) {
        e.preventDefault();
        document.getElementById('gamemode').innerHTML = "COLLECT POINTS";
        document.getElementById('countdown').innerHTML = "60";
        init(2);
    };

    document.getElementById('mode3').onclick = function(e) {
        e.preventDefault();
        document.getElementById('gamemode').innerHTML = "DODGE BALL";
        document.getElementById('countdown').innerHTML = "60";
        init(3);
    };


}());