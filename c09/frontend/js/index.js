(function(model){
    "use strict";
    var showError = function(message){
        var e = document.getElementById("error");
        e.innerHTML = `<span class="alert">${(message)}</span>`;
        e.style.display = "block";
    };
    
    var updatePage = function(search = ""){
        model.getFriends(search, function(err, friends) {
            if (err) return showError(err);
            model.getActiveUsername(function(err, username) {
                if (err) return showError(err);
                var container = document.getElementById("friends");
                container.innerHTML = "";
                var name = document.getElementById('username');
                name.className = "header_button";
                name.innerHTML = `<a href="/">${username}</a>`;
                console.log(friends);
                friends.forEach(function (friend) {
                    var e = document.createElement('div');
                    e.className = "players";
                    e.id = friend._id;
                    e.innerHTML = `
                        <object class="user_pic" data="${friend.picture}" type="${friend.mimetype}">
                            <img src="/media/user.png"/>
                        </object>
                        <div class="player_info">
                            <div class="player_name">${friend.username}</div>
                            <div class="player_status">${friend.status}</div>
                        </div>`;
                    if (search === "") {
                        var deleteButton = document.createElement("div");
                        deleteButton.className = "delete_button";
                        deleteButton.onclick = function(e) {
                            model.deleteFriend(e.target.parentNode.id, function(err) {
                                if (err) return showError(err);
                                updatePage();
                            });
                        };
                        e.appendChild(deleteButton);
                    } else {
                        var addButton = document.createElement("div");
                        addButton.className = "add_button";
                        addButton.onclick = function(e) {
                            model.addFriend(e.target.parentNode.id, function(err) {
                                if (err) return showError(err);
                                updatePage();
                            });
                        };
                        e.appendChild(addButton);
                        var cancelButton = document.createElement("button");
                        cancelButton.value = "cancel";
                        cancelButton.innerHTML = "cancel";
                        cancelButton.type = "button";
                        cancelButton.className = "cancel_button";
                        cancelButton.onclick = function(e) {
                            updatePage();
                        };
                        container.appendChild(cancelButton);
                    }
                    e.onclick = function(u) {
                        if (document.getElementsByClassName("selected_players").length != 0) {
                             document.getElementsByClassName("selected_players")[0].className = "players";                   
                        }
                        e.className = "selected_players";
                    };
                    container.appendChild(e);
                });
            });
        });
    };
    
    //(function scheduler(){
        //setTimeout(function(e){
            //updatePage()
            //scheduler();
        //},2000);
    //}());
    
    window.onload = function scheduler(e){
        updatePage();
    };  
    
    document.getElementById("search").onkeyup = function(e) {
        if (document.getElementById("search_my_friends").selected) {
            console.log("hey");
            var input, filter, players, i, info, name;
            input = document.getElementById('search');
            filter = input.value.toUpperCase();
            players = document.getElementsByClassName("players");
    
            for (i = 0; i < players.length; i++) {
                info = players[i].getElementsByClassName("player_info");
                name = info[0].getElementsByClassName("player_name")[0];
                if (name.innerHTML.toUpperCase().indexOf(filter) > -1) {
                    players[i].style.display = "";
                } else {
                    players[i].style.display = "none";
                }
            }
        }
    };
    
    document.getElementById("submit_search").onsubmit = function(e) {
        if (document.getElementById("search_all_players").selected) {
            e.preventDefault();
            var input = document.getElementById("search").value;
            if (input.length > 0) {
                e.target.reset();
                updatePage(input);
            }
        }
    };
    
    document.getElementById("left").onclick = function(e) {
        if (document.getElementById("mode_name").innerHTML == "Mode 1") {
            document.getElementById("mode_name").innerHTML = "Mode 3";
            document.getElementById("mode1").id = "mode3";
        } else if (document.getElementById("mode_name").innerHTML == "Mode 2") {
            document.getElementById("mode_name").innerHTML = "Mode 1";
            document.getElementById("mode2").id = "mode1";
        } else {
            document.getElementById("mode_name").innerHTML = "Mode 2";
            document.getElementById("mode3").id = "mode2";
        }
    };
    
    document.getElementById("right").onclick = function(e) {
        if (document.getElementById("mode_name").innerHTML == "Mode 1") {
            document.getElementById("mode_name").innerHTML = "Mode 2";
            document.getElementById("mode1").id = "mode2";
        } else if (document.getElementById("mode_name").innerHTML == "Mode 2") {
            document.getElementById("mode_name").innerHTML = "Mode 3";
            document.getElementById("mode2").id = "mode3";
        } else {
            document.getElementById("mode_name").innerHTML = "Mode 1";
            document.getElementById("mode3").id = "mode1";
        }
    };
    
    document.getElementsByClassName("start_button")[0].onclick = function(e) {
        if (document.getElementsByClassName("selected_players").length == 0) {
            return showError("You haven't select any friends!");
        } else {
            var data = {};
            var username = document.getElementsByClassName("selected_players")[0].getElementsByClassName("player_info")[0].getElementsByClassName("player_name")[0].innerHTML;
            model.getFriends(username, function(err, user) {
                model.getActiveUsername(function(err, username) {
                    if (err) return showError(err);
                    data.myname = username;
                });
                data.friendname = user[0].username;
                data.friendId = user[0].peerId;
                data.mode = document.getElementsByClassName("start_button")[0].id.slice(4, 5);
                console.log(data);
                document.dispatchEvent(new CustomEvent('onInvite', {detail: data}));
            });
        }
    }
    
    
    /*document.getElementById("online_game").onclick = function(e) {
        document.getElementById("online_game").style.display = "none";
        document.getElementById("offline_game").style.display = "none";
        var container = document.getElementById("game");
        container.innerHTML = "";
        var search = "";
        model.getFriends(search, function(err, friends) {
            if (err) return showError(err);
            var e = document.createElement("select");
            var p = document.createElement("p");
            p.innerHTML = "Invite your friend: ";
            friends.forEach(function (friend) {
                var u = document.createElement("option");
                u.value = friend.username;
                u.innerHTML = friend.username;
                e.appendChild(u);
            });
            var start = document.createElement("div");
            start.className = "start_button";
            start.onclick = function(v) {
                var friendname = e.options[e.selectedIndex].text;
                model.getFriends(friendname, function(err, friends) {
                    if (err) return showError(err);
                    document.dispatchEvent(new CustomEvent('onStart', {detail: friendname.peerId}));
                    
                });
            };
            container.appendChild(p);
            container.appendChild(e);
            container.appendChild(start);
        });
    };*/
    
    /*document.getElementById("offline_game").onclick = function(e) {
        document.getElementById("online_game").style.display = "none";
        document.getElementById("offline_game").style.display = "none";
        document.getElementById("game_map").style.display = "block";
    };*/
    document.addEventListener("showInvite", function(e) {
          var data = e.detail;
          var username = data.myname;
          var invite = document.createElement("div");
          invite.className = "alert alert-info";
          invite.id = "invite";
          var invite_request = document.createElement("p");
          invite_request.innerHTML = `${username} has sent you a game invite!`
          var accept = document.createElement("div");
          accept.id = "accept_btn";
          var decline = document.createElement("div");
          decline.id = "decline_btn"
          accept.addEventListener("click", function(e){
              document.dispatchEvent(new CustomEvent('inviteAccept', {detail: data}));
          });
          decline.addEventListener("click", function(e){
              document.dispatchEvent(new CustomEvent('inviteDecline', {detail: data}));
              invite.style = "display:none";
          });
          var container = document.getElementById("messages");
          invite.appendChild(invite_request);
          invite.appendChild(accept);
          invite.appendChild(decline);
          container.appendChild(invite);
          invite.style = "display:block";
    });
    
    document.getElementById("back").onclick = function(e) {
        /*document.getElementById("online_game").style.display = "block";
        document.getElementById("offline_game").style.display = "block";*/
        document.getElementById("game_map").style.display = "none";
        document.getElementById("game").style.display = "block";
        updatePage();    
    };
    
}(model));
