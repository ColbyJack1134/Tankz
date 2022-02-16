/* TANKZ FRONTEND CODE FOR RENDERING THE GAME */

/* Glob vars*/
var container = null;
var canvas = null;
var ctx = null;

var tankWidth = 172/3.5;
var tankHeight = 274/3.5;
var bulletRadius = 5;

var tanks = [];
var walls = [];
var score = [];
var tanksRender = [];

var offscreenCanvas = document.createElement('canvas');
var offscreenCtx = offscreenCanvas.getContext('2d');
var baseImg = new Image();
baseImg.src = "../images/color-base.png";

/*Main*/
var iterator = 0;
function draw(data){
    //console.log(data);
    
    //update vars if a new map
    if(data.newMap){
        console.log(data);
        walls = data.mapData.walls;             //wall positions

        //update tanks render so you dont have to render them every 10ms 
        for(let i = 0; i < data.mapData.tanks.length; i++){
            if(!tanks[i] || !tanksRender[i] || tanks[i].sprite != data.mapData.tanks[i].sprite || tanks[i].color != data.mapData.tanks[i].color){
                //render the tank in its own canvas
                let tankCanvas = document.createElement('canvas');
                let tankCtx = tankCanvas.getContext('2d');
                
                tankCtx.fillStyle = "hsl("+data.mapData.tanks[i].color+", 100%, 50%)";
                tankCtx.fillRect(0, 0, tankCanvas.width, tankCanvas.height);
                
                //draw base img outline in whatever color
                tankCtx.globalCompositeOperation = "destination-in";
                tankCtx.drawImage(baseImg, 0,0, tankCanvas.width, tankCanvas.height);
                  
                //reset mode
                tankCtx.globalCompositeOperation = "source-over";
                  
                //draw img (once img loads)
                let tankImg = new Image();
                tankImg.src = data.mapData.tanks[i].sprite;
                tanksRender[i] = tankCanvas;
                tankImg.onload = function(){tankCtx.drawImage(tankImg, 0,0, tankCanvas.width, tankCanvas.height);}
            }
        }
        tanks = data.mapData.tanks;             //tank sprite, color, name
        
        //SCOREBOARD
        score = data.mapData.score;             //score data
        let scoreboardElem = document.getElementById("scoreboard");
      	while(scoreboardElem.lastChild){
          scoreboardElem.removeChild(scoreboardElem.lastChild);
        } 
        for(let i = 0; i < score.length; i++){
            //update the scoreboard
            let scoreElem = document.createElement("span");
            scoreElem.className = "scoreElem";
            scoreElem.style.color = "hsl("+score[i].color+", 100%, 50%)";
            scoreElem.textContent = score[i].points;
            scoreboardElem.appendChild(scoreElem);  
        }
    }
    else if(tanks.length > 0){
        //setup canvas if not set up
    	if(!ctx){
        	setupCanvas();  
        }
      	ctx.clearRect(0, 0, canvas.width, canvas.height);
      	
      	//Background grey
      	ctx.fillStyle = '#e6e6e6';
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
          
          // draw takk render
          ctx.drawImage(tanksRender[data.gameData.tanks[i].id], data.gameData.tanks[i].x, data.gameData.tanks[i].y, tankWidth, tankHeight);
    
          //ctx.filter = "hue-rotate("+tanks[data.gameData.tanks[i].id].color+"deg)";
          //ctx.drawImage(lastImgs[data.gameData.tanks[i].id], data.gameData.tanks[i].x, data.gameData.tanks[i].y, tankWidth, tankHeight);
          
          ctx.restore();
        
          //draw name
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.fillText(tanks[data.gameData.tanks[i].id].name, data.gameData.tanks[i].x + tankWidth/2, data.gameData.tanks[i].y - 10);
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