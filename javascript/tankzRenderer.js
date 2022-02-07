/* TANKZ FRONTEND CODE FOR RENDERING THE GAME */

/* Glob vars*/
var container = null;
var canvas = null;
var ctx = null;

var tankWidth = 50;
var tankHeight = 78.33;
var bulletRadius = 5;

/*Main*/
function draw(gameInfo){
	if(!ctx){
    	setupCanvas();  
    }
  	ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  
  	//BULLETS
  	for(let i = 0; i < gameInfo.bullets.length; i++){
      ctx.beginPath();
      ctx.arc(gameInfo.bullets[i].x, gameInfo.bullets[i].y, bulletRadius, 0, 2*Math.PI, false);
      ctx.fillStyle = "black";
      ctx.fill();  
    }
  
  	//TANKS
  	for(let i = 0; i < gameInfo.tanks.length; i++){
      ctx.save();
      ctx.translate(gameInfo.tanks[i].x + tankWidth/2, gameInfo.tanks[i].y + tankHeight/2);			//set canvas to center of img
      ctx.rotate(degToRad(gameInfo.tanks[i].rotation));
      ctx.translate(-(gameInfo.tanks[i].x + tankWidth/2), -(gameInfo.tanks[i].y + tankHeight/2)); 	//translate back
      let img = new Image;
      img.src = gameInfo.tanks[i].sprite;
      ctx.drawImage(img, gameInfo.tanks[i].x, gameInfo.tanks[i].y, tankWidth, tankHeight);
      ctx.restore();
      
      //draw name
      ctx.textAlign = "center";
      ctx.fillText(gameInfo.tanks[i].name, gameInfo.tanks[i].x + tankWidth/2, gameInfo.tanks[i].y - 10);
    }
  
  	//SCOREBOARD
  	let scoreboardElem = document.getElementById("scoreboard");
  	while(scoreboardElem.lastChild){
      scoreboardElem.removeChild(scoreboardElem.lastChild);
    } 	
  	for(let i = 0; i < gameInfo.score.length; i++){
      //update the scoreboard
      let score = document.createElement("span");
      score.className = "scoreElem";
      score.style.color = gameInfo.score[i].color;
      score.textContent = gameInfo.score[i].points;
      scoreboardElem.appendChild(score);  
    }
  
  	//WALLS
    for(let i = 0; i < gameInfo.walls.length; i++){
      this.ctx.beginPath();
      this.ctx.moveTo(gameInfo.walls[i].startX, gameInfo.walls[i].startY);
      this.ctx.lineTo(gameInfo.walls[i].endX, gameInfo.walls[i].endY);
      this.ctx.lineWidth = 4;
      this.ctx.stroke();
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