/* CLIENT AND GAME CLASSES FOR SERVERSIDE */
const tankz = require("./tankz.js");		

class Client{
  	//VARS
 	clientId = null;
	connection = null;
  	game = null;
  	tank = null;

	playerInfo = {};

	//METHODS
 	constructor(clientId, connection){
   		this.clientId = clientId;
      	this.connection = connection;
    }
	setName(name){
		this.playerInfo.name = name;
    }
	setColor(color){
     	this.playerInfo.color = color; 
    }
  	setGame(game){
      	this.game = game;
    }
  	setTank(tank){
     	this.tank = tank; 
    }
}
class Game{
 	//VARS
  	gameId = null;
  	gameState = null;
  	isActive = false;
  
  	players = [];
  	gameInfo = {};

	//METHODS
	constructor(gameId){
    	this.gameId = gameId;  
      	this.gameInfo.gameId = gameId;
      	this.gameInfo.players = [];
    }
  	addPlayer(player){
      	this.players.push(player);
      	this.gameInfo.players.push(player.playerInfo);
      	player.setGame(this);
      	if(this.isActive){
          //Add tank to active game (kinda skuffed rn)
          this.gameState.tanks.push(new tankz.Tank());
          player.setTank(this.gameState.tanks[this.gameState.tanks.length - 1]); 
          
          //redo all the colors
          for(let i = 0; i < this.gameState.tanks.length; i++){
             let color = {"0": "red", "1": "green", "2": "blue"}[i];
             this.gameState.tanks[i].setColor(color);
             this.gameState.tanks[i].setName(player.playerinfo.name);
           	 this.gameState.tanks[i].setSprite("https://aydencolby.com/projects/tankz/images/"+color+"tank.png");
          }
        }
    }
  	removePlayer(player){
        let index = this.players.indexOf(player);
        if (index > -1) {
          this.players.splice(index, 1); // 2nd parameter means remove one item only
        }
      
      	if(this.isActive){
         	//delete the player from the actual game ugh
          	index = this.gameState.removeTank(player.tank);
        }
      
      	index = this.gameInfo.players.indexOf(player.playerInfo);
        if (index > -1) {
          this.gameInfo.players.splice(index, 1); // 2nd parameter means remove one item only
        }

      	player.setGame(null);
    }
  	startGame(gameState){
      	this.gameState = gameState;
      	this.isActive = true;
      	
      	//setup known tanks
      	let tanks = [];
      	for(let i = 0; i < this.players.length; i++){
          	tanks.push(new tankz.Tank());
          	tanks[i].setColor(this.players[i].playerInfo.color);
          	tanks[i].setName(this.players[i].playerInfo.name);
          	tanks[i].setSprite("https://aydencolby.com/projects/tankz/images/"+this.players[i].playerInfo.color+"tank.png");
          
          	this.players[i].setTank(tanks[i]);
        }
      	this.gameState.setTanks(tanks);
    }
}

module.exports = {
  Client : Client,
  Game: Game
}