getData();

var obj;
var animationSequence = [];
var animationIndex = 0;
var interval = 1000;

var intervalFunction;
var isPaused = false;

console.log("ESTENSIONE AVVIATA!");

document.getElementsByTagName("iframe")[0].contentWindow.document.getElementsByTagName("input")[0].addEventListener("keydown", e=>{
    if(e.key === "Enter"){
        if(isPaused && intervalFunction) isPaused = false;
    }else if(e.key === "Tab"){
        if(isPaused && intervalFunction) {
            isPaused = false;
        }
    }
})

document.getElementsByTagName("iframe")[0].contentWindow.document.addEventListener("keydown", e => {
    if (e.key === "+") {
        browser.storage.local.get("animation").then(res => {
            if (res.animation) {
                stopAnimation();
            }else{
                startAnimation();
            }
        })
    }else if(e.key === "Tab"){
        if(!isPaused && intervalFunction)
            isPaused = true;
    }
})

async function getData() {
    await browser.storage.local.get("textarea").then(res => {
        obj = res.textarea;
    })

    await browser.storage.local.get("interval").then(res => {
        interval = res.interval;
    })
}

function delAvatarSet(frame) {
    var notices = frame.body.getElementsByClassName("notice");
    for (var i = 0; i < notices.length; i++) {
        var notice = notices[i];
        if (notice.innerHTML === "Avatar set") {
            notice.parentNode.removeChild(notice);
        }
    }
}

function stopAnimation() {
    browser.storage.local.set({ animation: false });
    if(animationSequence[0] !== undefined)
        sendMessage("/avatar " + animationSequence[0]);
    else
        sendMessage("/avatar -");

    animationSequence = [];
    animationIndex = 0;
    clearInterval(intervalFunction);
    isPaused=false;
}

async function startAnimation() {
    isPaused=false;
    await getData();
    console.log("INIZIO ANIMAZIONE CON: " + interval + "ms");
    browser.storage.local.set({ animation: true });

    for (i = 5; i < 10; i++) {
        if (obj[i] !== undefined && obj[i] !== "") {
            animationSequence.push(obj[i]);
        }
    }

    if (obj[0] !== undefined && obj[i] !== "") animationSequence.push(obj[0]);
    if (animationSequence.length === 0) animationSequence.push("O");

    animationIndex = 0;

    console.log(animationSequence);
    intervalFunction = setInterval(animation, interval);

}

function animation() {
    if(!isPaused){
        sendMessage("/avatar " + animationSequence[animationIndex]);
        animationIndex++;
        if (animationIndex > animationSequence.length - 1) animationIndex = 0;    
    }
}


function sendMessage(text){
    let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
    let inp = frame.getElementsByClassName('input')[0].children[0];
    let send = frame.getElementsByClassName('input')[0].children[1];

    inp.value = text;
    send.click();
    delAvatarSet(frame);
}
