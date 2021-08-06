var extensionEnabled = true;

var obj;
var animationSequence = [];
var animationIndex = 0;
var interval = 1000;

var intervalFunction;
var isPaused = true;
var elementsExist = false;

let keys = ["5","6","7","8","9","0"];
let arrows = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"];
let letters = [ "t", "y", "u", "i", "o", "p"];

var DOMinterval = null;

getData().then(()=>{
    createSequence();
    checkDOM();
    console.log("ESTENSIONE AVVIATA!");
});

browser.runtime.onMessage.addListener((message) => {
    if(message.command === "update-speed"){
        browser.storage.local.get("interval").then(res => {
            let p = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-speed");
            if(p)
                p.innerText = "Speed: " + res.interval + "ms";
        })
    }else if (message.command === "enable") {
        getData().then(()=>{
            createSequence();
            checkDOM();
            console.log("ESTENSIONE AVVIATA!");
        });
        extensionEnabled = true;
    }else if (message.command === "disable"){
        stopAnimation();
        clearParagraph();
        if(DOMinterval){
            clearInterval(DOMinterval);
            DOMinterval = false;
            console.log("ESTENSIONE DISATTIVATA!");
        }
        extensionEnabled = false;
    }
})


/*
document.getElementsByTagName("iframe")[0].contentWindow.document.getElementsByTagName("input")[0].addEventListener("keydown", e=>{
    if(e.key === "Enter"){
        if(isPaused && intervalFunction) isPaused = false;
    }else if(e.key === "Tab"){
        if(isPaused && intervalFunction) {
            isPaused = false;
        }
    }
})
*/

document.getElementsByTagName("iframe")[0].contentWindow.document.addEventListener("keydown", e => {
    if(extensionEnabled){
        if (e.key === "+") {
            browser.storage.local.get("animation").then(res => {
                res.animation ? stopAnimation() : startAnimation();
            })
        }else if(e.key === "Tab"){
            if(!isPaused && intervalFunction)
                isPaused = true;
        }


        if(isPaused && !intervalFunction){
            handleKey(e.key);
        }
    }
})

async function getData() {
    await browser.storage.local.get("extStatus").then(res => {
        extensionEnabled = res.extStatus;
    })

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
        sendMessage("/avatar " + animationSequence[animationIndex]);
    else
        sendMessage("/avatar -");

    animationSequence = [];
    animationIndex = 0;

    clearInterval(intervalFunction);
    intervalFunction=false;

    isPaused=true;

    editParagraph("Animation: 🔴");
    console.log("STOP ANIMAZIONE");
}

async function startAnimation() {
    isPaused=false;
    await getData();
    createSequence();

    console.log("INIZIO ANIMAZIONE CON: " + interval + "ms");
    browser.storage.local.set({ animation: true });
    
    animationIndex = 0;
    intervalFunction = setInterval(animation, interval);

    editParagraph("Animation: 🟢");
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

function createSequence(){
    
    keys.forEach( k => {
        if (obj[k] !== undefined && obj[k] !== "") {
            animationSequence.push(obj[k]);
        }
    })

    letters.forEach( l => {
        if(obj[l] !== undefined && obj[l] !== ""){
            animationSequence.push(obj[l]);
        }
    })
    
    if (animationSequence.length === 0) animationSequence.push("-");
}

/*
    * Handle any key pressed
    */
function handleKey(e){      
    if(keys.includes(e) || arrows.includes(e) && (e in obj)){
        if(obj[e] !== undefined) sendMessage("/avatar " + obj[e]);
    }
}

function createParagraph(){
    let stats_view = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementsByClassName("stats-view")[0];
    let p_animation = document.createElement("p");
    let p_speed = document.createElement("p");
    p_animation.id = "ext-animation";
    p_speed.id = "ext-speed";
    
    browser.storage.local.get("animation").then(res => {
        if(res.animation){
            p_animation.innerText = "Animation: 🟢";
        }else{
            p_animation.innerText = "Animation: 🔴";
        }
    });

    browser.storage.local.get("interval").then(res =>{
        if(res.interval){
            p_speed.innerText = "Speed: " + res.interval + "ms";
        }
    });

    if(stats_view)
        stats_view.appendChild(p_animation);
        stats_view.appendChild(p_speed);
}

function editParagraph(text){
    let p = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-animation");
    p.innerText = text;
}

function clearParagraph(){
    let p1 = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-animation");
    let p2 = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-speed");
    if(p1 && p2){
        p1.remove();
        p2.remove();
    }
}

function checkDOM(){

    let inputListener = false;
    let paragraph = false;

    function check(){
        let p = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-animation");
        if(!p){
            createParagraph();
            paragraph = true;
        }

        let input = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementsByTagName("input")[0];
        if(input && !inputListener){
            inputListener = true;
            input.addEventListener("keydown", e=>{
                if(e.key === "Enter"){
                    if(isPaused && intervalFunction) isPaused = false;
                }else if(e.key === "Tab"){
                    if(isPaused && intervalFunction) {
                        isPaused = false;
                    }
                }
            })
        }

        /*
        if(paragraph && inputListener){
            clearInterval(interval);
        } 
        */       
    }

    if(extensionEnabled)
        DOMinterval = setInterval(check, 1000);
        
}