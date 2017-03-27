var model = (function(){
    "use strict";
    
    var doAjax = function (method, url, body, json, callback){
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function(e){
            switch(this.readyState){
                 case (XMLHttpRequest.DONE):
                    if (this.status === 200) {
                        if(json) return callback(null, JSON.parse(this.responseText));
                        return callback(null, this.responseText);
                    }else{
                        return callback(this.responseText, null);
                    }
            }
        };
        xhttp.open(method, url, true);
        if (json && body){
            xhttp.setRequestHeader('Content-Type', 'application/json');
            xhttp.send(JSON.stringify(body));  
        }else{
            xhttp.send(body);  
        }        
    };
    
    var model = {};
    
    model.getActiveUsername = function(callback) {
        var keyValuePairs = document.cookie.split('; ');
        for (var i in keyValuePairs) {
            var keyValue = keyValuePairs[i].split('=');
            if (keyValue[0] === 'username') return callback(null, keyValue[1]);
        }
        return callback("No active user", null);
    };
    
    // sign up, sign in and sign out
    model.signOut = function(callback) {
        doAjax('DELETE', '/api/signout/', null, false, callback);  
    };
    
    model.signIn = function(data, callback) {
        doAjax('POST', '/api/signin/', data, true, function(err, user) {
            if (err) return callback(err, null);
            callback(null, user);
        });
    };
    
    // Create
    model.createUser = function(data, callback) {
        doAjax('PUT', '/api/users/', data, true, callback);
    };
    
    // Read
    model.getFriends = function(searchname, callback) {
        if (searchname === "") {
            doAjax("GET", "/api/friends/", null, false, callback);
        } else {
            doAjax("GET", "/api/users/" + searchname + "/", null, true, callback);
        }
    };
    
    // Update
    model.updateUser = function (data, callback){
        var formdata = new FormData();
        formdata.append("picture", data.picture);
        model.getActiveUsername(function(err, username){
            if (err) return callback(err, null);
            doAjax("PATCH", "/api/users/" + username + "/", formdata, false, callback);
        });
    };
    
    model.addFriend = function (id, callback){
        doAjax("PATCH", "/api/addFriend/" + id + "/", {action: "addfriend"}, true, callback);
    };
    
    model.deleteFriend = function (id, callback) {
        doAjax("PATCH", "/api/deleteFriend/" + id + "/", {action: "deletefriend"}, true, callback);
    };
    
    model.patchId = function (id, callback) {
        doAjax("PATCH", "/api/newId/" + id + "/", null, true, callback);
    };
    
    // Delete
    
    return model;
    
}());
