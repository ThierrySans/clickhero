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
        this.point = 0;
    }


    var canvas, ctx;

    var local, other;
    var game;

    var playerWidth = 30;
    var defaultSp = 2;

    var itemWidth = 10;

    var mapColor = "#dcdcdc";

    var color1 = "#fb4000";
    var color2 = "#1ba990";
    var pLeft = false, pRight = false, pUp = false, pDown = false;

    function init(username, pid, mode) {
        document.getElementById("game_map").style.display = "block";
        document.getElementById("game").style.display = "none";
        canvas = document.getElementById("game_board");
        canvas.setAttribute('width', '800px');
        canvas.setAttribute('height', '500px');
        ctx = canvas.getContext("2d");

        game = {};
        game.map = parseInt(10*Math.random());
        game.mode = mode;
        game.over = false;
        drawMap(game.map);

        if (game.mode == 1) {
            model.getActiveUsername(function (err, currUser) {
                if (pid == "p1") {
                    other = new Player({'username':username, 'id':"p1", 'x':10, 'y':10, 'role':"run"});
                    local = new Player({'username':currUser, 'id':"p2", 'x':760, 'y':460, 'role':"catch"});
                } else if (pid == "p2") {
                    local = new Player({'username':currUser, 'id':"p1", 'x':10, 'y':10, 'role':"run"});
                    other = new Player({'username':username, 'id':"p2", 'x':720, 'y':460, 'role':"catch"});
                }
            });
            var xy = makeValidPosition();
            game.powerX = xy[0];
            game.powerY = xy[1];
            document.getElementById('p1_status').style.backgroundImage = "url('../media/run.png')";
            document.getElementById('p2_status').style.backgroundImage = "url('../media/catch.png')";
            document.getElementById('gamemode').innerHTML = "CATCH & RUN";
            document.getElementById('countdown').innerHTML = "UNLIMITED";
            gameOne();
        } else if (game.mode == 2) {
            model.getActiveUsername(function (err, currUser) {
                if (pid == "p1") {
                    other = new Player({'username':username, 'id':"p1", 'x':10, 'y':10, 'role':"collect"});
                    local = new Player({'username':currUser, 'id':"p2", 'x':760, 'y':460, 'role':"collect"});
                } else if (pid == "p2") {
                    local = new Player({'username':currUser, 'id':"p1", 'x':10, 'y':10, 'role':"collect"});
                    other = new Player({'username':username, 'id':"p2", 'x':760, 'y':460, 'role':"collect"});
                }
            });
            game.time = 60;
            var xy = makeValidPosition();
            game.powerX = xy[0];
            game.powerY = xy[1];
            local.dx = 2*defaultSp;
            local.dy = 2*defaultSp;
            other.dx = 2*defaultSp;
            other.dx = 2*defaultSp;
            document.getElementById('gamemode').innerHTML = "COLLECT POINTS";
            document.getElementById('countdown').innerHTML = "60";
            document.getElementById('p1_status').style.backgroundImage = "none";
            document.getElementById('p2_status').style.backgroundImage = "none";
            if (local.id == "p1") {
                document.getElementById('p1_status').innerHTML = local.point;
                document.getElementById('p2_status').innerHTML = other.point;
            } else {
                document.getElementById('p1_status').innerHTML = other.point;
                document.getElementById('p2_status').innerHTML = local.point;
            }
            gameTwo();
            countdown();
        } else if (game.mode == 3) {
            model.getActiveUsername(function (err, currUser) {
                if (pid == "p1") {
                    other = new Player({'username':username, 'id':"p1", 'x':10, 'y':10, 'role':"dodge"});
                    local = new Player({'username':currUser, 'id':"p2", 'x':760, 'y':460, 'role':"dodge"});
                } else if (pid == "p2") {
                    local = new Player({'username':currUser, 'id':"p1", 'x':10, 'y':10, 'role':"dodge"});
                    other = new Player({'username':username, 'id':"p2", 'x':760, 'y':460, 'role':"dodge"});
                }
            });
            game.time = 60;
            game.monsters = [];
            local.dx = 2*defaultSp;
            local.dy = 2*defaultSp;
            other.dx = 2*defaultSp;
            other.dx = 2*defaultSp;
            document.getElementById('gamemode').innerHTML = "DODGE BALL";
            document.getElementById('countdown').innerHTML = "60";
            document.getElementById('p1_status').style.backgroundImage = "url('../media/ghost.png')";
            document.getElementById('p2_status').style.backgroundImage = "url('../media/ghost.png')";
            gameThree();
            createMonster();
            moveMonsters();
            countdown();
        }
        var data = {"p1":local, "p2":other, "game":game};
        document.dispatchEvent(new CustomEvent("initDone", {'detail':data}));
    }

    function initSync(dataP1,dataP2,dataGame) {
        document.getElementById("game_map").style.display = "block";
        document.getElementById("game").style.display = "none";
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
        game = dataGame;
        if (game.mode == 1) {
            document.getElementById('p1_status').style.backgroundImage = "url('../media/run.png')";
            document.getElementById('p2_status').style.backgroundImage = "url('../media/catch.png')";
            document.getElementById('gamemode').innerHTML = "CATCH & RUN";
            document.getElementById('countdown').innerHTML = "UNLIMITED";
            gameOne();
        } else if (game.mode == 2) {
            document.getElementById('gamemode').innerHTML = "COLLECT POINTS";
            document.getElementById('countdown').innerHTML = "60";
            document.getElementById('p1_status').style.backgroundImage = "none";
            document.getElementById('p2_status').style.backgroundImage = "none";
            if (local.id == "p1") {
                document.getElementById('p1_status').innerHTML = local.point;
                document.getElementById('p2_status').innerHTML = other.point;
            } else {
                document.getElementById('p1_status').innerHTML = other.point;
                document.getElementById('p2_status').innerHTML = local.point;
            }
            gameTwo();
            countdown();
        } else if (game.mode == 3) {
            document.getElementById('gamemode').innerHTML = "DODGE BALL";
            document.getElementById('countdown').innerHTML = "60";
            document.getElementById('p1_status').style.backgroundImage = "url('../media/ghost.png')";
            document.getElementById('p2_status').style.backgroundImage = "url('../media/ghost.png')";
            gameThree();
            countdown();
        }

    };

    function gameSync(dataP1, dataP2, dataGame) {
        if(dataP1 && dataP2) {
            if (dataP1.username == local.username) {
                local = dataP1;
                other = dataP2;
            } else if (dataP2.username == local.username){
                local = dataP2;
                other = dataP1;
            }
        }
        game = dataGame;
        if (game.mode == 1) {
            if (local.id == "p1" && local.role == "catch") {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/catch.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/run.png')";
            } else if (local.id == "p2" && local.role == "catch") {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/run.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/catch.png')";
            } else if (local.id == "p1" && local.role == "run") {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/run.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/catch.png')"; 
            } else if (local.id == "p2" && local.role == "run") {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/catch.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/run.png')";
            }
        }
        else if (game.mode == 2) {
            if (local.id == "p1") {
                document.getElementById('p1_status').innerHTML = local.point;
                document.getElementById('p2_status').innerHTML = other.point;
            } else {
                document.getElementById('p1_status').innerHTML = other.point;
                document.getElementById('p2_status').innerHTML = local.point;
            }
        }
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

    function detectCollision(x1,y1,x2,y2,width,height) {
        return (x1 >= x2 && x1 <= x2 + width && y1 >= y2 && y1 <= y2 + width);
    }

    function detectWall(x,y,width,height) {
        var c1 = parseColor(ctx.getImageData(x,y,1,1));
        var c2 = parseColor(ctx.getImageData(x + width,y,1,1));
        var c3 = parseColor(ctx.getImageData(x,y + height,1,1));
        var c4 = parseColor(ctx.getImageData(x + width,y + height,1,1));
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

    function countdown() {
        if (game.time < 0 || game.over) {
            return;
        }
        //document.getElementById('countdown').innerHTML = ('0' + game.time).slice(-2);
        game.time -= 1;
        setTimeout(countdown,1000);
    }

    function drawPlayer(p) {
        if (p.id == "p1") {
            ctx.fillStyle = color1;
        } else {
            ctx.fillStyle = color2;
        }
        ctx.fillRect(p.x, p.y, playerWidth, playerWidth);
    }

    function drawPowerUp() {
        ctx.fillStyle = "#ffa500";
        ctx.fillRect(game.powerX, game.powerY, itemWidth, itemWidth);
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
            ctx.fillRect(100,100,600,20);
            ctx.fillRect(100,200,600,20);
            ctx.fillRect(100,300,600,20);
            ctx.fillRect(100,400,600,20);
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
            if ((newX > 1 && newY > 1 && newX < canvas.width - itemWidth - 1 && newY < canvas.height - itemWidth - 1) &&
                !detectCollision(newX, newY, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(newX, newY + itemWidth, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY + itemWidth, local.x, local.y, playerWidth, playerWidth) &&
                !detectCollision(newX, newY, other.x, other.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY, other.x, other.y, playerWidth, playerWidth) &&
                !detectCollision(newX, newY + itemWidth, other.x, other.y, playerWidth, playerWidth) &&
                !detectCollision(newX + itemWidth, newY + itemWidth, other.x, other.y, playerWidth, playerWidth) &&
                !detectWall(newX - 2, newY - 2, itemWidth + 2, itemWidth + 2)) {
                valid = true;
            }
        }
        return [newX, newY];
    }

    function moveLocalPlayer() {
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

    //--------------------------------------------------
    //---------------- game one algo -------------------
    //--------------------------------------------------
    function switchRole() {
        if (local.role == "catch") {
            local.role = "run";
            local.dx = defaultSp;
            local.dy = defaultSp;
            if (local.id == "p1") {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/run.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/catch.png')";
            } else {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/catch.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/run.png')";
            }
        } else {
            local.role = "catch";
            local.dx = defaultSp;
            local.dy = defaultSp;
            if (local.id == "p2") {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/run.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/catch.png')";
            } else {
                document.getElementById('p1_status').style.backgroundImage = "url('../media/catch.png')";
                document.getElementById('p2_status').style.backgroundImage = "url('../media/run.png')";
            }
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

    function detectPowerUp(p) {
        var cover = (detectCollision(game.powerX, game.powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(game.powerX + itemWidth, game.powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(game.powerX, game.powerY + itemWidth, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(game.powerX + itemWidth, game.powerY + itemWidth, p.x, p.y, playerWidth, playerWidth));
        if (cover) {
            if (p.role == "catch") {
                p.dx ++;
                p.dy ++;
            } else if (p.role == "run"){
                switchRole();
            }
            var xy = makeValidPosition();
            game.powerX = xy[0];
            game.powerY = xy[1];
            var data = {"p1":local, "p2":other, "game": game};
            document.dispatchEvent(new CustomEvent("gameChanged", {'detail':data}));
        }
    }

    function detectCatch() {
        var cover = (detectCollision(local.x, local.y, other.x, other.y, playerWidth, playerWidth) ||
                detectCollision(local.x + playerWidth, local.y, other.x, other.y, playerWidth, playerWidth) ||
                detectCollision(local.x, local.y + playerWidth, other.x, other.y, playerWidth, playerWidth) ||
                detectCollision(local.x + playerWidth, local.y + playerWidth, other.x, other.y, playerWidth, playerWidth));
        if (cover) {
            if (local.role == "catch") {
                console.log("you win");
                ctx.font = "80px Arial";
                ctx.fillStyle = "red";
                ctx.fillText("You WIN!!!",200,100);
            } else {
                console.log("Other win");
                ctx.font = "80px Arial";
                ctx.fillStyle = "black";
                ctx.fillText("You LOSE...",200,100);
            }
        }
        return cover;
    }

    //--------------------------------------------------
    //---------------- game two algo -------------------
    //--------------------------------------------------
    function detectPoint(p) {
        var cover = (detectCollision(game.powerX, game.powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(game.powerX + itemWidth, game.powerY, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(game.powerX, game.powerY + itemWidth, p.x, p.y, playerWidth, playerWidth) &&
                detectCollision(game.powerX + itemWidth, game.powerY + itemWidth, p.x, p.y, playerWidth, playerWidth));
        if (cover) {
            p.point += 1;
            if (local.id == "p1") {
                document.getElementById('p1_status').innerHTML = local.point;
                document.getElementById('p2_status').innerHTML = other.point;
            } else {
                document.getElementById('p1_status').innerHTML = other.point;
                document.getElementById('p2_status').innerHTML = local.point;
            }
            var xy = makeValidPosition();
            game.powerX = xy[0];
            game.powerY = xy[1];
            var data = {"game":game};
            document.dispatchEvent(new CustomEvent("gameChanged", {'detail':data}));

        }
    }

    function comparePoints() {
        if (local.point > other.point) {
            console.log("you win");
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("You WIN!!!",200,100);
        } else if (other.point > local.point) {
            console.log("other win");
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("You LOSE...",200,100);
        } else {
            console.log("draw");
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("DRAW...",200,100);
        }
    }

    //--------------------------------------------------
    //---------------- game three algo -----------------
    //--------------------------------------------------

    function createMonster() {
        if (game.time < 1 || game.mode != 3 || game.over) {
            return;
        }
        var monster = {};
        monster.dx = parseInt(5*Math.random() + 1);
        if (2*Math.random() > 1) {
            monster.dx = (-1)*monster.dx;
        }
        monster.dy = parseInt(5*Math.random() + 1);
        if (2*Math.random() > 1) {
            monster.dy = (-1)*monster.dy;
        }
        monster.mode = parseInt(2*Math.random() + 1);
        var xy = makeValidPosition();
        monster.x = xy[0];
        monster.y = xy[1];
        game.monsters.push(monster);
        var data = {"game": game};
        document.dispatchEvent(new CustomEvent('gameChanged', {'detail':data}));
        setTimeout(createMonster, 10000);
    }

    function moveMonsters() {
        if (game.time < 1 || game.mode != 3 || game.over) {
            return;
        }
        game.monsters.forEach(function (monster) {
            if (monster.mode == 1) {
                if (monster.x + monster.dx + itemWidth > canvas.width) {
                    monster.x = canvas.width - itemWidth;
                    monster.dx = (-1)*monster.dx;
                } else if (monster.x + monster.dx < 0) {
                    monster.x = 0;
                    monster.dx = (-1)*monster.dx;
                } else {
                    monster.x += monster.dx;
                }
                if (monster.y + monster.dy + itemWidth > canvas.height) {
                    monster.y = canvas.height - itemWidth;
                    monster.dy = (-1)*monster.dy;
                } else if (monster.y + monster.dy < 0) {
                    monster.y = 0;
                    monster.dy = (-1)*monster.dy;
                } else {
                    monster.y += monster.dy;
                }
            } else if (monster.mode == 2) {
                if (2*Math.random() > 1) {
                    if (monster.y + 2*monster.dy + itemWidth > canvas.height) {
                        monster.y = canvas.height - itemWidth;
                        monster.dy = (-1)*monster.dy;
                    } else if (monster.y + 2*monster.dy < 0) {
                        monster.y = 0;
                        monster.dy = (-1)*monster.dy;
                    } else {
                        monster.y += 2*monster.dy;
                    }
                } else {
                    if (monster.x + 2*monster.dx + itemWidth > canvas.width) {
                        monster.x = canvas.width - itemWidth;
                        monster.dx = (-1)*monster.dx;
                    } else if (monster.x + 2*monster.dx < 0) {
                        monster.x = 0;
                        monster.dx = (-1)*monster.dx;
                    } else {
                        monster.x += 2*monster.dx;
                    }
                }
            }
        });
        var data = {"game": game};
        document.dispatchEvent(new CustomEvent('gameChanged', {'detail':data}));
        requestAnimationFrame(moveMonsters);
    }

    function drawMonsters() {
        game.monsters.forEach(function (monster) {
            ctx.fillStyle = "#500050";
            ctx.fillRect(monster.x, monster.y, itemWidth, itemWidth);
        });
    }

    function detectMeetMonsters(p) {
        var res = false;
        game.monsters.forEach(function (monster) {
            var cover = (detectCollision(monster.x, monster.y, p.x, p.y, playerWidth, playerWidth) ||
                    detectCollision(monster.x + itemWidth, monster.y, p.x, p.y, playerWidth, playerWidth) ||
                    detectCollision(monster.x, monster.y + itemWidth, p.x, p.y, playerWidth, playerWidth) ||
                    detectCollision(monster.x + itemWidth, monster.y + itemWidth, p.x, p.y, playerWidth, playerWidth));
            if (cover) {
                res = true;
            }
        });
        return res;
    }

    //--------------------------------------------------
    //------------------ handler -----------------------
    //--------------------------------------------------

    function keyUpHandler(e){
        if (document.getElementById("game_map").style.display == "block") {
            e.preventDefault();
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
        } else {
            return true;
        }
    }

    function keyDownHandler(e){
        if (document.getElementById("game_map").style.display == "block") {
            e.preventDefault();
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
        } else {
            return true;
        }
    }

    function gameOne() {
        if (detectCatch()){
            game.over = true;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(game.map);
        moveLocalPlayer();
        detectPowerUp(local);
        drawPowerUp();
        drawPlayer(local);
        drawPlayer(other);
        requestAnimationFrame(gameOne);
    }

    function gameTwo() {
        if (game.time < 0) {
            comparePoints();
            game.over = true;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(game.map);
        moveLocalPlayer();
        detectPoint(local);
        drawPowerUp();
        drawPlayer(local);
        drawPlayer(other);
        requestAnimationFrame(gameTwo);
    }

    function gameThree() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(game.map);
        drawPlayer(p1);
        drawPlayer(p2);
        drawMonsters();
        if (game.time < 0) {
            console.log("draw");
            //ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("DRAW...",200,100);
            game.over = true;
            return;
        }
        if (detectMeetMonsters(local)) {
            console.log("you lose");
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("You LOSE..",200,100);
            game.over = true;
            return;
        } else if (detectMeetMonsters(other)) {
            console.log("you win");
            ctx.font = "80px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("You WIN!!!",200,100);
            game.over = true;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMap(game.map);
        moveLocalPlayer();
        drawPlayer(local);
        drawPlayer(other);
        drawMonsters();
        requestAnimationFrame(gameThree);
    }

    document.addEventListener("keydown", keyDownHandler, true);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("otherPlayerMoved", function(e){
        var data = e.detail;
        moveOtherPlayer(data.x, data.y);
    });
    document.addEventListener("otherSideChangedGame", function(e){
        var data = e.detail;
        gameSync(data.p1, data.p2, data.game);
    });

    document.addEventListener("gameStarted", function(e){
        var data = e.detail;
        data.pid = "p" + parseInt(2*Math.random() + 1);
        init(data.username, data.pid, data.mode);
    });

    document.addEventListener("otherSideInited", function(e){
        var data = e.detail;
        initSync(data.p1, data.p2, data.game);
    });

}(model));
