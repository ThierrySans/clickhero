---
layout: default
permalink: clickhero/doc/
---

# Project: API Documentation

## User API

### Create

- description: create a new user
- request: `PUT /api/users/`
    - content-type: `application/json`
    - body: object
      - username: (string) the username of the user
      - password: (string) the password of the user
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) the username of the user
      - salt: (string crypto randomBytes) the salt of the user
      - saltedHash: the salted hash of the user
      - friends: the friend ids of the user
      - picture: the picture of the user
      - peerId: the peerId of the user
      - status: the status of the user, default "Offline"
- response: 409
    - body: message :Username already exists
- response: 500
    - body: message: database error

``` 
$ curl -X PUT
       -H "Content-Type: `application/json`" 
       -d '{"username":"Lorinda","password":"123456"}'
       http://localhost:3000/api/users/
```

### Create

- description: sign in
- request: `POST /api/signin/`
    - content-type: `application/json`
    - body: object
      - username: (string) the username of the user
      - password: (string) the password of the user
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) the username of the user
      - salt: (string crypto randomBytes) the salt of the user
      - saltedHash: the salted hash of the user
      - friends: the friend ids of the user
      - picture: the picture of the user
      - peerId: the peerId of the user
      - status: the status of the user, default "Offline"
- response: 500
    - body: message :Database error
- response: 401
    - body: message: Unauthorized

``` 
$ curl -X POST 
       -H "Content-Type: application/json" 
       -d '{"username":"Lorinda","password":"123456"} '
       http://localhsot:3000/signin/
```

### Read

- description: get the user's profile image
- request: `GET /api/users/:username/picture/`
- response: 200
    - content-type: `application/json`
    - body: object
- response: 404
    - body: message :username not found
- response: 403
    - body: message : forbidden

``` 
$ curl http://localhost:3000/api/users/Lorinda/picture/
```

### Read

- description: get the friends of the user
- request: `GET /api/friends/`
- response: 200
    - content-type: `application/json`
    - body: list of object
      - username: (string) the username of the user
      - salt: (string crypto randomBytes) the salt of the user
      - saltedHash: the salted hash of the user
      - friends: the friend ids of the user
      - picture: the picture of the user
      - peerId: the peerId of the user
      - status: the status of the user, default "Offline"
- response: 404
    - body: message :username not found
- response: 403
    - body: message : forbidden

``` 
$ curl http://localhost:3000/api/friends/
```

### Read

- description: get one specific friend of all players
- request: `GET /api/users/:username/`
- response: 200
    - content-type: `application/json`
    - body: list of object
      - username: (string) the username of the user
      - salt: (string crypto randomBytes) the salt of the user
      - saltedHash: the salted hash of the user
      - friends: the friend ids of the user
      - picture: the picture of the user
      - peerId: the peerId of the user
      - status: the status of the user, default "Offline"
- response: 404
    - body: message :username not found
- response: 403
    - body: message : forbidden

``` 
$ curl http://localhost:3000/api/users/Lorinda/
```

### Update
  
- description: update the profile image of the user
- request: `PATCH /api/users/:username/`
    - content-type: `formdata`
    - body: formdata
      - picture
- response: 200
    - content-type: `application/json`
    - body: empty
- response: 404
    - body: message :username not found
- response: 403
    - body: message :forbidden

``` 
$ curl -X PATCH
       http://localhsot:3000/api/users/Lorinda/
``` 

### Update
  
- description: add the friend id to the friends list of the user
- request: `PATCH /api/addFriend/:id/`
    - content-type: `application/json`
    - body: empty
- response: 200
    - content-type: `application/json`
    - body: empty
- response: 403
    - body: message :forbidden

``` 
$ curl -X PATCH
       http://localhsot:3000/api/addFriend/RUt3vGmbTqjkfCzu/
```

### Update
  
- description: delete the friend id to the friends list of the user
- request: `PATCH /api/deleteFriend/:id/`
    - content-type: `application/json`
    - body: empty
- response: 200
    - content-type: `application/json`
    - body: empty
- response: 403
    - body: message :forbidden

``` 
$ curl -X PATCH
       http://localhsot:3000/api/deleteFriend/RUt3vGmbTqjkfCzu/
```

### Update
  
- description: update the peerId of the user
- request: `PATCH /api/newId/:id/`
    - content-type: `application/json`
    - body: empty
- response: 200
    - content-type: `application/json`
    - body: empty
- response: 404
    - body: message :username not found

``` 
$ curl -X PATCH
       http://localhsot:3000/api/newId/RUt3vGmbTqjkfCzu/
```
