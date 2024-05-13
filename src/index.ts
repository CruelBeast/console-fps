const screenWidth = 120;
const screenHeight = 40;

let playerX = 8.0;
let playerY = 8.0;
let playerA = 0.0;

let mapHeight = 16;
let mapWidth = 16;

let FOV = 3.14159 / 4;
let depth = 16;

let map =
`XXXXXXXXXXXXXXXX\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
X..............X\
XXXXXXXXXXXXXXXX`

let consoleScreen = Array(screenWidth * screenHeight).fill('#')

let consoleRef = document.querySelector('#console')!;

let previousTimeStamp: number | undefined;
let elapsedTime: number;


var pressedKeys: {[key: string]: boolean} = {};
window.onkeyup = function(e) { pressedKeys[e.key] = false; }
window.onkeydown = function(e) { pressedKeys[e.key] = true; }


main(); // Start the cycle

function main(timeStamp?: DOMHighResTimeStamp) {
    window.requestAnimationFrame(main);
    if (!previousTimeStamp) {
        previousTimeStamp = timeStamp;
    }

    elapsedTime = timeStamp && previousTimeStamp ? (timeStamp - previousTimeStamp)*0.001 : 0;

    previousTimeStamp = timeStamp;


    if (pressedKeys.a) {
        playerA -= (0.8)*elapsedTime;
    }

    if (pressedKeys.d) {
        playerA += (0.8)*elapsedTime;
    }
    
    if (pressedKeys.w) {
        playerX += Math.sin(playerA) * 5 * elapsedTime;
        playerY += Math.cos(playerA) * 5 * elapsedTime;
        if (map[Math.floor(playerX) * mapWidth + Math.floor(playerY)] == 'X') {
            playerX -= Math.sin(playerA) * 5 * elapsedTime;
            playerY -= Math.cos(playerA) * 5 * elapsedTime;
        }
    }

    if (pressedKeys.s) {
        playerX -= Math.sin(playerA) * 5 * elapsedTime;
        playerY -= Math.cos(playerA) * 5 * elapsedTime;
        if (map[Math.floor(playerX) * mapWidth + Math.floor(playerY)] == 'X') {
            playerX += Math.sin(playerA) * 5 * elapsedTime;
            playerY += Math.cos(playerA) * 5 * elapsedTime;
        }
    }

    for (let x = 0; x < screenWidth; x++) {
        const rayAngle = (playerA - FOV/2) + (x/screenWidth) * FOV;
    

        let distanceToWall = 0.0;
        let hitWall = false;
        let boundary = false;

        let eyeX = Math.sin(rayAngle);
        let eyeY = Math.cos(rayAngle);

        while (!hitWall && distanceToWall < depth) {
            distanceToWall += 0.1;
            let testX = Math.floor(playerX + eyeX * distanceToWall);
            let testY = Math.floor(playerY + eyeY * distanceToWall);

            if (testX < 0 || testX >= mapWidth || testY < 0 || testY >= mapWidth) {
                hitWall = true;
                distanceToWall = depth;
            } else {
                if (map[testY * mapWidth + testX] === 'X') {
                    hitWall = true;
                    
                    let p: [number, number][] = [];

                    for (let tx = 0; tx < 2; tx++)
                        for (let ty = 0; ty < 2; ty++)
                        {
                            let vy = testY + ty - playerY;
                            let vx = testX + tx - playerX;
                            let d = Math.sqrt(vx * vx + vy * vy);
                            let dot = (eyeX * vx / d) + (eyeY * vy / d);
                            p.push([d, dot]);
                        }

                    p.sort((left, right) => left[0] - right[0]);

                    let bound = 0.005;
                    if (Math.acos(p[0][1]) < bound) boundary = true;
                    if (Math.acos(p[1][1]) < bound) boundary = true;
                    // if (Math.acos(p[2][1]) < bound) boundary = true;
                }
            }
        }

        let ceiling = Math.floor((screenHeight / 2.0) - screenHeight / distanceToWall);
        let floor =  Math.floor(screenHeight - ceiling);

        let shade = '&nbsp;';
        if (distanceToWall <= depth / 4)			shade = '&#9608;';
        else if (distanceToWall < depth / 3)		shade = '&#9619;';
        else if (distanceToWall < depth / 2)		shade = '&#9618;';
        else if (distanceToWall < depth)			shade = '&#9617;';
        else										shade = '&#9617;';

        if (boundary) shade = '&nbsp;';

        for (let y = 0; y < screenHeight; y++) {
            if (y <= ceiling)
                consoleScreen[y*screenWidth + x] = '&nbsp;';
            else if (y >= ceiling && y <= floor)
                consoleScreen[y*screenWidth + x] = shade;
            else {
                let b = 1 - ((y - screenHeight / 2) / (screenHeight / 2));
                if (b < 0.25)		shade = '#';
                else if (b < 0.5)	shade = 'x';
                else if (b < 0.75)	shade = '.';
                else				shade = '&nbsp;';
                consoleScreen[y * screenWidth + x] = shade;
            }

        }
    }

    const stats = `X=${Math.floor(playerX)}, Y=${Math.floor(playerY)}, A=${Math.floor(playerA)}, FPS=${Math.floor(1 / elapsedTime)}`.split('');
    const statsLen = stats.length;

    // console.log(statsLen)

    // consoleScreen.splice(0, statsLen, stats)

    for (let nx = 0; nx < mapWidth; nx++)
        for (let ny = 0; ny < mapWidth; ny++)
        {
            consoleScreen[(ny + 1) * screenWidth + nx] = map[ny * mapWidth + nx];
        }
        consoleScreen[(Math.floor(playerX) + 1) * screenWidth + Math.floor(playerY)] = 'P';

    consoleRef.innerHTML = consoleScreen.join('');

    // update(tFrame); // Call your update method. In our case, we give it rAF's timestamp.
    // render();
}
