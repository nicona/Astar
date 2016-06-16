var NAN_ERROR_MESSAGE = "You did not enter a number, please change your input for ";
var EMPTY_BOX = "Please fill out all boxes.";
var LARGE_MAP_SIZE = "Please enter a number for width and height that is equal or below 25.";
var LARGE_DENSITY = "Please enter a number for density that is less than or equal to 1 and greate or equal to 0.";
var startPointX;
var startPointY;
var goalX;
var goalY;
var sizeX;
var sizeY;
var density;
var gCost;
var diagonalCost = 2;
var finalPath;
var map = new Array();
// variables for the visual grid//
var context;
var canvas;
var tileSize; //size of the "tiles" in the map
var reset; //once the user clicks for the 3rd time this will be set to true and the map will be reset
var isFinalPath; //if the final path is found this is set to true and the final path can be printed
var checkInputer; //value that is set to true once input is correct;
var clickCounter; //counts the clicks of the user to determine what is start and goal point
//node class 
var Nodes = (function () {
    function Nodes(name) {
        this.start = false;
        this.goal = false;
        this.setName(name);
    }
    Nodes.prototype.setWall = function (wall) {
        this.isWall = true;
    };
    Nodes.prototype.setStart = function (start) {
        this.start = start;
    };
    Nodes.prototype.setGoal = function (goal) {
        this.goal = goal;
    };
    Nodes.prototype.setParent = function (Node) {
        this.parent = Node;
    };
    Nodes.prototype.setType = function (type) {
        this.type = type;
    };
    Nodes.prototype.setName = function (name) {
        this.name = name;
    };
    Nodes.prototype.setHscore = function (score) {
        this.hScore = score;
    };
    Nodes.prototype.setFscore = function (score) {
        this.fScore = score;
    };
    Nodes.prototype.setGscore = function (score) {
        this.gScore = score;
    };
    Nodes.prototype.setPosX = function (position) {
        this.posX = position;
    };
    Nodes.prototype.setPosY = function (position) {
        this.posY = position;
    };
    Nodes.prototype.setXY = function (positionX, positionY) {
        this.posX = positionX;
        this.posY = positionY;
    };
    Nodes.prototype.hasParent = function (Node) {
        if (Node.getParent() == null) {
            return false;
        }
        return true;
    };
    // getDiag(){
    // 	return this.isDiag;
    // }
    Nodes.prototype.getWall = function () {
        return this.isWall;
    };
    Nodes.prototype.getStart = function () {
        return this.start;
    };
    Nodes.prototype.getGoal = function () {
        return this.goal;
    };
    Nodes.prototype.getParent = function () {
        return this.parent;
    };
    Nodes.prototype.getType = function () {
        return this.type;
    };
    Nodes.prototype.getName = function () {
        return this.name;
    };
    Nodes.prototype.getHscore = function () {
        return this.hScore;
    };
    Nodes.prototype.getFscore = function () {
        return this.fScore;
    };
    Nodes.prototype.getGscore = function () {
        return this.gScore;
    };
    Nodes.prototype.getPosX = function () {
        return this.posX;
    };
    Nodes.prototype.getPosY = function () {
        return this.posY;
    };
    return Nodes;
})();
//use these functions if special grid is made
function isLeft(positionY, y) {
    if (y == positionY - 1) {
        return true;
    }
    return false;
}
function isRight(positionY, y) {
    if (y == positionY + 1) {
        return true;
    }
    return false;
}
function isTop(positionY, y) {
    if (y == positionY - 1) {
        return true;
    }
    return false;
}
function isBottom(positionX, x) {
    if (x == positionX + 1) {
        return true;
    }
    return false;
}
function isDiagoal(positionX, positionY, x, y) {
    if ((x == positionX - 1 || x == positionX + 1) && (y == positionY - 1 || y == positionY + 1)) {
        return true;
    }
    return false;
}
//creates the map for a console based application
function createMap() {
    for (var i = 0; i < sizeX; i++) {
        map[i] = new Array();
        for (var j = 0; j < sizeY; j++) {
            map[i][j] = new Nodes("||x: " + i + "|" + "y: " + j + "||");
            if (density > Math.random()) {
                map[i][j].setWall(true);
            }
            else {
                map[i][j].setFscore(0);
                map[i][j].setGscore(0);
                map[i][j].setHscore(0);
                map[i][j].setParent(null);
            }
        }
    }
}
//prints the graph to the console.
function printGraph() {
    for (var i = 0; i < sizeX; ++i) {
        for (var j = 0; j < sizeY; ++j) {
            console.log(map[i][j].getName());
        }
        console.log("");
    }
}
//2 heuristics; maybe give user the option to select the heuristic
function manhattenHeuristic(Nodes) {
    var heuristicVal;
    var dx = Math.abs(Nodes.getPosX() - goalX);
    var dy = Math.abs(Nodes.getPosY() - goalY);
    heuristicVal = 2 * (dx + dy);
    return heuristicVal;
}
function diagonalHeuristic(Nodes) {
    var heuristicVal;
    var dx = Math.abs(Nodes.getPosX() - goalX);
    var dy = Math.abs(Nodes.getPosY() - goalY);
    heuristicVal = gCost * (dx + dy) + (diagonalCost - 2 * 2) * Math.min(dx, dy);
    return heuristicVal;
}
//neighbor checking function.
function getNeighbors(positionX, positionY) {
    var neighbors = new Array();
    for (var checkH = -1; checkH < 2; ++checkH) {
        for (var checkW = -1; checkW < 2; ++checkW) {
            if (positionX + checkH < 0 || positionY + checkW < 0 || positionX + checkH > map.length - 1 || positionY + checkW > map.length - 1) {
                continue;
            }
            else if (checkH == 0 && checkW == 0) {
                //if the position is the same as the checking then ignore it move on to the next one
                continue;
            }
            else {
                if (isDiagoal(positionX, positionY, positionX + checkH, positionY + checkW)) {
                    map[positionX + checkH][positionY + checkW].setXY(positionX + checkH, positionY + checkW);
                    neighbors.push(map[positionX + checkH][positionY + checkW]);
                }
                else if (isBottom(positionX, positionX + checkH)) {
                    map[positionX + checkH][positionY + checkW].setXY(positionX + checkH, positionY + checkW);
                    neighbors.push(map[positionX + checkH][positionY + checkW]);
                }
                else if (isTop(positionX, positionX + checkH)) {
                    map[positionX + checkH][positionY + checkW].setXY(positionX + checkH, positionY + checkW);
                    neighbors.push(map[positionX + checkH][positionY + checkW]);
                }
                else if (isLeft(positionY, positionY + checkW)) {
                    map[positionX + checkH][positionY + checkW].setXY(positionX + checkH, positionY + checkW);
                    neighbors.push(map[positionX + checkH][positionY + checkW]);
                }
                else if (isRight(positionY, positionY + checkW)) {
                    map[positionX + checkH][positionY + checkW].setXY(positionX + checkH, positionY + checkW);
                    neighbors.push(map[positionX + checkH][positionY + checkW]);
                }
            }
        }
    }
    return neighbors;
}
//checks if item is in list
function contains(list, check) {
    for (var i = 0; i < list.length; ++i) {
        if (list[i].getName() == check.getName()) {
            return true;
        }
    }
    return false;
}
function printPath(array) {
    for (var i = 0; i < array.length; ++i) {
        console.log(array[i].getName());
    }
}
//the algorithm, takes in start and goal coordinates
function aStar(startPointX, startPointY, goalX, goalY) {
    var openList = new Array();
    var closedList = new Array();
    var neighbors = new Array();
    finalPath = [];
    var positionX = 0;
    var positionY = 0;
    var currentNode = new Nodes("");
    var startingNode = new Nodes("");
    var neighbor = new Nodes("");
    //initialising the start node
    startingNode = map[startPointX][startPointY];
    startingNode.setXY(startPointX, startPointY);
    startingNode.setFscore(0);
    startingNode.setGscore(0);
    startingNode.setHscore(0);
    openList.push(startingNode);
    var tempMin = openList[0].getFscore();
    while (openList.length > 0) {
        currentNode = openList[0];
        for (var i = 0; i < openList.length; ++i) {
            if (openList[i].getFscore() < tempMin) {
                tempMin = openList[i].getFscore();
                currentNode = openList[i];
            }
        }
        //we have reached our goal
        if (currentNode.getName() == map[goalX][goalY].getName()) {
            var current = new Nodes("");
            var pathArray = new Array();
            current = currentNode;
            while (current.hasParent(current)) {
                pathArray.push(current.getParent());
                current = current.getParent();
            }
            console.log("Your goal was: " + goalX + goalY);
            console.log("Found path:");
            printPath(pathArray);
            this.finalPath = pathArray;
            break;
        }
        positionX = currentNode.getPosX();
        positionY = currentNode.getPosY();
        //deletes the current node from open list and then is added to closed list.
        for (var i = 0; i < openList.length; ++i) {
            if (openList[i].getName() == currentNode.getName()) {
                openList.splice(i, 1);
                break;
            }
        }
        closedList.push(currentNode);
        neighbors = getNeighbors(positionX, positionY);
        //iterate through the neighbor list, if already in closed list or a obstacle continue
        for (var i = 0; i < neighbors.length; ++i) {
            neighbor = neighbors[i];
            if (contains(closedList, neighbors[i]) || neighbors[i].getWall() == true) {
                continue;
            }
            var gScore = currentNode.getGscore() + gCost; //distance between tiles on the map based on the user input
            /*if the open list does not contain this neighbor or the current gScore is less than that of the neighbor,
            push this neighbor on the closed list add his scores and the current node as his parent*/
            if (!contains(openList, neighbor) || gScore < neighbor.getGscore()) {
                neighbor.setHscore(diagonalHeuristic(neighbor));
                openList.push(neighbor);
                neighbor.setParent(currentNode);
                neighbor.setGscore(gScore);
                neighbor.setFscore(neighbor.getGscore() + neighbor.getHscore());
            }
        }
    }
}
function findZePath() {
    createMap();
    printGraph();
    aStar(startPointX, startPointY, goalX, goalY);
}
//this function is called when the user first inteacts with the progam
function firstClick() {
    context = null;
    canvas = null;
    tileSize = 40;
    reset = false;
    isFinalPath = false;
    checkInputer = false; //value that is set to true once input is correct;
    clickCounter = 1;
    checkInput(); //checks input upon user click
    if (checkInputer == true) {
        this.sizeX = document.getElementById("sizeX").value;
        this.sizeY = document.getElementById("sizeY").value;
        this.density = document.getElementById("density").value;
        this.gCost = document.getElementById("gCost").value;
        createWorld();
    }
}
//creates the map and sizes the canvas so the game board can be of max size 25
function createWorld() {
    console.log("Creating map...");
    canvas = document.getElementById("gameMap");
    canvas.width = 1500;
    canvas.height = 1500;
    createMap();
    this.drawAll(reset);
}
//checks user input and alerts the user 
function checkInput() {
    if (document.getElementById("sizeX").value == "" || document.getElementById("sizeY").value == "" || document.getElementById("density").value == "" || document.getElementById("gCost").value == "") {
        alert(this.EMPTY_BOX);
        checkInputer = false;
        return checkInputer;
    }
    else if (+(document.getElementById("sizeX").value) > 25 || +(document.getElementById("sizeY").value) > 25) {
        alert(this.LARGE_MAP_SIZE);
        checkInputer = false;
        return checkInputer;
    }
    else if (+(document.getElementById("density").value) > 1) {
        alert(this.LARGE_DENSITY);
        checkInputer = false;
        return checkInputer;
    }
    else {
        checkInputer = true;
        return checkInputer;
    }
}
//create new world if enter key is pressed
function createWorldByKey(event) {
    if (event.keyCode == 13) {
        firstClick();
    }
}
//draws the single tiles depending on what they are, start,goal,wall, final path, or idle
function draw(x, y, reset, isFinalPath) {
    context = canvas.getContext("2d");
    context.font = "Georgia 22px";
    var tile = map[x][y];
    if (map[x][y].getStart() == true && !reset) {
        context.fillStyle = "#6AF88D";
    }
    else if (map[x][y].getGoal() == true && !reset) {
        context.fillStyle = "#FA0000";
    }
    else if (map[x][y].getWall() == true && !reset) {
        context.fillStyle = "black";
    }
    else if (isFinalPath) {
        context.fillStyle = "#F8756A";
    }
    else {
        context.fillStyle = "#399DF1";
    }
    context.fillRect(y * tileSize, x * tileSize, tileSize, tileSize);
    context.strokeRect(y * tileSize, x * tileSize, tileSize, tileSize);
}
//draws the whole grid and counts the clicks
function drawAll(reset) {
    clickCounter = 1;
    isFinalPath = false;
    for (var x = 0; x < sizeX; x++) {
        for (var y = 0; y < sizeY; y++) {
            draw(x, y, reset, isFinalPath);
        }
    }
}
//handles map clicking events
function mapIsClicked(event) {
    var rect = canvas.getBoundingClientRect();
    var X = event.x - rect.left;
    var Y = event.y - rect.top;
    var y = Math.floor(X / tileSize); // convert mouse coords to grid coords 
    var x = Math.floor(Y / tileSize); //switched x and y so x represents the rows and y the columns
    //if click once this is start, click again is goal, if click 3rd time is reset of map;
    if (clickCounter == 1) {
        if (map[x][y].getWall() == true) {
            alert("Cannot select a wall as a start point.");
            this.firstClick();
        }
        else {
            reset = false;
            map[x][y].setStart(true);
            this.startPointX = x;
            this.startPointY = y;
            draw(x, y, reset, isFinalPath);
            clickCounter = 2;
        }
    }
    else if (clickCounter == 2) {
        if (map[x][y].getWall() == true) {
            alert("Cannot select a wall as a goal point.");
            this.firstClick();
        }
        else {
            reset = false;
            map[x][y].setGoal(true);
            this.goalX = x;
            this.goalY = y;
            draw(x, y, reset, isFinalPath);
            drawThePath();
            clickCounter = 3;
        }
    }
    else {
        reset = true;
        this.firstClick();
    }
}
//draws the path 
function drawThePath() {
    var start = new Date().getTime();
    aStar(this.startPointX, this.startPointY, this.goalX, this.goalY);
    var end = new Date().getTime();
    var time = end - start;
    document.getElementById('timeTaken').innerText = "Time to execute: " + time.toString() + " milliseconds.";
    if (finalPath.length == 0) {
        alert("No path can be found for this.");
        isFinalPath = false;
    }
    else {
        isFinalPath = true;
        for (var i = 0; i < finalPath.length; ++i) {
            draw(finalPath[i].getPosX(), finalPath[i].getPosY(), reset, isFinalPath);
        }
    }
}
