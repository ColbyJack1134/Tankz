<html>
	<head>
    	<style>
        	:root {
            	--x-pos = 0;
                --y-pos = 0;
                --rotation = 0;
            }
        	body{
            	overflow:hidden;
            }
            #screenContainer{
            	position:absolute;
            	border: 5px solid black;
                left:50%;
                top:50%;
                width:1800px;
                height:800px;
                transform:translate(-50%, -50%);
                overflow:hidden;
            }
            #canvas{

            }
            .tank{
            	position:absolute;
                width: 50px;
            }
            .bullet{
            	transform: translate(-50%, -50%);
            	position:absolute;
                z-index:-1;
                width: 10px;
            }
        </style>

    </head>
    <body>
    	<div id="screenContainer">
        	<canvas id="canvas" width="1800px" height="800px"></canvas>

       		<img id="redtank" class="tank" src="redtank.png">
            <img id="greentank" class="tank" src="greentank.png">
            <img id="blutank" class="tank" src="bluetank.png">
        </div>


      <script>
      	const container = document.getElementById("screenContainer");            //master container div
        const canvas = document.getElementById("canvas");                        //canvas
        const ctx = canvas.getContext("2d");                                     //canvas context
        var playerTank;                                                          //should contain a Tank which the player controls
        var tankArr = [];                                                        //should contain all the tanks in the lobby
        var aliveTankArr = [];                                                   //should contain all the currently alive tanks

      	class Tank{
        	width = 50;
            height = 78.33;
            bulletArr = [];
            isAlive = true;
            points = 0;

        	constructor(sprite, x, y, rotation){
            	/* store everything */
            	this.x = x;
                this.y = y;
                this.rotation = rotation;
                this.sprite = sprite;

                /* make the html element */
                let tankElem = document.createElement("img");
                tankElem.src = sprite;
                tankElem.className = "tank";
                container.appendChild(tankElem);
                this.obj = tankElem;
                this.setPosAndRot();
            }
            update(){
            	this.setPosAndRot();
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
            checkIfInBounds(corners){
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
                    else if(corners[i][0] > container.clientWidth){
                    	return false;
                    }
                    else if(corners[i][1] < 0){
                    	return false;
                    }
                    else if(corners[i][1] > container.clientHeight){
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
            setPosAndRot(){
            	/* All this to rotate the dumb img */
            	ctx.save();
              ctx.translate(this.x + this.width/2, this.y + this.height/2);			//set canvas to center of img
              ctx.rotate(degToRad(this.rotation));
              ctx.translate(-(this.x + this.width/2), -(this.y + this.height/2)); 	//translate back
              ctx.drawImage(this.obj, this.x, this.y, this.width, this.height);
              ctx.restore();

                /* Draw corners for debug */
                /*var corners = this.getCorners(this.x, this.y, this.rotation);

                for(var i = 0; i < corners.length; i++){
                  ctx.beginPath();
                  ctx.arc(corners[i][0], corners[i][1], 3, 0, 2*Math.PI, false);
                  ctx.fillStyle = "red";
                  ctx.fill();
                }*/
            }
            shoot(){
            	if(this.bulletArr.length < 5){
                  var x = this.x + this.obj.width/2 + (30 * Math.cos(degToRad(this.rotation - 90))); 		//center + r*rotation ; Dont ask why rotation is -90 it just works
                  var y = this.y + this.obj.height/2 + (30 * Math.sin(degToRad(this.rotation - 90)));
                  new Bullet(x, y, this.rotation - 90, this);
                }
            }
            changeRotation(changeInRotation){
            	var newRotation = (this.rotation + changeInRotation)%360;
                if(this.checkIfInBounds(this.getCorners(this.x, this.y, newRotation))){
            		this.rotation = newRotation;
                }
            }
            changePositionX(changeInX){
            	var newX = this.x + changeInX;
                if(this.checkIfInBounds(this.getCorners(newX, this.y, this.rotation))){
            		this.x = newX;
                }
            }
            changePositionY(changeInY){
            	var newY = this.y + changeInY;
                if(this.checkIfInBounds(this.getCorners(this.x, newY, this.rotation))){
            		this.y = newY;
                }
            }
            destroy(){
            	this.isAlive = false;
                var index = aliveTankArr.indexOf(this);
                if(index >= 0){
                  aliveTankArr.splice(index, 1);
                }
            }
            addPoints(amount){
              this.points += amount;
            }
        }
        class Bullet{
        	speed = 4;
            radius = 5;
            lastBumpedIntoWallIndex = -1;
        	constructor(x, y, rotation, owner){
            	this.x = x;
                this.y = y;
                this.rotation = rotation;
                this.xSpeed = Math.cos(degToRad(this.rotation)) * this.speed;
                this.ySpeed = Math.sin(degToRad(this.rotation)) * this.speed;
                this.owner = owner;

                this.owner.bulletArr.push(this);
                var that = this;
                this.timeoutFunc = setTimeout(function(){that.destroy();}, 5000);
            }
            update(){
            	if(this.x < 0 || this.x > container.clientWidth){
                	this.xSpeed *= -1;
                    this.lastBumpedIntoWallIndex = -1;
                }
                if(this.y < 0 || this.y > container.clientHeight){
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

            	  this.setPos();
                this.checkColWithTank();
            }
            setPos(){
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI, false);
                ctx.fillStyle = "black";
                ctx.fill();
			      }
            destroy(){
            	var index = this.owner.bulletArr.indexOf(this);
                if(index >= 0){
                  this.owner.bulletArr.splice(index, 1);
                  clearTimeout(this.timeoutFunc);
                }
            }
            checkColWithTank(){
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

        /* Le maze code */
        class Wall{
            constructor(startX, startY, endX, endY)
            {
                this.startX = startX;
                this.startY = startY;
                this.endX = endX;
                this.endY = endY;

            }
        }

        class Maze {
        	current;
            wallArray = [];
            constructor(width,height,rows,columns)
            {
                this.width = width;
                this.height = height;
                this.rows = rows;
                this.columns = columns;
                this.grid = []
                this.stack = []
            }

            setup()
            {
                for (let r = 0; r < this.rows; r++)
                {
                    let row = [];
                    for (let c = 0; c < this.columns; c++)
                    {
                      let cell = new Cell(r, c, this.grid, this.width, this.height);
                      row.push(cell);
                    }
                    this.grid.push(row);
                }
                this.current = this.grid[0][0];

            }

            draw()
            {
                //maze.width = this.width;
                //maze.height = this.height;
                //maze.style.background = "lightgrey";
                this.current.visited = true;

                for (let r = 0; r < this.rows; r++)
                {
                    for (let c = 0; c < this.columns; c++)
                    {
                      let grid = this.grid;
                      grid[r][c].show(this.width,this.height, this.rows, this.columns);

                    }
                  }

                  let next = this.current.checkNeighbours();
                  if (next)
                  {
                    next.visited = true;
                    // Add the current cell to the stack for backtracking
                    this.stack.push(this.current);


                    // This function compares the current cell to the next cell and removes the relevant walls for each cell
                    this.current.removeWalls(this.current, next);


                    // Set the nect cell to the current cell
                    this.current = next;
                  }
                  else if (this.stack.length > 0)
                  {
                    let cell = this.stack.pop();
                    this.current = cell;
                  }

                 this.removeRandom(0.40);

                  if (this.stack.length === 0)
                  {
                    return;
                  }

                  this.draw();
            }

            removeRandom(chance)
            {
              if(Math.random() < chance)
              {
                let a = Math.floor(this.columns * Math.random());
                let b = Math.floor(this.rows * Math.random());

                let first = this.grid[b][a];



                 let nei = first.checkNeighbours();

                if(typeof(nei) != 'undefined')
                 {
                 first.removeWalls(first,nei);
                 }


              }
            }

            wallCoordBuilder()
            {
              for (let r = 0; r < this.rows; r++) {
                  for (let c = 0; c < this.columns; c++){

                        let theCell  = this.grid[r][c] ;
                        let width = this.width;
                        let height = this.height;

                        let colNum = theCell.colNum;
                        let rowNum = theCell.rowNum;

                        let x =  (colNum * width) / this.columns;
                        let y =  (rowNum * height) / this.rows;

                       if(theCell.walls.topWall == true){
                       {
                          let tempWall = new Wall(x,y, x + width/this.columns, y)
                          this.wallArray.push(tempWall);
                       }
                       if(theCell.walls.rightWall == true)
                       {
                          let tempWall = new Wall(x + width / this.columns, y, x + width / this.columns, y + height / this.rows)
                          this.wallArray.push(tempWall);
                       }
                      if(theCell.walls.bottomWall == true)
                       {
                          let tempWall = new Wall(x, y + height / this.rows,x + width / this.columns, y + height / this.rows)
                          this.wallArray.push(tempWall);
                       }
                       if(theCell.walls.leftWall == true)
                       {
                          let tempWall = new Wall(x,y,x, y + height / this.rows)
                          this.wallArray.push(tempWall);
                       }


                  }


                  }
                }
            }
            removeDupes(){
            	for(var i = 0; i < this.wallArray.length; i++){
                	for(var j = i + 1; j < this.wallArray.length; j++){
                    	if(this.wallArray[i].startX == this.wallArray[j].startX && this.wallArray[i].endX == this.wallArray[j].endX && this.wallArray[i].startY == this.wallArray[j].startY && this.wallArray[i].endY == this.wallArray[j].endY){
                        	this.wallArray.splice(j, 1);
                            j -= 1;
                        }
                    }
                }
            }
        }
        class Cell
        {
            constructor(rowNum,colNum,parentGrid,width,height,)
            {
            this.rowNum = rowNum;
            this.colNum = colNum;
            this.visited = false;
            this.walls =
            {
              topWall: true,
              rightWall: true,
              bottomWall: true,
              leftWall: true,
            };
            this.parentGrid = parentGrid;
            this.width = width;
            this.height = height;
            }

            show(width,height, rows, columns)
            {
            let x = (this.colNum * width) / columns;
            let y = (this.rowNum * height) / rows;
            ctx.strokeStyle = "black";
            ctx.fillStyle = "lightgrey";
            ctx.lineWidth = 2;
            if (this.walls.topWall) this.drawTopWall( x, y, width,height, columns, rows);
            if (this.walls.rightWall) this.drawRightWall(x, y, width,height, columns, rows);
            if (this.walls.bottomWall) this.drawBottomWall(x,  y, width,height, columns, rows);
            if (this.walls.leftWall) this.drawLeftWall( x,  y, width,height, columns, rows);
            if (this.visited)
            {
              ctx.fillRect(x + 1 , y + 1 , width / columns - 2, height / rows - 2);
            }
            }

            drawTopWall(x, y, width, height, columns, rows) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + width / columns, y);
                ctx.stroke();
              }

              drawRightWall(x, y, width, height, columns, rows) {
                ctx.beginPath();
                ctx.moveTo(x + width / columns, y);
                ctx.lineTo(x + width / columns, y + height / rows);
                ctx.stroke();
              }

              drawBottomWall(x, y, width, height, columns, rows) {
                ctx.beginPath();
                ctx.moveTo(x, y + height / rows);
                ctx.lineTo(x + width / columns, y + height / rows);
                ctx.stroke();
              }

              drawLeftWall(x, y, width, height, columns, rows) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y + height / rows);
                ctx.stroke();
              }

              checkNeighbours()
              {
                let grid = this.parentGrid;
                let row = this.rowNum;
                let col = this.colNum;
                let neighbours = [];

                // The following lines push all available neighbours to the neighbours array
                // undefined is returned where the index is out of bounds (edge cases)






                let top = row !== 0 ? grid[row - 1][col] : undefined;
                let right = col !== grid[0].length - 1 ? grid[row][col + 1] : undefined;
                let bottom = row !== grid.length - 1 ? grid[row + 1][col] : undefined;
                let left = col !== 0 ? grid[row][col - 1] : undefined;

                // if the following are not 'undefined' then push them to the neighbours array
                if (top && !top.visited) neighbours.push(top);
                if (right && !right.visited) neighbours.push(right);
                if (bottom && !bottom.visited) neighbours.push(bottom);
                if (left && !left.visited) neighbours.push(left);

                // Choose a random neighbour from the neighbours array
                if (neighbours.length !== 0) {
                  let random = Math.floor(Math.random() * neighbours.length);
                  return neighbours[random];
                } else {
                  return undefined;
                }
              }

              removeWalls(cell1, cell2) {
                // compares to two cells on x axis
                let x = cell1.colNum - cell2.colNum;
                // Removes the relevant walls if there is a different on x axis
                if (x === 1) {
                  cell1.walls.leftWall = false;
                  cell2.walls.rightWall = false;
                } else if (x === -1) {
                  cell1.walls.rightWall = false;
                  cell2.walls.leftWall = false;
                }
                // compares to two cells on x axis
                let y = cell1.rowNum - cell2.rowNum;
                // Removes the relevant walls if there is a different on x axis
                if (y === 1) {
                  cell1.walls.topWall = false;
                  cell2.walls.bottomWall = false;
                } else if (y === -1) {
                  cell1.walls.bottomWall = false;
                  cell2.walls.topWall = false;
                }
              }
        }




      	/* Handle keypresses */
      	var up=false, down=false, left=false, right=false;
      	document.addEventListener('keydown',keypress)
        function keypress(e){
          if (e.keyCode === 38 || e.keyCode === 87){
            up = true
          }
          if (e.keyCode === 39 || e.keyCode === 68){
            right = true
          }
          if (e.keyCode === 40 || e.keyCode === 83){
            down = true
          }
          if (e.keyCode === 37 || e.keyCode === 65){
            left = true
          }
          if (e.keyCode == 32){		//space
          	if(playerTank.isAlive){
            	playerTank.shoot();
            }
          }
        }
      	document.addEventListener('keyup',keyrelease)
        function keyrelease(e){
          if (e.keyCode === 38 || e.keyCode === 87){
            up = false
          }
          if (e.keyCode === 39 || e.keyCode === 68){
            right = false
          }
          if (e.keyCode === 40 || e.keyCode === 83){
            down = false
          }
          if (e.keyCode === 37 || e.keyCode === 65){
            left = false
          }
        }


		/* epic variables */
        var newMaze;
        var wallArray;
        var gameState = "loading map";

		/* define le tanks */
        var redTank = new Tank("redtank.png", 50, 50, 0);
        tankArr.push(redTank);
        playerTank = redTank;
        
        var blueTank = new Tank("bluetank.png", 100, 100, 0);
        tankArr.push(blueTank);
        
        
        //need this at the end
        aliveTankArr = tankArr.slice();

        /* Main game loop */
        setInterval(function(){updateFrame();}, 10);
        function updateFrame(){
          if(gameState == "loading map"){
            //Set up the maze
            newMaze = new Maze(canvas.width,canvas.height,6,12);
            newMaze.setup();
            newMaze.draw();
            newMaze.wallCoordBuilder();
            newMaze.removeDupes();
            wallArray = newMaze.wallArray;
            gameState = "playing";
            
            for(var i = 0; i < tankArr.length; i++){
            	var newX = Math.random() * canvas.width;
                var newY = Math.random() * canvas.height;
                var newRotation = Math.random() * 360;
                
                if(tankArr[i].checkIfInBounds(tankArr[i].getCorners(newX, newY, newRotation))){
                	tankArr[i].x = newX;
                    tankArr[i].y = newY;
                    tankArr[i].rotation = newRotation;
                    tankArr[i].isAlive = true;
                }
                else{
                	i -= 1;
                }
            }
            //Load in the tanks
            aliveTankArr = tankArr.slice();
          }
          else if(gameState == "playing" || gameState == "finishing round"){
            if(aliveTankArr.length <= 1 && gameState != "finishing round"){
              gameState = "finishing round";
              setTimeout(function(){gameState = "calculate points";}, 3000);
            }

            /* rotation handling */
            if(left == true && right == false){
            	playerTank.changeRotation(-2)
            }
            else if(left == false && right == true){
            	playerTank.changeRotation(2)
            }

            /* Forward and reverse movement handling */
            yTrig = Math.cos(degToRad(playerTank.rotation))
            xTrig = Math.sin(degToRad(playerTank.rotation))
        	  if(up == true && down == false){
            	playerTank.changePositionY(yTrig * -2);
              playerTank.changePositionX(xTrig * 2);
            }
            else if(up == false && down == true){
            	playerTank.changePositionY(yTrig * 2);
                playerTank.changePositionX(xTrig * -2);
            }
            else if(up == true && down == true){
            	playerTank.changePositionY(yTrig * -1);
                playerTank.changePositionX(xTrig * 1);
            }



            /* Canvas stuff */
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for(var i = 0; i < redTank.bulletArr.length; i++){

            }

            for(var i = 0; i < aliveTankArr.length; i++){
            	aliveTankArr[i].update();
            }
            for(var i = 0; i < tankArr.length; i++){
            	for(var j = 0; j < tankArr[i].bulletArr.length; j++){
            		tankArr[i].bulletArr[j].update();
            	}
            }

            for(var i = 0; i < newMaze.wallArray.length; i++){
            	ctx.beginPath();
                ctx.moveTo(wallArray[i].startX, wallArray[i].startY);
                ctx.lineTo(wallArray[i].endX, wallArray[i].endY);
                ctx.lineWidth = 4;
                ctx.stroke();
            }
          }
          else if(gameState == "calculate points"){
            if(aliveTankArr.length == 1){
              aliveTankArr[0].addPoints(1);
            }
            for(var i = 0; i < tankArr.length; i++){
            	tankArr[i].bulletArr = [];
            }
            gameState = "loading map";
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


      </script>
    </body>

</html>

<?php

?>
