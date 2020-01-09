// Require the functionality we need to use:
/*var http = require('http'),
	url = require('url'),
	path = require('path'),
	mime = require('mime'),
	path = require('path'),
	socketio = require("socket.io"),
	mysql = require("mysql"),
    fs = require('fs');

*/
// Make a simple fileserver for all of our static content.
// Everything underneath <STATIC DIRECTORY NAME> will be served.
var express = require('express');
var app = express();
var http = require('http').createServer(app);
var mysql = require('mysql');
var io = require('socket.io')(http);
var bcrypt = require('bcrypt');

/*app.get('/', function(req, res){
  res.sendFile(__dirname + '/test');
});*/
console.log(__dirname + "/test");
app.use('/creative', express.static(__dirname + '/ckeditor5-with-real-time-collaboration'));

io.on('connection', function(socket){
  console.log('a user connected');
});

http.listen(3456, function(){
  console.log('listening on *:3000');
});


// Do the Socket.IO magic:
//var io = socketio.listen(app);
//let liveusers = new Array();
let liveusers1 = new Array();
let liverooms = new Array();
let pararray = new Array();

var db = mysql.createConnection({
	// JOES'S INSTANCE
    /*server: 'ec2-18-220-19-105.us-east-2.compute.amazonaws.com/',
	user: 'wustl_inst',
	password: 'wustl_pass',
	database: 'shared',*/
	//REID'S INSTANCE
	server: 'ec2-3-18-225-114.us-east-2.compute.amazonaws.com',
	user: 'cpage',
	password: 'cpagepass',
	database: 'cpage',
})

io.sockets.on("connection", function(socket){
	//console.log("socket opened");

	// sql query to create new account
	socket.on('message_to_server1', function(data) {
        //console.log("new user server side");
        let x = true;
        let userarray = []
		//check to see if username has already been taken
		db.query("SELECT username FROM users").on('result', function(res){
			if (res.username == data["username"]){
				//alert ("username already in use");
				x = false;
			}else if(res.username == ""){
				//alert ("invalid username");
				x = false;
			}
		})
		var pause = 1000;
		//if username not taken, add to DB so user can log in
		setTimeout(function(){
			if(x){
				let saltval = 10;
				bcrypt.hash(data["password"], saltval, (err, hash) => {
					if (!err) {
						console.log(hash);
						db.query("insert into users (username, password) values ('" +  data["username"] + "', '" +  hash + "')",
						function(err) { if (err) console.log(err) });
					}
					else {
						console.log('Error: ' + err);
					}
				})
				
			}else{
				//io.to(data["roomid"]).emit("message_to_client7", {message: message});
			}
		}, pause)
	});

	// sql request to validate user login
	socket.on('message_to_server2', function(data) {
		//console.log("trying to login server side");
		let psw;
		let userid;
		let pause = 1000;
		let requester = data["username"];
		db.query("SELECT password FROM users WHERE username='" + requester + "'")
			.on('result', function(res){
				psw = res.password;
				bcrypt.compare(data["password"], psw, (err, res) => {
					if (!err) {
						db.query("SELECT id FROM users WHERE username='" + requester + "'")
						.on('result', function(res2) {
						userid = res2.id;
						console.log("userid: " + userid);
						console.log(requester + " is logging in")
						setTimeout(function() {updateDocuments(userid, requester); updateShared(userid, requester); /*updateFriends(userid, requester)*/}, pause);
						})
					}
					else {
						console.log("login failed");
						io.sockets.emit("message_to_client2", {success: false});
					}
				})
			})
	});

	// sql query that saves documents
	socket.on('message_to_server3', function(data){
		db.query("UPDATE documents set body='" + data["newbody"] + "' WHERE doc_id='" + data["docid"] + "'")
	})

	// sql query that creates new documents
	socket.on('message_to_server4', function(data){
		console.log("creating new doc..");
		let pause = 1000;
		db.query("INSERT into documents (title, creator_id) values ('" + data["title"] + "', '" + data["userid"] + "')")
		.on('result', function() {
			console.log("refreshing doc view");
			setTimeout(function(){ updateDocuments(data["userid"], data["username"])}, pause);
		})
	});

	// sql query that pulls the body of a given document
	socket.on('message_to_server5', function(data){
		//console.log("server side isadmin: " + data["isadmin"]);
		db.query("SELECT body FROM documents WHERE doc_id='" + data["docid"] + "'")
		.on('result', function(res) {
			let neededid = "doc" + data["docid"];
			io.sockets.emit("message_to_client5", {username: data["username"], docid: neededid, docbody: res.body, isadmin: data["isadmin"]});
		})
	});

	// sql query to delete a document
	socket.on('message_to_server6', function(data) {
		let pause = 1000;
		let array = new Array()
		db.query("SELECT shared_id FROM sharing WHERE doc_id='" + data["docid"] + "'")
		.on('result', function(res) {
			array.push(res.shared_id);
		})
		db.query("DELETE FROM sharing WHERE doc_id='" + data["docid"] + "'");
		setTimeout(function() {
			db.query("DELETE FROM documents WHERE doc_id='" + data["docid"] + "'");
			for (i=0; i<array.length; ++i) {
				updateSharedAll(array[i], data["docid"]);
			}
		}, pause)
		//updateDocuments(data["userid"]);
	})

	// inserts data into shared documents table
	socket.on('message_to_server9', function(data) {
		let pause = 1000;
		console.log("share server side: " + data["sender"]+ data["docid"] + data["recipient"]);
		db.query("SELECT id FROM users WHERE username='" + data["recipient"] + "'")
		.on('result', function(res){
			if (res.id != undefined) {
				db.query("INSERT into sharing (admin_id, shared_id, doc_id) values ('" + data["sender"] + "', '" + res.id + "', '" + data["docid"] + "')")
				setTimeout(function() {updateShared(res.id, data["recipient"])}, pause);
				db.query("SELECT username FROM users WHERE id='" + data["sender"] + "'")
				.on('result', function(res2) {
					console.log("should be username: " + res2.username);
					io.sockets.emit("message_to_client9", {recipient: data["recipient"], sender: res2.username});
				})
			}
		})
	})

	// sql query to add new friends
	socket.on('message_to_server11', function(data) {
		console.log("addfriend server side");
		let pause = 1000;
		let resultid;
		db.query("SELECT id FROM users WHERE username='" + data["friend"] + "'")
		.on('result', function(res) {
			console.log("getting a result");
			resultid = res.id;
		});
		setTimeout(function() {
			console.log("second step, friendid: ", resultid);
			if (resultid == null) {
				io.sockets.emit("message_to_client11", {success: false, requester: data["requester"]});
			}
			else{
				db.query("INSERT into friends (friendA, friendB) values ('" + data["userid"] + "', '" + resultid + "')");
				db.query("INSERT into friends (friendA, friendB) values ('" + resultid + "', '" + data["userid"] + "')");
				setTimeout(function() {updateFriends(data["userid"], data["requester"]); }, pause);
			}
		}, pause);
	})

	// pulls all documents created by a given user
	function updateDocuments(userid, requester) {
		//console.log("new function userid = " + userid);
		console.log("in update func");
		let pause = 1000;
		let docarray2 = new Array();
		db.query("SELECT * FROM documents WHERE creator_id='" + userid + "'")
		.on('result', function(res3){
			let docarray = new Array();
			docarray.push(res3["title"], res3["doc_id"], res3["body"]);
			docarray2.push(docarray);
		})

		setTimeout(function() {
			console.log(requester);
			console.log(docarray2);
			io.sockets.emit("message_to_client2", {success: true, userid: userid, docs: docarray2, username: requester});
		}, pause)
	}

	// pulls all shared docs associated with a user
	function updateShared(userid, requester) {
		console.log(requester + " wants the shared documents");
		let pause = 1000;
		let shared2 = new Array();
		db.query("SELECT doc_id FROM sharing where shared_id='" + userid + "'")
		.on('result', function(res){
			db.query("SELECT * FROM documents WHERE doc_id='" + res.doc_id + "'")
			.on('result', function(res2){
			let shared = new Array();
			shared.push(res2["title"], res2["doc_id"], res2["body"]);
			db.query("SELECT username FROM users WHERE id='" + res2["creator_id"] + "'")
			.on('result', function(res3) {
				shared.push(res3["username"]);
				shared2.push(shared);
			})
			})
		})
		setTimeout(function() {
			console.log(shared2);
			io.sockets.emit("message_to_client8", {shareddocs: shared2, requester: requester})
		}, pause);
	}


	// deletes a document from user's page with whom it is shared
	function updateSharedAll(userid, docid) {
		db.query("SELECT username FROM users WHERE id='" + userid + "'")
		.on('result', function(res) {
			io.sockets.emit("message_to_client10", {docid: docid, requester: res.username})
		})
	}

	// friend feature breaks the whole site
	/*
	function updateFriends(userid, requester) {
		let friends2 = new Array();
		let pause = 1000;
		db.query("SELECT friendB FROM friends WHERE friendA='" + userid + "'")
		.on('result', function(res) {
			db.query("SELECT username FROM users WHERE id ='" + res.friendB + "'")
			.on('result', function(res2) {
				let friends = new Array();
				friends.push(res.friendB);
				friends.push(res2.username);
				friends2.push(friends);
			})
		})
		setTimeout(function() {
			console.log(friends2);
			io.sockets.emit("message_to_client11", {success: true, requester: requester, friends: friends2})
		}, pause)
	}*/

});
