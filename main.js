
class tetromino {
    static blocksize = 30;
    constructor(blocks = [[0, 0]], color = "", name = "") {
        this.blocks = blocks;
        if (color != null) {
            this.color = color;
        }
        if (name != null) {
            this.name = name;
        }
    }
};

const Itetromino = new tetromino([[4, -1], [0, -1], [0, -2], [0, 1]], "blue", "I");//blocks[0] is first block's location, i > 0 is location compared to blocks[0] of the other
const Otetromino = new tetromino([[4, -1], [1, 0], [0, 1], [1, 1]], "yellow", "O");
const Ztetromino = new tetromino([[4, -1], [1, 0], [0, -1], [-1, -1]], "red", "Z");
const Z_tetromino = new tetromino([[5, -1], [-1, 0], [0, -1], [1, -1]], "green", "Z-");
const Ltetromino = new tetromino([[4, -1], [0, -1], [0, 1], [1, 1]], "orange", "L");
const L_tetromino = new tetromino([[5, -1], [0, -1], [0, 1], [-1, 1]], "cyan", "L-");
const Ttetromino = new tetromino([[4, -1], [-1, 0], [1, 0], [0, -1]], "purple", "T");
/******************************************************************/
var listTetrominos = [Itetromino, Otetromino, Ztetromino, Z_tetromino, Ltetromino, L_tetromino, Ttetromino,
    Itetromino, Otetromino, Ztetromino, Z_tetromino, Ltetromino, L_tetromino, Ttetromino
];
var remove = [];
var currentTetromino = new tetromino;
var nBlocks = {
    width: 10,
    height: 20,
}
var BlocksMap = [[""]];
for (let x = 0; x < nBlocks.width; x++) {
    BlocksMap[x] = [];
    for (let y = 0; y < nBlocks.height; y++) {
        BlocksMap[x][y] = null;
    }
}
var intervalId;
var intervalScreen;
var moveDirection = 0;
var rotateDirection = 0; // 1 -> clockwise, -1 -> counterclockwise; but y-axis is inverted => -1 -> clockwise, 1 -> counterclockwise
var paused = false;
var timeUpdateGame = 500;
var speedup = false;

var context;
var board;
var pauseNoti;
var whiteLineY = [];
var point = 0;
var ShowPoint;
var line = 0;
var showLine;

// for (let x = 0; x < nBlocks.width; x++) {
//     BlocksMap[x] = [];
//    for (let y = 0; y < nBlocks.height; y++) {
//        console.log(x, y, BlocksMap[x][y])
//    }
// }
/***********************************************************************/
window.onload = function () {
    //set game var
    board = document.getElementById("game_container");
    board.height = tetromino.blocksize * nBlocks.height;
    board.width = tetromino.blocksize * nBlocks.width;

    context = board.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    ShowPoint = document.getElementById("point");
    showLine = document.getElementById("lines");

    for (let i = 0; i < 3; i++) {
        let indexRandom = Math.floor(Math.random() * listTetrominos.length);
        remove[remove.length] = listTetrominos[indexRandom];
        listTetrominos.splice(indexRandom, 1);

    }
    //set control
    spawnTetromino();
    document.addEventListener("keydown", control);
    document.addEventListener("keyup", function (e) {
        if (e.key === 'Shift') {
            speedup = false;
            // console.log("speeddown");
        }
    });

    //set game loop
    intervalScreen = setInterval(screenLoad, 50);
    intervalId = setInterval(game, timeUpdateGame);

    //set focus
    pauseNoti = document.getElementById("pauseNotification");
    // document.addEventListener("visibilitychange", function() {
    //     if (document.hidden) {
    //         console.log("out web");
    //         pause();
    //     } else {
    //         console.log("come back web");
    //         resume();
    //     }
    // });

    window.addEventListener('focus', resume);

    //     function () {
    //     console.log('Input is being received on the current window.');
    // });

    window.addEventListener('blur', pause);
    // function () {
    //     console.log('Input is not being received on the current window.');
    //     ;
    // });

    //alert
    alert("A/D to move; W/S to rotate; shift to speed-up; space to pause/remuse; \n clear 1 line: get 1 point\n clear more than 3 lines at a time: bonus 1 point");
}

/********************************************************************/
//load
function showTetromino() {

    // console.log("hello");
    context.fillStyle = currentTetromino.color;
    context.fillRect(currentTetromino.blocks[0][0] * tetromino.blocksize, currentTetromino.blocks[0][1] * tetromino.blocksize, tetromino.blocksize - 1, tetromino.blocksize - 1);

    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var Blocks = [];
        Blocks[0] = currentTetromino.blocks[0][0] + currentTetromino.blocks[i][0];
        Blocks[1] = currentTetromino.blocks[0][1] + currentTetromino.blocks[i][1];

        // console.log(Blocks);
        context.fillRect(Blocks[0] * tetromino.blocksize, Blocks[1] * tetromino.blocksize, tetromino.blocksize - 1, tetromino.blocksize - 1);
    }
}

function showBlocks() {
    for (let x = 0; x < BlocksMap.length; x++) {
        for (let y = 0; y < BlocksMap[x].length; y++) {
            if (BlocksMap[x][y] != null) {
                context.fillStyle = BlocksMap[x][y];
                context.fillRect(x * tetromino.blocksize, y * tetromino.blocksize, tetromino.blocksize - 1, tetromino.blocksize - 1);

            }

        }
    }
}

function screenLoad() {
    // console.log("screenload");
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
    showBlocks();
    // console.log(currentTetromino.blocks[0][1]);
    showTetromino(currentTetromino);
    //speedup
    if (speedup == true) {
        clearWhiteLine();
        stopTetromino();
    }
}

function loadgetLineandPoint() {
    if (whiteLineY.length != 0) {
        // console.log(whiteLineY.length);
        if (whiteLineY.length < 3) {
            point += whiteLineY.length;
        }
        else if (whiteLineY.length >= 3) {
            point += whiteLineY.length + 1;
        }
        line += whiteLineY.length;
        showLine.textContent = ("line: " + line);
        ShowPoint.textContent = ("point: " + point);
        updateSpeedLevel();
    }
}
//logic
function spawnTetromino() {
    let indexRandom = Math.floor(Math.random() * listTetrominos.length);
    if (listTetrominos.length > 0) {
        currentTetromino = JSON.parse(JSON.stringify(listTetrominos[indexRandom]));

        remove[remove.length] = listTetrominos[indexRandom];
        listTetrominos.splice(indexRandom, 1);

        listTetrominos[listTetrominos.length] = remove[0];
        remove.splice(0, 1);

        // console.log(listTetrominos);
        // console.log(remove);
        // currentTetromino = JSON.parse(JSON.stringify(listTetrominos[0]));
        // currentTetromino.blocks[0] = [5, 5];
    }
}

function game() {
    // console.log("hehe");
    // console.log("gameload");
    // console.log(currentTetromino.blocks[0][0]);
    // console.log(currentTetromino.blocks[0][0], currentTetromino.blocks[0][1]);
    clearWhiteLine();
    stopTetromino();
    // console.log(whiteLineY.length);
}

function stopTetromino() {
    var bottom = nBlocks.height - 1;
    if (currentTetromino.blocks[0][1] >= bottom || (BlocksMap[currentTetromino.blocks[0][0]][currentTetromino.blocks[0][1] + 1] != null)) {
        loseConditions();
        spawnTetromino();
        return;
    }

    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var Blocks = [];
        Blocks[0] = currentTetromino.blocks[0][0] + currentTetromino.blocks[i][0];
        Blocks[1] = currentTetromino.blocks[0][1] + currentTetromino.blocks[i][1];

        if (Blocks[1] >= bottom || BlocksMap[Blocks[0]][Blocks[1] + 1] != null) {
            loseConditions();
            spawnTetromino();
            // console.log(Itetromino.blocks[0]);
            return;
        }
    }
    if (moveDirection == 0) {
        currentTetromino.blocks[0][1] += 1;
        // console.log("down");

    }
}

function loseConditions() {
    if (currentTetromino.blocks[0][1] < 0) {
        // alert("lose");
        clearInterval(intervalScreen);
        console.log("clear screen");
        clearInterval(intervalId);
        console.log("clear game");

        document.removeEventListener("keyup", function (e) {
            if (e.key === 'Shift') {
                speedup = false;
                console.log("speeddown");
            }
        });

        document.removeEventListener("keydown", control);

        window.removeEventListener('focus', resume);

        window.removeEventListener('blur', pause);
        alert("game over");
        return;
    }

    else {
        placeBlock();
        getPoint();
    }
}

function placeBlock() {
    BlocksMap[currentTetromino.blocks[0][0]][currentTetromino.blocks[0][1]] = currentTetromino.color;

    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var Blocks = [];
        Blocks[0] = currentTetromino.blocks[0][0] + currentTetromino.blocks[i][0];
        Blocks[1] = currentTetromino.blocks[0][1] + currentTetromino.blocks[i][1];

        BlocksMap[Blocks[0]][Blocks[1]] = currentTetromino.color;
    }
}

function getPoint() {
    if ((BlocksMap[0][currentTetromino.blocks[0][1]] != "white") && lineFull(currentTetromino.blocks[0][1])) {
        for (let x = 0; x < nBlocks.width; x++) {
            BlocksMap[x][currentTetromino.blocks[0][1]] = "white";
        }
        whiteLineY.push(currentTetromino.blocks[0][1]);
        // console.log(point);
    }

    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var blockY = currentTetromino.blocks[0][1] + currentTetromino.blocks[i][1];
        if ((BlocksMap[0][blockY] != "white") && lineFull(blockY)) {
            for (let x = 0; x < nBlocks.width; x++) {
                BlocksMap[x][blockY] = "white";
            }
            whiteLineY.push(blockY);
            // console.log(point);
        }
    }
    loadgetLineandPoint();
}

function lineFull(y = 0) {
    // console.log(y);
    for (let i = 0; i < nBlocks.width; i++) {
        // console.log(BlocksMap[i][y]);
        if (BlocksMap[i][y] == null) {
            // console.log("false");
            return false;
        }
    }
    // console.log("true");
    return true;
}

function clearWhiteLine() {
    if (whiteLineY.length == 0 || whiteLineY[0] == null) {
        return;
    }
    whiteLineY.sort();
    // console.log(whiteLineY + "+++");
    var leng = whiteLineY.length;

    for (let k = 0; k < leng; k++) {
        // console.log(k);
        var lineY = whiteLineY[whiteLineY.length - 1]
        for (let i = 0; i < nBlocks.width; i++) {
            BlocksMap[i][lineY] = null;
            moveBlocksDown(i, lineY);
        }
        for (let i = 0; i < whiteLineY.length - 1; i++) {
            whiteLineY[i]++;
        }
        // console.log(whiteLineY + "+")
        whiteLineY.pop();
        // console.log(whiteLineY + "-");
        // console.log(point);

    }
    // console.log(whiteLineY + "---");

}

function moveBlocksDown(X = 0, y = 0) {
    for (let i = y; i > 0; i--) {
        BlocksMap[X][i] = BlocksMap[X][i - 1];
    }
    BlocksMap[X][0] = null;
}

function updateSpeedLevel(){
    if(timeUpdateGame > 180){
        timeUpdateGame -= 15;
        clearInterval(intervalId);
        intervalId = setInterval(game, timeUpdateGame);
        // console.log(timeUpdateGame);
    }

}
//control
function pause() {
    if (paused) {
        // console.log("nopause");
        return;
    }
    clearInterval(intervalId);
    clearInterval(intervalScreen);
    pauseNoti.style.visibility = 'visible';
    paused = true;
    // console.log("pause");
}

function resume() {
    if (!paused) {
        // console.log("noresume");
        return;
    }
    pauseNoti.style.visibility = 'hidden';
    intervalId = setInterval(game, timeUpdateGame);
    intervalScreen = setInterval(screenLoad, 50);
    paused = false;
    // console.log("resume");
}

function move() {
    var right = nBlocks.width - 1;
    if (moveDirection == 1) {
        if (currentTetromino.blocks[0][0] >= right || (BlocksMap[currentTetromino.blocks[0][0] + 1][currentTetromino.blocks[0][1]] != null)) {
            moveDirection = 0;
            return;
        }
        for (let i = 1; i < currentTetromino.blocks.length; i++) {
            var Blocks = [];
            Blocks[0] = currentTetromino.blocks[0][0] + currentTetromino.blocks[i][0];
            Blocks[1] = currentTetromino.blocks[0][1] + currentTetromino.blocks[i][1];

            if (Blocks[0] >= right || BlocksMap[Blocks[0] + 1][Blocks[1]] != null) {
                moveDirection = 0;
                return;
            }
        }
        currentTetromino.blocks[0][0] += moveDirection;
        moveDirection = 0;
    }
    else if (moveDirection == -1) {
        if (currentTetromino.blocks[0][0] <= 0 || (BlocksMap[currentTetromino.blocks[0][0] - 1][currentTetromino.blocks[0][1]] != null)) {
            moveDirection = 0;
            return;
        }

        for (let i = 1; i < currentTetromino.blocks.length; i++) {
            var Blocks = [];
            Blocks[0] = currentTetromino.blocks[0][0] + currentTetromino.blocks[i][0];
            Blocks[1] = currentTetromino.blocks[0][1] + currentTetromino.blocks[i][1];

            if (Blocks[0] <= 0 || BlocksMap[Blocks[0] - 1][Blocks[1]] != null) {
                // console.log("hi");
                moveDirection = 0;
                return;
            }
        }
        currentTetromino.blocks[0][0] += moveDirection;
        moveDirection = 0;
    }
    // screenLoad();
}

function rotate() {
    if (currentTetromino.name == "O") {
        return;
    }
    var newBlocks = [[0]];

    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var Blocks = [];
        newBlocks[i] = [];
        newBlocks[i][0] = rotateDirection * currentTetromino.blocks[i][1];
        newBlocks[i][1] = rotateDirection * currentTetromino.blocks[i][0] * (-1);

        Blocks[0] = currentTetromino.blocks[0][0] + newBlocks[i][0];
        Blocks[1] = currentTetromino.blocks[0][1] + newBlocks[i][1];
        if (Blocks[1] > nBlocks.height - 1 || Blocks[1] < 0) {
            return;
        }

        if (Blocks[0] > nBlocks.width - 1) {
            collide_right();
            return;
        }
        else if (Blocks[0] < 0) {
            collide_left();
            return;
        }

        if (BlocksMap[Blocks[0]][Blocks[1]] != null) {
            rotateDirection = 0;
            return;
        }
    }
    for (let i = 1; i < newBlocks.length; i++) {
        currentTetromino.blocks[i][0] = newBlocks[i][0];
        currentTetromino.blocks[i][1] = newBlocks[i][1];
    }
    // console.log(currentTetromino.blocks);
    rotateDirection = 0;
}

function collide_left() {
    var newX = currentTetromino.blocks[0][0] + 1;
    var newBlocks = [[0]];

    if (currentTetromino.name == "I") {
        if (currentTetromino.blocks[0][0] > 0) {
            newX = currentTetromino.blocks[0][0];
        }
        for (let i = 1; i < currentTetromino.blocks.length; i++) {
            var Blocks = [];
            newBlocks[i] = [];
            newBlocks[i][0] = rotateDirection * currentTetromino.blocks[i][1];

            Blocks[0] = newX + newBlocks[i][0];
            if (Blocks[0] < 0) {
                rotateDirection = (-1) * rotateDirection;
                break;
            }
        }
    }


    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var Blocks = [];
        newBlocks[i] = [];
        newBlocks[i][0] = rotateDirection * currentTetromino.blocks[i][1];
        newBlocks[i][1] = rotateDirection * currentTetromino.blocks[i][0] * (-1);

        Blocks[0] = newX + newBlocks[i][0];
        Blocks[1] = currentTetromino.blocks[0][1] + newBlocks[i][1];
        if (Blocks[1] > 19 || Blocks[1] < 0) {
            return;
        }
        if (BlocksMap[Blocks[0]][Blocks[1]] != null) {
            rotateDirection = 0;
            return;
        }
    }
    currentTetromino.blocks[0][0] = newX;
    for (let i = 1; i < newBlocks.length; i++) {
        currentTetromino.blocks[i][0] = newBlocks[i][0];
        currentTetromino.blocks[i][1] = newBlocks[i][1];
    }
    rotateDirection = 0;
}

function collide_right() {
    var newX = currentTetromino.blocks[0][0] - 1;
    var newBlocks = [[0]];
    if (currentTetromino.name == "I") {
        if (currentTetromino.blocks[0][0] < nBlocks.width - 1) {
            newX = currentTetromino.blocks[0][0];
        }
        for (let i = 1; i < currentTetromino.blocks.length; i++) {
            var Blocks = [];
            newBlocks[i] = [];
            newBlocks[i][0] = rotateDirection * currentTetromino.blocks[i][1];

            Blocks[0] = newX + newBlocks[i][0];
            if (Blocks[0] > nBlocks.width - 1) {
                rotateDirection = (-1) * rotateDirection;
                break;
            }
        }
    }

    for (let i = 1; i < currentTetromino.blocks.length; i++) {
        var Blocks = [];
        newBlocks[i] = [];
        newBlocks[i][0] = rotateDirection * currentTetromino.blocks[i][1];
        newBlocks[i][1] = rotateDirection * currentTetromino.blocks[i][0] * (-1);

        Blocks[0] = newX + newBlocks[i][0];
        Blocks[1] = currentTetromino.blocks[0][1] + newBlocks[i][1];
        if (Blocks[1] > 19 || Blocks[1] < 0) {
            return;
        }
        if (BlocksMap[Blocks[0]][Blocks[1]] != null) {
            rotateDirection = 0;
            return;
        }
    }
    currentTetromino.blocks[0][0] = newX;
    for (let i = 1; i < newBlocks.length; i++) {
        currentTetromino.blocks[i][0] = newBlocks[i][0];
        currentTetromino.blocks[i][1] = newBlocks[i][1];
    }
    rotateDirection = 0;
}

function control(e) {
    if (e.code == "KeyW") {
        rotateDirection = -1;
        rotate();
    }

    else if (e.code == "KeyS") {
        rotateDirection = 1;
        rotate();
    }

    else if (e.code == "KeyA") {
        moveDirection = -1;
        move();
    }

    else if (e.code == "KeyD") {
        moveDirection = 1;
        move();
    }
    else if (e.code == "Space") {
        if (paused) {
            resume();
        }
        else {
            pause();
        }
    }
    else if (e.key === 'Shift') {
        speedup = true;
        // stopTetromino();
        // console.log("speedup");
    }
    // console.log(e.code);
    // console.log("moveDirection: " + moveDirection)
    // console.log("rotateDirection: " + rotateDirection);
    // console.log("-------------")
}


