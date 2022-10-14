/*
general game layout
drawing random circles within frame
60s timer
game
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
let displayTime = 20; // 1/10 seconds (displayTime:100 = 10s)
let score = 0;
let circles = [];

let lags = [];
// let appWidth;
// let appHeight;

window.onload = () => {
//  start setup
    app = $('#CC_game_App');
    // appWidth = Math.round(app[0].getBoundingClientRect().width);
    // appHeight = Math.round(app[0].getBoundingClientRect().height);
// end setup

//  start draw layout
    topBar = $("<div></div>").prop("id" ,'CC_game_topBar');
    timeTxt = $("<span></span>").prop("id" ,'CC_game_timeTxt').text(`Time: ${Math.ceil(displayTime/10)}s`);
    scoreTxt = $("<span></span>").prop("id" ,'CC_game_scoreTxt').text(`Score: ${score}`);
    gameScreen = $("<div></div>").prop("id", "CC_game_Screen");

    topBar.append(timeTxt, scoreTxt); // add time and score to Top Bar
    app.append(topBar, gameScreen); // add Top Bar and Screen to app container
    gameScreen.empty();

// end draw layout

// start circle generation
    screenProps = {
        "x": parseInt(gameScreen[0].getBoundingClientRect().x),
        "y": parseInt(gameScreen[0].getBoundingClientRect().y),
        "width": parseInt(gameScreen[0].getBoundingClientRect().width),
        "height": parseInt(gameScreen[0].getBoundingClientRect().height)
    };

    drawCircles = repeatFunc(()=> {
        console.log(displayTime);
        if (displayTime) {createCircle(); return true;} else {return false;}
    }, 400, 0);

    timer = repeatFunc(() => {
        if (displayTime) {
            circles.forEach(c => {if (Date.now() - c.createTime>1000) c.obj.remove();});
            displayTime--;
            timeTxt.text(`Time: ${Math.ceil(displayTime/10)}s`);
            return true;
        } else {
            circles.forEach(c => {c.obj.remove();})
            return false;
        }
    }, 100, 0);
    console.log(2);
}



// requisite functions below

function createCircle() {
    // while (Date.now() - initTime < 10000) {let wait=1;}
    let circle = {"obj" : $("<div></div>"), "createTime" : Date.now()};
    // console.log(circle.createTime - initTime);
    circle.obj.addClass("circle");
    gameScreen.append(circle.obj);
    
    // gen random nums to translate circle.obj
    let offsetX = Math.round(Math.random()*(screenProps.width - circle.obj.width())); 
    let offsetY = Math.round(Math.random()*(screenProps.height - circle.obj.width()));
    circle.obj.css("left", `${screenProps.x + offsetX}px`);
    circle.obj.css("top", `${screenProps.y + offsetY}px`);
    circles.push(circle);
}

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

    function wait(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    
    // DEBUG LINE - logs smart timer
    // for (let i=0;i<lag.length;i++){console.log(`Run ${i+1} - lag (ms): ${lag[i]}`);}
    lags.push(lag);
    return () => {extCond = false; cond = false};
}

async function timer(callback, time = 1000) {
    const initTime = Date.now();
    // function run() {
    await wait(time);
    callback;
    console.log(`timer lag: ${Date.now() - initTime - time}`);
    function wait(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    return Date.now() - initTime - time;
}



console.log(1);

// console.log(2);