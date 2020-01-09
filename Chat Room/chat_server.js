// Require the packages we will use:
var http = require("http"),
	socketio = require("socket.io"),
	mysql = require("mysql"),
	fs = require("fs");

// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){

	// This callback runs when a new connection is made to our HTTP server.

	fs.readFile("client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.

		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
//let liveusers = new Array();
let liveusers1 = new Array();
let liverooms = new Array();
let pararray = new Array();

var db = mysql.createConnection({
    host: 'localhost',
	user: 'wustl_inst',
	password: 'wustl_pass',
	database: 'chatroom',
})

io.sockets.on("connection", function(socket){

	// function to update page when new message is posted
	socket.on('message_to_server1', function(data) {
		db.query("SELECT * FROM users WHERE username='" + data["usrnm"] + "'")
			.on('result', function(res) {
				let user_id = res.user_id
				//console.log("adding new message: " + data["message"] );
				db.query("insert into messages (body, user_id, room_id) values ('" +  data["message"] + "', '" +  user_id + "', '" + data["roomid"] + "')",
				function(err) { if (err) console.log(err) });
				//console.log("calling update fun");
				updateMessages(data["usrnm"], data["roomid"]);  //only show new messages if users are in the same room
			});
	})


	// server function to return all active users
	socket.on('message_to_server2', function(data) {
		console.log("refresh new room live users..");
		let pause = 1000;
		let creator = "";
					let liveusers = [];
					db.query("SELECT username FROM users WHERE chatroom_id='" + data["roomid"] + "'")
							.on('result', function(res1){
								console.log(data["roomid"]);
								console.log(res1.username);
								console.log(liveusers);
								liveusers.push(res1.username);
							});

							db.query("SELECT creator_id from chatrooms where id='" + data["roomid"] + "'")
							.on('result', function(res2) {
								console.log("creator id: " + res2.creator_id);
								db.query("SELECT username from users where user_id='" + res2.creator_id + "'")
								.on('result', function(res3) {
									console.log("creator username: " + res3.username);
									creator = res3.username;
								});
							});

							db.query("SELECT name from chatrooms where id='" + data["roomid"] + "'")
							.on('result', function(res3){
								setTimeout(function() {
									console.log("USERS:" + liveusers + ' ROOM: ' + data["roomid"]);
									//io.to(data["roomid"]).emit("message_to_client12");
									//THIS IS THE PROBLEM AREa.. ITS NOT GETTING SENT ON LOGIN...
									io.to(data["roomid"]).emit("message_to_client2", {liveusers: liveusers, creator: creator, name: res3.name});
									//io.to(data["old_roomid"]).emit("message_to_client2", {liveusers: liveusers, creator: creator});
							})
	});
});

	// sql query to create new account
	socket.on('message_to_server4', function(data) {
		let x = true;
		let userarray = []
		// generating salt
		/*password('mysecret').hash(function(error, hash) {
			if (error) {
				throw new Error("something went wrong");
				userarray.hash = hash;


			}
		})*/
		//check to see if username has already been taken
		db.query("SELECT username FROM users").on('result', function(res){
			//console.log("user:" + res.username + ":");
			if (res.username == data["usrnm"]){
				message = "username already in use";
				//console.log(message);
				x = false;
			}else if(res.username == ""){
				message = "invalid username";
				//console.log(message);
				x = false;
			}
		})
		var pause = 1000;
		//if username not taken, add to DB so user can log in
		setTimeout(function(){
			if(x){
				//console.log("new user added..");
				db.query("insert into users (username, password) values ('" +  data["usrnm"] + "', '" +  data["pswrd"] + "')",
				function(err) { if (err) console.log(err) });
			}else{
				io.to(data["roomid"]).emit("message_to_client7", {message: message});
			}
		}, pause)
	});

	// sql request to validate user login
	socket.on('message_to_server5', function(data) {
		db.query("SELECT password FROM users WHERE username='" +  data["username"] + "'")
			.on('result', function(res){
				let psw = res.password;
				if(psw == data["password"]){
					//console.log("its a mtch!");
					io.sockets.emit("message_to_client5", {success: true, username:data["username"]});
					updateChatrooms();
				}
				else {
					//console.log("not match");
					io.sockets.emit("message_to_client5", {success: false});
				}
			})
	});

	// user created chatrooms
	socket.on('message_to_server6', function(data) {
		let pause = 1000;
		let x = true;
		db.query("SELECT user_id FROM users WHERE username='" + data["username"] + "'")
			.on('result', function(res) {
				let user_id = res.user_id;
					//check if chatroom name is already taken
					db.query("SELECT name FROM chatrooms")
						.on('result', function(res){
							//case that username is taken
							if(res.name == data["name"]){
								x = false;
								//console.log("Room name already exists..");
								io.to(data["roomid"]).emit("message_to_client8", {success: false});
							}
						});
						//if chatroom name is not taken, procede
						setTimeout(function() {
							if(x){
								//add new chatroom to db of chatrooms
								db.query("INSERT into chatrooms (name, creator_id, password) values ('" +  data["name"] + "', '" + user_id + "', '" +  data["password"] + "')",
								function(err) { if (err) console.log(err) });
								//get chatroom ID from chatroom name
								db.query("SELECT id FROM chatrooms WHERE name='" + data["name"] + "'")
									.on('result', function(res){
										//move user to new chatroom
										//console.log("users inserted into chatroom: " + res.id);
										db.query("UPDATE users set chatroom_id='" + res.id + "' where user_id='" +  + user_id + "'",
										function(err) { if (err) console.log(err) });
									})
							}
						}, pause);
			});
			//console.log("rooms should be updated..");
			setTimeout(function() {
				//console.log("rooms updated");
				updateChatrooms();
			}, 3000);
	});

	// changes sockets for a given user
	socket.on('message_to_server8', function(data){
		var pause = 1000;
		db.query("SELECT user_id FROM users WHERE username='" + data["username"] + "'")
			.on('result', function(res) {
				let user_id = res.user_id;
					//leave old room and join new one
					socket.leave(data["old_roomid"]);
					//console.log("joined socket room: " + data["roomid"]);
					socket.join(data["roomid"]);
					io.to(data["roomid"]).emit("message_to_client10", {success: false});
					db.query("UPDATE users set chatroom_id='" + data["roomid"] + "' where user_id='" +  + user_id + "'",
					function(err) { if (err) console.log(err) });
			});
			setTimeout(function() {
				updateMessages(data["username"], data["roomid"]), pause
			})
	})

	// function to retrieve live users in the same chat room
	socket.on('message_to_server12', function(data) {
		//console.log("INSIDE SERVER2 FUNC");
		let bool = true;
		let pause = 2000;
		let creator = "";
		for (i=0; i<liveusers1.length; ++i) {
			if (liveusers1[i] == data["usrnm"]) {
				bool = false;

			}
		}
		if (bool) {
			liveusers1 = [];
			db.query("SELECT username FROM users WHERE chatroom_id='" + data["roomid"] + "'")
				.on('result', function(res1){
					liveusers1.push(res1.username);
				})
			db.query("SELECT creator_id FROM chatrooms WHERE id='" + data["roomid"] + "'")
				.on('result', function(res2) {
					db.query("SELECT username FROM users WHERE user_id='" + res2.creator_id + "'")
						.on('result', function(res3) {
							creator = res3.username;
						})
				})
		}
		setTimeout(function() {
			//console.log("LIVE USERS1:" + liveusers1 + ' ROOM: ' + data["roomid"]);
			io.to(data["roomid"]).emit("message_to_client2", {liveusers: liveusers1, creator: creator});
		}, pause);
	});

	//	message to client to see if user = user to be kicked
	socket.on('message_to_server13', function(data){
		//console.log("kick this guy: " +data["username"]+" from room " + data["roomid"]);
		io.to(data["roomid"]).emit("message_to_client13", {roomid: data["roomid"], username: data["username"]});
	});

	// passes whispered messages to client side
	socket.on('message_to_server14', function(data) {
		//console.log("whisper info: " + data["sender"] + " " + data["recipient"] + " " + data["body"]);
		io.sockets.emit("message_to_client14", {sender: data["sender"], recipient: data["recipient"], body: data["body"]});
	})

	// changes sql chatroom placement for a given user
	socket.on('message_to_server15', function(data) {
		db.query("SELECT user_id FROM users WHERE username='" + data["username"] + "'")
			.on('result', function(res) {
				let user_id = res.user_id;
				db.query("UPDATE users set chatroom_id='" + 1 + "' where user_id='" +  + user_id + "'",
				function(err) { if (err) console.log(err) });
			});
		})

	// updates chatrooms
	function updateChatrooms() {
		//console.log("INSIDE UPDATE ROOM FUNC");
		let pause = 1000;
		let array2 = new Array();
		let messages_array = new Array();
		db.query("SELECT * from chatrooms")
			.on('result', function(res) {
				let array = new Array();
				//console.log(res);
				array.push(res["name"], res["id"], res["creator_id"], res["password"]);
				//DOES THIS DO ANYTHING? ***
				//for (i=0; i<liverooms.length; i++) {
				//}
				array2.push(array);
			});
			//send all chatroom data to client to display buttons
		setTimeout(function() {
			//console.log("sending message to c6..");
			//console.log(array2);
		io.sockets.emit("message_to_client6", array2);
		}, pause);
	}

	// updates message board
	function updateMessages(username, roomid) {
		//console.log("server side updtae message func called");
		//get user id & chatroom
		//console.log("room: " + roomid + " user: " + username);
		//get all messages associated with chatroom id
		io.to(roomid).emit("message_to_client10", {success: false});
		db.query("SELECT * FROM messages WHERE room_id='" + roomid + "'")
			.on('result', function(res){
				//send to client only messages from current room
				db.query("SELECT username FROM users WHERE user_id='" + res.user_id + "'")
					.on('result', function(res1){
						io.to(roomid).emit("message_to_client1",{message:res.body, user:res1.username});
					})
			});
	}

});
