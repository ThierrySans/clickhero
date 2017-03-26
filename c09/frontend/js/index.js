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
                        var chatButton = document.createElement("div");
                        chatButton.className = "chat_button";
                        chatButton.onclick = function(e) {
                            model.sendChat(e.target.parentNode.id, function(err) {
                                if (err) return showError(err);
                                showChatBox();
                            });
                        };
                        e.appendChild(chatButton);
                        var deleteButton = document.createElement("div");
                        deleteButton.className = "delete_button";
                        deleteButton.onclick = function(e) {
                            model.deleteFriend(e.target.parentNode.id, function(err) {
                                if (err) return showError(err);
                                updatePage();
                                updateFriend();
                            });
                        };
                        e.appendChild(deleteButton);
                    } else {
                        var visitButton = document.createElement("div");
                        visitButton.className = "visit_button";
                        visitButton.onclick = function(e) {
                            model.visitPlayer(e.target.parentNode.id, function(err) {
                                if (err) return showError(err);
                                showAchievement();
                            });
                        };
                        e.appendChild(visitButton);
                        var addButton = document.createElement("div");
                        addButton.className = "add_button";
                        addButton.onclick = function(e) {
                            model.addFriend(e.target.parentNode.id, function(err) {
                                if (err) return showError(err);
                                updatePage();
                                updateFriend();
                            });
                        };
                        e.appendChild(addButton);
                    }
                    container.appendChild(e);
                });
            });
        });
    };
    
    var updateFriend = function () {
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
                    var data = {}
                    data.friendId = friends[0].peerId;
                    data.friendname = friends[0].username;
                    model.getActiveUsername(function(err, user) {
                        data.myname = user;
                    })
                    document.dispatchEvent(new CustomEvent('onInvite', {detail: data}));
                    
                });
            };
            container.appendChild(start);
            container.appendChild(p);
            container.appendChild(e);
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
        updateFriend();
    };  
    
    document.getElementById("search").onkeyup = function(e) {
        if (document.getElementById("search_my_friends").checked) {
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
        if (document.getElementById("search_all_players").checked) {
            e.preventDefault();
            var input = document.getElementById("search").value;
            if (input.length > 0) {
                e.target.reset();
                updatePage(input);
            }
        }
    };
    
    
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
          var username = data.friendname;
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
        updateFriend();    
    };
    
}(model));
