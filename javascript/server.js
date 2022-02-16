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
    setSprite(sprite){
        this.playerInfo.sprite = sprite;
    }
    setHost(val){
        this.playerInfo.isHost = val;
    }
}
class Game{
 	//VARS
  	gameId = null;
  	gameState = null;
  	isActive = false;
  
  	players = [];
  	gameInfo = {};
  	
  	availableColors;

	//METHODS
	constructor(gameId){
    	this.gameId = gameId;  
      	this.gameInfo.gameId = gameId;
      	this.gameInfo.players = [];
      	
      	this.availableColors = [0, 231, 128, 282, 51, 25, 180, 304, 28];
    }
  	addPlayer(player){
      	this.players.push(player);
      	this.gameInfo.players.push(player.playerInfo);
      	player.setGame(this);
      	
      	let colorPicked = Math.floor(Math.random()*this.availableColors.length);
      	player.setColor(this.availableColors[colorPicked]);
      	this.availableColors.splice(colorPicked, 1);
      	
      	if(this.isActive){
          //Add tank to active game (kinda skuffed rn)
          this.gameState.tanks.push(new tankz.Tank());
          player.setTank(this.gameState.tanks[this.gameState.tanks.length - 1]); 
          
          //set name
          player.tank.setName(player.playerInfo.name);
          player.tank.setColor(player.playerInfo.color);
   	      player.tank.setSprite(player.playerInfo.sprite);
          
          //redo all the colors
          /*for(let i = 0; i < this.gameState.tanks.length; i++){
             let color = 0;
            if(i < 5){
                color = i*72;
            }
            else{
                color = ( i%5 * 72 ) - 36;
            }
             this.gameState.tanks[i].setColor(color);
           	 this.gameState.tanks[i].setSprite(player.playerInfo.sprite);
          }*/
        }
    }
  	removePlayer(player){
        let index = this.players.indexOf(player);
        if (index > -1) {
          this.players.splice(index, 1); // 2nd parameter means remove one item only
          this.availableColors.push(player.playerInfo.color);
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
          	tanks[i].setSprite(this.players[i].playerInfo.sprite);
          
          	this.players[i].setTank(tanks[i]);
        }
      	this.gameState.setTanks(tanks);
    }
}

module.exports = {
  Client : Client,
  Game: Game
}
