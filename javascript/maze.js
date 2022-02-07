/* Maze generation code, has the Wall, Maze, and Cell classes */

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
	
    this.draw();
    this.wallCoordBuilder();
    this.removeDupes();
    this.removeEdges();
  }

  draw()
  {
    this.current.visited = true;

    for (let r = 0; r < this.rows; r++)
    {
      for (let c = 0; c < this.columns; c++)
      {
        let grid = this.grid;
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
  removeEdges(){
   	//to remove the walls that are on the border
    for(var i = 0; i < this.wallArray.length; i++){
      if( ( (this.wallArray[i].startX == 0 || this.wallArray[i].startX == this.width) && this.wallArray[i].startX == this.wallArray[i].endX) || ( (this.wallArray[i].startY == 0 || this.wallArray[i].startY == this.height) && this.wallArray[i].startY == this.wallArray[i].endY) ){
        this.wallArray.splice(i, 1);
        i -= 1;
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

module.exports = {
  Maze : Maze,
  Cell : Cell,
  Wall : Wall
}