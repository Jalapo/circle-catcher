/*
: general game layout
: drawing random circles within frame
: 60s timer
: game
difficulties
ui
*/

let app;
let topBar;
let timeTxt;
let scoreTxt;
let gameScreen;
let screenProps = {};
let initTime = Date.now();
let displayTime = !window.location.href.includes("127.0.0.1") ? 600 : 50;
// 1/10 seconds (displayTime:100 = 10s) || in dev., timer runs for 5s instead of 60
let score = 0;
let circles = [];
let lags = [];


window.onload = () => {
//  start setup/draw layout
app = $('#CC_game_App'); // This ID is dedicated to the app container.
topBar = $("<div></div>").prop("id" ,'CC_game_topBar');
timeTxt = $("<span></span>").prop("id" ,'CC_game_timeTxt').text(`Time: ${Math.ceil(displayTime/10)}s`);
scoreTxt = $("<span></span>").prop("id" ,'CC_game_scoreTxt').text(`Score: ${score}`);
gameScreen = $("<div></div>").prop("id", "CC_game_Screen");

topBar.append(timeTxt, scoreTxt); // add time and score to Top Bar
app.append(topBar, gameScreen); // add Top Bar and Screen to app container
updateScreen();
// end draw layout

// begin drawing circles
drawCircles = repeatFunc(()=> {
    // if timer != 0 (game is running), draw a circle every ~400ms
    if (displayTime) {createCircle(); return true;} else {return false;} 
}, 400, 0);
// begin game timer
timer = repeatFunc(() => {
    if (displayTime) {
        displayTime--;
        timeTxt.text(`Time: ${Math.ceil(displayTime/10)}s`);
        return true;
    } else {
        return false;
    }
}, 100, 0);
// begin cleanup timer
clearOld = repeatFunc(() => {
    if (displayTime) {
        if (circles.length) {
            circles.forEach(async(c) => {
                if (Date.now() - c.createTime >= 1500 && !c.clicked) {
                    c.clicked = true; // prevent a disappearing circle from having anything further ran on it
                    let elm = gameScreen.find(c.obj); // find the element that matches the 'circles' array object
                    elm.css("animation", "fadeOut 0.25s both");
                    await wait(250);
                    elm.remove();
                }
            });
        }
        return true;
    } else {
        for (let x=0;x<circles.length;x++) {circles[x].obj.css("animation", "fadeOut 0.25s both");}
        setTimeout(()=>{gameScreen.empty();}, 300);
        return false;
    }
}, 500, 0);
}


// --------------------------------------------------------------
// --------------------------------------------------------------
// requisite functions below

function createCircle() {
    let circle = {"obj" : $("<div></div>"), "createTime" : Date.now(), "clicked" : false};
    circle.obj.addClass("circle");
    // 'mousedown' event prevents missed clicks during mouse movement
    circle.obj.mousedown((c)=>{if (!circle.clicked) {circle.clicked=true; handleClick(c);}})
    gameScreen.append(circle.obj);
    
    // gen random nums to translate circle.obj
    let offsetX = Math.round(Math.random()*(screenProps.width - circle.obj.width())); 
    let offsetY = Math.round(Math.random()*(screenProps.height - circle.obj.width()));
    circle.obj.css("left", `${screenProps.x + offsetX}px`);
    circle.obj.css("top", `${screenProps.y + offsetY}px`);
    circles.push(circle);

    async function handleClick(click) {if (displayTime){ // only allow circles to be clicked if game is running
        score++;
        scoreTxt.text(`Score: ${score}`);
        let c = gameScreen.find(click.target);
        c.css("animation", "fadeOut 0.25s both");
        c.css("backgroundColor", "rgb(0,220,0)");
        await wait(500);
        c.remove();
    }}
}
function updateScreen(){screenProps = {
    "x": parseInt(gameScreen[0].getBoundingClientRect().x),
    "y": parseInt(gameScreen[0].getBoundingClientRect().y),
    "width": parseInt(gameScreen[0].getBoundingClientRect().width),
    "height": parseInt(gameScreen[0].getBoundingClientRect().height)
};}

async function repeatFunc(callback, interval = 1000, lim = 5) {
    let lag = [];
    let counter = 1;
    let cond = true;
    let extCond = true;
    const startTime = Date.now();
    while (cond && extCond) {
        let intLag = lag.length>0 ? lag[lag.length-1] : 0;
        await wait(interval-intLag);

        if (!lim) {extCond = callback();} // callback MUST return a boolean if there's no limit
        else callback();

        counter++;
        if (lim) cond = counter <= lim; // if there's a run limit, adjust the conditional variable for it
        let nextTime = startTime + interval*counter;
        lag.push(interval - (nextTime - Date.now()));
    }

    
    // DEBUG LINE - logs smart timer
    // for (let i=0;i<lag.length;i++){console.log(`Run ${i+1} - lag (ms): ${lag[i]}`);}
    lags.push(lag);
    return () => {extCond = false; cond = false};
}

function wait(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
