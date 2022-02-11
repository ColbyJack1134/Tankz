/* TANKZ FRONTEND CODE FOR RENDERING THE GAME */

/* Glob vars*/
var container = null;
var canvas = null;
var ctx = null;

var tankWidth = 50;
var tankHeight = 78.33;
var bulletRadius = 5;

var tanks = [];
var walls = [];
var score = [];
var lastImgs = [];

/*Main*/
function draw(data){
    //console.log(data);
    
    //update vars if a new map
    if(data.newMap){
        walls = data.mapData.walls;             //wall positions
        score = data.mapData.score;             //score data
        tanks = data.mapData.tanks;             //tank sprite, color, name
        
        //update images
        for(let i = 0; i < tanks.length; i++){
            if(!lastImgs[i] || lastImgs[i].src != tanks[i].sprite){
                let img = new Image();
                img.src = tanks[i].sprite;
                lastImgs[i] = img;
            }
        }
    }
    else if(tanks.length > 0){
        //setup canvas if not set up
    	if(!ctx){
        	setupCanvas();  
        }
      	ctx.clearRect(0, 0, canvas.width, canvas.height);
      	
      	//Background grey
      	ctx.fillStyle = '#afafaf';
      	ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";            //reset fill
      
      	//BULLETS
      	for(let i = 0; i < data.gameData.bullets.length; i++){
          ctx.beginPath();
          ctx.arc(data.gameData.bullets[i].x, data.gameData.bullets[i].y, bulletRadius, 0, 2*Math.PI, false);
          //ctx.fillStyle = "black";
          ctx.fill();  
        }
      
        //WALLS
        for(let i = 0; i < walls.length; i++){
          this.ctx.beginPath();
          this.ctx.moveTo(walls[i].startX, walls[i].startY);
          this.ctx.lineTo(walls[i].endX, walls[i].endY);
          this.ctx.lineWidth = 4;
          this.ctx.stroke();
        }
      
      	//TANKS
      	for(let i = 0; i < data.gameData.tanks.length; i++){
          ctx.save();
          ctx.translate(data.gameData.tanks[i].x + tankWidth/2, data.gameData.tanks[i].y + tankHeight/2);			//set canvas to center of img
          ctx.rotate(degToRad(data.gameData.tanks[i].rotation));
          ctx.translate(-(data.gameData.tanks[i].x + tankWidth/2), -(data.gameData.tanks[i].y + tankHeight/2)); 	//translate back
          
          //CHANGE COLOR TEST
          //ctx.filter = "hue-rotate(90deg)";
          ctx.drawImage(lastImgs[data.gameData.tanks[i].id], data.gameData.tanks[i].x, data.gameData.tanks[i].y, tankWidth, tankHeight);
          //ctx.filter = "none";
          
          ctx.restore();
        
          //draw name
          ctx.textAlign = "center";
          ctx.fillText(tanks[data.gameData.tanks[i].id].name, data.gameData.tanks[i].x + tankWidth/2, data.gameData.tanks[i].y - 10);
        }
      
      	//SCOREBOARD
      	let scoreboardElem = document.getElementById("scoreboard");
      	while(scoreboardElem.lastChild){
          scoreboardElem.removeChild(scoreboardElem.lastChild);
        } 	
      	for(let i = 0; i < score.length; i++){
          //update the scoreboard
          let scoreElem = document.createElement("span");
          scoreElem.className = "scoreElem";
          scoreElem.style.color = score[i].color;
          scoreElem.textContent = score[i].points;
          scoreboardElem.appendChild(scoreElem);  
        }
    }
}

/*Other functions*/
function setupCanvas(){
  container = document.getElementById("screenContainer");            //master container div
  canvas = document.getElementById("canvas");                        //canvas
  ctx = canvas.getContext("2d");                                     //canvas context
}
function degToRad(degrees)
{
  return degrees * (Math.PI/180);
}
function radToDeg(radians)
{
  return radians * (180/Math.PI);
}