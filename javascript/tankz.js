/* TANKZ GAME CODE, SERVER SIDE */
/*GAME BACKEND CODE, has the GameState, Tank, and Bullet classes*/
const Maze = require("./maze.js");

class GameState{
  	wallArray = null;
 	gameState =  null;
  	tanks = [];
  	aliveTanks = [];
  
  	canvasW = 1800;
  	canvasH = 800;
  	
  	newMap = false;
  
  	constructor(){
      	this.gameState = "loading map";
    }
  	setTanks(tanks){
     	this.tanks = tanks; 
    }
    readMapChange(){
        this.newMap = false;    
    }
  	update(){
      //MAIN GAME LOOP
      if(this.gameState == "loading map"){
        //maze setup
        let maze = new Maze.Maze(this.canvasW,this.canvasH,6,12);
      	maze.setup();
      	this.wallArray = maze.wallArray;
        
        //Find suitable spawn for tanks
        for(var i = 0; i < this.tanks.length; i++){
          var newX = Math.random() * this.canvasW;
          var newY = Math.random() * this.canvasH;
          var newRotation = Math.random() * 360;

          if(this.tanks[i].checkIfInBounds(this.tanks[i].getCorners(newX, newY, newRotation), this.wallArray, this.canvasW, this.canvasH)){
            this.tanks[i].x = newX;
            this.tanks[i].y = newY;
            this.tanks[i].rotation = newRotation;
            this.tanks[i].isAlive = true;
          }
          else{
            i -= 1;
          }
        }
      	//Load in the tanks
      	this.aliveTanks = this.tanks.slice();
      
        this.gameState = "playing";
        this.newMap = true;
      }
      else if(this.gameState == "playing" || this.gameState == "finishing round"){
        if(this.aliveTanks.length <= 1 && this.gameState != "finishing round" && this.aliveTanks.length != this.tanks.length){
          this.gameState = "finishing round";
          var that = this;
          setTimeout(function(){that.gameState = "calculate points";}, 3000);
        }

        /* MOVEMENT HANDLING */
        for(let i = 0; i < this.tanks.length; i++){
          if(this.tanks[i].isAlive){
            if(this.tanks[i].keys.left == true && this.tanks[i].keys.right == false){
          		this.tanks[i].changeRotation(-2.5, this)
          	}
            else if(this.tanks[i].keys.left == false && this.tanks[i].keys.right == true){
              	this.tanks[i].changeRotation(2.5, this)
            }
            
            let yTrig = Math.cos(degToRad(this.tanks[i].rotation))
            let xTrig = Math.sin(degToRad(this.tanks[i].rotation))
            if(this.tanks[i].keys.up == true && this.tanks[i].keys.down == false){
              this.tanks[i].changePositionY(yTrig * -3, this);
              this.tanks[i].changePositionX(xTrig * 3, this);
            }
            else if(this.tanks[i].keys.up == false && this.tanks[i].keys.down == true){
              this.tanks[i].changePositionY(yTrig * 3, this);
              this.tanks[i].changePositionX(xTrig * -3, this);
            }
            else if(this.tanks[i].keys.up == true && this.tanks[i].keys.down == true){
              this.tanks[i].changePositionY(yTrig * -1, this);
              this.tanks[i].changePositionX(xTrig * 1, this);
            }
          }
        }

		/* UPDATE BULLETS & TANK ALIVENESS (skuffed)*/
        for(let i = 0; i < this.aliveTanks.length; i++){
         	if( !this.aliveTanks[i].isAlive ){
              this.aliveTanks.splice(i, 1);
              i -= 1;
            }
        }
        for(let i = 0; i < this.tanks.length; i++){
         	for(let j = 0; j < this.tanks[i].bulletArr.length; j++){
              	 if(this.tanks[i].bulletArr[j].isDestroyed){
                 	this.tanks[i].removeBullet(this.tanks[i].bulletArr[j]);
                   	continue;
                 }
             	 this.tanks[i].bulletArr[j].update(this.canvasW, this.canvasH, this.wallArray, this.aliveTanks);
            }
        }
        
      }
      else if(this.gameState == "calculate points"){
        if(this.aliveTanks.length == 1){
          this.aliveTanks[0].addPoints(1);
        }
        for(var i = 0; i < this.tanks.length; i++){
          this.tanks[i].bulletArr = [];
        }
        this.gameState = "loading map";
      }
    }
  	removeTank(tank){
     	let index = this.tanks.indexOf(tank);
      	if (index > -1) {
          this.tanks.splice(index, 1); // 2nd parameter means remove one item only
        }
      
      	index = this.aliveTanks.indexOf(tank);
      	if (index > -1) {
          this.aliveTanks.splice(index, 1); // 2nd parameter means remove one item only
        }
    }
  	getMapInfo(){
    	//Get info that only needs to be updated when there is a new level
    	let returner = {}
    	
    	//WALLS, need an array of 'walls' each containing a startX, startY, endX, endY
      	returner.walls = [];
      	for(let i = 0; i < this.wallArray.length; i++){
        	let wallData = {};
          	wallData.startX = this.wallArray[i].startX;
          	wallData.startY = this.wallArray[i].startY;
          	wallData.endX = this.wallArray[i].endX;
          	wallData.endY = this.wallArray[i].endY;
          	returner.walls.push(wallData);
        }
        
        //TANKS, need sprite, color, and name
        returner.tanks = [];
        for(let i = 0; i < this.tanks.length; i++){
        	let tankData = {};
          	tankData.sprite = this.tanks[i].sprite;
          	tankData.color = this.tanks[i].color;
          	tankData.name = this.tanks[i].name;
          	returner.tanks.push(tankData);
        }
        
      	//SCORE, need score and color
      	returner.score = [];
      	for(let i = 0; i < this.tanks.length; i++){
        	let scoreData = {};
          	scoreData.color = this.tanks[i].color;
          	scoreData.points = this.tanks[i].points;
          	returner.score.push(scoreData);
        }
        
        return returner;
    }
    getGameInfo(){
        //Get all the info that needs to be updated every tick
      	let returner = {}

      	//TANKS, need tank position, rotation
      	returner.tanks = [];
      	for(let i = 0; i < this.tanks.length; i++){
        	let tankData = {};
        	if(this.tanks[i].isAlive){
              	tankData.x = this.tanks[i].x;
              	tankData.y = this.tanks[i].y;
              	tankData.rotation = this.tanks[i].rotation;
              	tankData.id = i;
              	returner.tanks.push(tankData);
        	}
        }
      	
      	//BULLETS, need bullet position only for now
      	returner.bullets = [];
      	for(let i = 0; i < this.tanks.length; i++){
        	for(let j = 0; j < this.tanks[i].bulletArr.length; j++){
            	let bulletData = {};
              	bulletData.x = this.tanks[i].bulletArr[j].x;
              	bulletData.y = this.tanks[i].bulletArr[j].y;
              	returner.bullets.push(bulletData);
            }
        }
      
      	return returner;
    }
}

/* Le Tank and bullet code (probably skuffed cuz old)*/
class Tank{
  width = 172/3.5;
  height = 274/3.5;
  bulletArr = [];
  isAlive = false;
  points = 0;
  color = "";
  name = "";
  keys = {};

  constructor(){
    this.keys.left = false;
    this.keys.right = false;
    this.keys.up = false;
    this.keys.down = false;
  }
  setSprite(sprite){
    this.sprite = sprite;  
  }
  setColor(color){
  	this.color = color;  
  }
  setName(name){
  	this.name = name;  
  }
  getCorners(x, y, rotation){
    var cosTrig = Math.cos(degToRad(rotation))
    var sinTrig = Math.sin(degToRad(rotation))

    var centerX = x + this.width/2;
    var centerY = y + this.height/2;

    var barrelHeight = 13;

    var A = [centerX - this.width/2, centerY - this.height/2 + barrelHeight], B = [centerX + this.width/2, centerY - this.height/2 + barrelHeight], C = [centerX - this.width/2, centerY + this.height/2], D = [centerX + this.width/2, centerY + this.height/2];
    var corner = [A,B,C,D]
    for(var i = 0; i < corner.length; i++){
      var tempX = corner[i][0] - centerX;
      var tempY = corner[i][1] - centerY;

      var rotatedX = tempX*cosTrig - tempY*sinTrig;
      var rotatedY = tempX*sinTrig + tempY*cosTrig;

      corner[i][0] = rotatedX + centerX;
      corner[i][1] = rotatedY + centerY;
    }
    return corner;
  }
  checkIfInBounds(corners, wallArray, width, height){
    for(var i = 0; i < wallArray.length; i++){
      if(this.intersects(corners[0][0], corners[0][1], corners[1][0], corners[1][1], wallArray[i].startX, wallArray[i].startY, wallArray[i].endX, wallArray[i].endY)){
        return false;
      }
      else if(this.intersects(corners[1][0], corners[1][1], corners[2][0], corners[2][1], wallArray[i].startX, wallArray[i].startY, wallArray[i].endX, wallArray[i].endY)){
        return false;
      }
      else if(this.intersects(corners[2][0], corners[2][1], corners[3][0], corners[3][1], wallArray[i].startX, wallArray[i].startY, wallArray[i].endX, wallArray[i].endY)){
        return false;
      }
      else if(this.intersects(corners[3][0], corners[3][1], corners[0][0], corners[0][1], wallArray[i].startX, wallArray[i].startY, wallArray[i].endX, wallArray[i].endY)){
        return false;
      }
    }

    for(var i = 0; i < corners.length; i++){
      if(corners[i][0] < 0){
        return false;
      }
      else if(corners[i][0] > width){
        return false;
      }
      else if(corners[i][1] < 0){
        return false;
      }
      else if(corners[i][1] > height){
        return false;
      }
    }
    return true;
  }
  // returns true if the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
  intersects(a,b,c,d,p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };
  shoot(){
    if(this.bulletArr.length < 5){
      var x = this.x + this.width/2 + (30 * Math.cos(degToRad(this.rotation - 90))); 		//center + r*rotation ; Dont ask why rotation is -90 it just works
      var y = this.y + this.height/2 + (30 * Math.sin(degToRad(this.rotation - 90)));
      let bullet = new Bullet(x, y, this.rotation - 90, this);
      setTimeout(function(){bullet.destroy();}, 10000);
      this.bulletArr.push(bullet);
    }
  }
  removeBullet(bullet){
   	let index = this.bulletArr.indexOf(bullet);
    if(index >= 0){
     	this.bulletArr.splice(index, 1);
    }
  }
  changeRotation(changeInRotation, game){
    var newRotation = (this.rotation + changeInRotation)%360;
    if(this.checkIfInBounds(this.getCorners(this.x, this.y, newRotation), game.wallArray, game.canvasW, game.canvasH)){
      this.rotation = newRotation;
    }
  }
  changePositionX(changeInX, game){
    var newX = this.x + changeInX;
    if(this.checkIfInBounds(this.getCorners(newX, this.y, this.rotation), game.wallArray, game.canvasW, game.canvasH)){
      this.x = newX;
    }
  }
  changePositionY(changeInY, game){
    var newY = this.y + changeInY;
    if(this.checkIfInBounds(this.getCorners(this.x, newY, this.rotation), game.wallArray, game.canvasW, game.canvasH)){
      this.y = newY;
    }
  }
  destroy(){
    this.isAlive = false;
  }
  addPoints(amount){
    this.points += amount;
  }
}
class Bullet{
  speed = 4;
  radius = 5;
  lastBumpedIntoWallIndex = -1;
  isDestroyed = false;
  
  constructor(x, y, rotation){
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.xSpeed = Math.cos(degToRad(this.rotation)) * this.speed;
    this.ySpeed = Math.sin(degToRad(this.rotation)) * this.speed;
  }
  update(width, height, wallArray, aliveTankArr){
    if(this.x < 0 || this.x > width){
      this.xSpeed *= -1;
      this.lastBumpedIntoWallIndex = -1;
    }
    if(this.y < 0 || this.y > height){
      this.ySpeed *= -1;
      this.lastBumpedIntoWallIndex = -1;
    }
    for(var i = 0; i < wallArray.length; i++){
      if(wallArray[i].startX == wallArray[i].endX && i != this.lastBumpedIntoWallIndex){
        if(this.x - this.radius <= wallArray[i].startX && this.x + this.radius >= wallArray[i].startX){
          if(wallArray[i].startY <= this.y && wallArray[i].endY >= this.y){
            this.xSpeed *= -1;
            this.lastBumpedIntoWallIndex = i;
            break;
          }
        }
      }
      else if(wallArray[i].startY == wallArray[i].endY && i != this.lastBumpedIntoWallIndex){
        if(this.y - this.radius <= wallArray[i].startY && this.y + this.radius >= wallArray[i].startY){
          if(wallArray[i].startX <= this.x && wallArray[i].endX >= this.x){
            this.ySpeed *= -1;
            this.lastBumpedIntoWallIndex = i;
            break;
          }
        }
      }
    }

    this.x += this.xSpeed;
    this.y += this.ySpeed;
    
    this.checkColWithTank(aliveTankArr);
  }
  destroy(){
    this.isDestroyed = true;
  }
  checkColWithTank(aliveTankArr){
    for(var i = 0; i < aliveTankArr.length; i++){
      var corners = aliveTankArr[i].getCorners(aliveTankArr[i].x, aliveTankArr[i].y, aliveTankArr[i].rotation);

      if(this.isInRectangle(corners[0],corners[1],corners[2],corners[3], 3266.5)){
        aliveTankArr[i].destroy();
        this.destroy();
      }
    }
  }
  isInRectangle(A, B, C, D, area){
    var P = [this.x, this.y];
    var sum = 0;
    sum += this.getTriangleArea(A, P, D);
    sum += this.getTriangleArea(D, P, C);
    sum += this.getTriangleArea(C, P, B);
    sum += this.getTriangleArea(P, B, A);
    if(sum > area){
      return false;
    }
    else{
      return true;
    }
  }
  getTriangleArea(A, B, C){
    return Math.abs( (B[0] * A[1] - A[0] * B[1]) + (C[0] * B[1] - B[0] * C[1]) + (A[0] * C[1] - C[0] * A[1]) ) / 2
  }
}

function degToRad(degrees)
{
  return degrees * (Math.PI/180);
}
function radToDeg(radians)
{
  return radians * (180/Math.PI);
}

module.exports = {
  GameState : GameState,
  Tank : Tank,
  Bullet : Bullet
}
