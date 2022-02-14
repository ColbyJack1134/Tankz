/* HANDLES ALL THE SERVER SIDE STUFF: html, websockets, etc */
/* TODOS
*	Color stuff is skuffed rn, would be nice to have a custom color / also sprite
*/

/* IMPORTS */

const http = require("http");								//listener
const app = require("express")();							//serves pages
const websocketServer = require("websocket").server;		//websocket
const tankz = require("./javascript/tankz.js");				//tankz game library
const server = require("./javascript/server.js");			//game and client classes

/*HTTP STUFF*/
/* Redirect HTTPS to HTTP, doesn't totally work the first time idk why */
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        if (req.headers['x-forwarded-proto'] !== 'http'){
            // the instructions to perform redirection will be located here
            return res.redirect('http://' + req.headers.host + req.url);
        }
        else{
            // if https is already being used, we simply move on to the next phase in the app's logic cycle
            return next(); 
        }
    } else
        return next();
});
app.get("", (req, res)=>res.sendFile(__dirname + "/index.html"));									//landing page
app.get("/javascript/tankzRenderer.js", (req, res)=>res.sendFile(__dirname+"/javascript/tankzRenderer.js"));
app.get("/images/*", (req, res)=>res.sendFile(__dirname + "/images/" + req.params[0]));			//img folder
app.get("/iframes/*", (req, res)=>res.sendFile(__dirname + "/iframes/" + req.params[0]));			//iframes folder
app.listen("80", ()=>console.log("HTTP listeneing on port 80"));										//http server on port 8001

const clients = {};			//all the clients
const games = {}; 			//all the games
const activeGames = {};		//active games

/*WEBSOCKET STUFF*/
const httpServer = http.createServer();
httpServer.listen(8000, () => console.log("Websocket listening on port 8000"));								//websocket on port 8000
const wsServer = new websocketServer({
  "httpServer": httpServer
})

wsServer.on("request", request => {
  const connection = request.accept(null, request.origin);
  
  connection.on("close", () => {
  	/*CONNECTION CLOSED*/
    //Find player associated with connection
    for (const clientId in clients) {
  		if(clients[clientId].connection === connection){
          	//Find game and check if it is empty / update it
          	let game = clients[clientId].game;
          	if(game != null){
              game.removePlayer(clients[clientId]);
              if(game.players.length == 0){
                  //delete game if no players
                  delete games[game.gameId]; 
                  if(game.isActive){
                      delete activeGames[game.gameId]; 
                  }
                  logLobby(game.gameId, false, game.isActive);
              }
              else if(game.isActive){
                    //update the map bc a person left
                  	let payload = {
                        "method": "update",
                        "newMap": true,
                        "mapData": game.gameState.getMapInfo()
                    }
                    game.players.forEach(c=> {
                      sendPayload(c, payload);
                    })
              }
              else{
                  //update gameinfo to players if not
                  let payload = {
                      "method": "join",
                      "gameInfo": game.gameInfo
                  }

                  //loop through all clients to tell them ppl have joined
                  game.players.forEach(c=> {
                      payload["color"] = c.playerInfo.color;
                      sendPayload(c, payload);
                  })
              }
            }
          	delete clients[clientId];
          	logUser(clientId, false);
        }
	}
  })
  connection.on("message", message => {
    /*MESSAGE RECEIVED*/
    const result = JSON.parse(message.utf8Data);
    
    //Playerinfo
    if(result.method === "sendInfo"){
        const clientId = result.clientId;
        const name = result.name;
        const tank = result.tank;
        
        clients[clientId].setName(name);
        clients[clientId].setSprite("../images/tank-"+tank+".png");
    }
    //CREATE
    else if(result.method === "create"){
     	//user wants to create a new game
      	const clientId = result.clientId;
      	const gameId = genRanCode(5);
      
      	games[gameId] = new server.Game(gameId);
      	logLobby(gameId, true, false);
      
      	const payload = {
         	"method": "create",
          	"game" : games[gameId].gameInfo
        }
        
        sendPayload(clients[clientId], payload);
    }
    //JOIN
    else if(result.method === "join"){
    	//user wants to join game
      	
      	const clientId = result.clientId;
      	const gameId = result.gameId;
      
      	let game = games[gameId];
      	if(game == null || game.players.length >= 9){
          	//game no exist or too many players
          	let payload = {
         		"method": "join",
          		"error": "ERROR"
        	}
            sendPayload(clients[clientId], payload);
         	return; 
        }
      	else if(game.isActive){
          	game.addPlayer(clients[clientId]);
          	
          	//update the map bc a new person joined
          	let payload = {
                "method": "update",
                "newMap": true,
                "mapData": game.gameState.getMapInfo()
            }
            game.players.forEach(c=> {
              sendPayload(c, payload);
            })
          	return;
        }
        
        if(game.players.length == 0){
            clients[clientId].setHost(true);
        }
        else{
            clients[clientId].setHost(false);
        }
      	game.addPlayer(clients[clientId]);
      
      	let payload = {
         	"method": "join",
          	"gameInfo": game.gameInfo
        }
      
      	//loop through all clients to tell them ppl have joined
      	game.players.forEach(c=> {
          	payload["color"] = c.playerInfo.color;
          	payload["isHost"] = c.playerInfo.isHost;
          	sendPayload(c, payload);
        })
    }
    //START GAME
    else if(result.method === "start"){
      	const gameId = result.gameId;
      	const clientId = result.clientId;
      	if(clients[clientId].playerInfo.isHost){
          	activeGames[gameId] = games[gameId];
          	activeGames[gameId].startGame(new tankz.GameState());
          	logLobby(gameId, true, true);
          
          	let payload = {
             	"method": "update",
              	"gameState": activeGames[gameId].gameState
            }
          	activeGames[gameId].players.forEach(c=> {
              sendPayload(c, payload);
            })
          
          	if(Object.keys(activeGames).length == 1){
              	console.log("\n\n[+] Starting game update loop");
             	updateActiveGames(); 
            }
        }
    }
    //Player Input
    else if(result.method === "input"){
    	const gameId = result.gameId;
      	const clientId = result.clientId;
      	const input = result.input;
      
      	if(result.mode === "press"){
          	if(result.key == "left"){
              	clients[clientId].tank.keys.left = true;  
            }
          	else if(result.key == "right"){
              	clients[clientId].tank.keys.right = true;	  
            }
         	else if(result.key == "up"){
              	clients[clientId].tank.keys.up = true;	  
            }
          	else if(result.key == "down"){
              	clients[clientId].tank.keys.down = true;	  
            }
          	else if(result.key == "space"){
             	if(clients[clientId].tank.isAlive){
            		clients[clientId].tank.shoot();
            	} 
            }
        }else if(result.mode === "release"){
          	if(result.key === "left"){
              	clients[clientId].tank.keys.left = false;  
            }
          	else if(result.key === "right"){
              	clients[clientId].tank.keys.right = false;	  
            }
          	else if(result.key == "up"){
              	clients[clientId].tank.keys.up = false;	  
            }
          	else if(result.key == "down"){
              	clients[clientId].tank.keys.down = false;	  
            }
        } 	
    }
    //CHAT SYSTEM WOOP
    else if(result.method === "sendChat"){
        const gameId = result.gameId;
      	const clientId = result.clientId;
      	const message = result.message;
      	
      	const game = games[gameId];
      	const client = clients[clientId];
      	
      	game.players.forEach(c=> {
      	    //send each player the new chat message
      	    let payload = {
      	        "method":"newChat",
      	        "username":client.playerInfo.name,
      	        "message":message,
      	        "color":clients[clientId].tank.color
      	    }
      	    
          	sendPayload(c, payload);
        });
    }
  })
  
  /*HANDLE INITIAL CONNECTION*/
  //generate a new clientId
  const clientId = guid();
  clients[clientId] = new server.Client(clientId, connection);
  
  const payload = {
   	"method": "connect",
    "clientId": clientId
  }
  
  //send back client connect
  sendPayload(clients[clientId], payload);
  logUser(clientId, true);
})

/* FUNCTIONS */
function sendPayload(client, payload){
  client.connection.send(JSON.stringify(payload));
}
//Loop that basically updates each game and sends clients game info
function updateActiveGames(){
  if(Object.keys(activeGames).length == 0){
    console.log("\n\n[-] Ending game update loop");
   	return; 
  }
  for (const gameId in activeGames) {
    activeGames[gameId].gameState.update();
    
    payload = {
        "method": "update",
        "newMap": false
    }
    //update level data
    if(activeGames[gameId].gameState.newMap){
        payload["newMap"] = true;
        payload["mapData"] = activeGames[gameId].gameState.getMapInfo();
        
        activeGames[gameId].gameState.readMapChange();
    }
    //update position data
    else{
        payload["gameData"] = activeGames[gameId].gameState.getGameInfo()
    }
    activeGames[gameId].players.forEach(c=> {
      sendPayload(c, payload);
    })
  }
  setTimeout(updateActiveGames, 10);
}

//Logging
function logUser(clientId, connected){
  let createdStr = " Connected"
  if(!connected){
    createdStr = " Disconnected"
  }
  console.log("\n");
  console.log("Client " + clientId + createdStr);
  console.log("Total Clients: " + Object.keys(clients).length);
}
function logLobby(gameId, created, isActive){
  console.log("\n");
  if(isActive){
    let createdStr = " Started";
    if(!created){
      createdStr = " Ended"; 
    }
    console.log("Game " + gameId + createdStr);
  }
  else{
    let createdStr = " Created";
    if(!created){
      createdStr = " Destroyed"; 
    }
    console.log("Lobby " + gameId + createdStr);
  }
  console.log("Lobbies: " + Object.keys(games).length + "     Active Lobbies: " + Object.keys(activeGames).length);
}

/* Game code stuff */
const genRanCode = size => [...Array(size)].map(() => Math.floor(Math.random() * 36).toString(36)).join('');

/***guid stuff***/
function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
} 
// then to call it, plus stitch in '4' in the third group
const guid = () => (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
