//CONSTANT
const EXT_NAME= "[Haxball Sentiment]";

// Variable to check if extension is active
var extensionEnabled = true;

// JSON from textarea
var obj;

// Animation global variables
var animationSequence = [];
var animationIndex = 0;
var interval = 1000;
var isPaused = true;

// All keys available
const keys = ["5","6","7","8","9","0"];
const arrows = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"];
const letters = [ "t", "y", "u", "i", "o", "p"];

// Intervals to handle DOM and animation
var DOMinterval = null;
var animationInterval = null;
var animationControlInterval = null;

// Objects in DOM
var inputBar = false;
var extParagraphs = false;

// Load first data so as not leave variables empty
getData().then(()=>{
    checkDOM();
    console.debug(EXT_NAME + " Extension enabled!");
});


// Listener of messages with popup
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
            console.debug(EXT_NAME + " Extension enabled!");
        });
        extensionEnabled = true;
    }else if (message.command === "disable"){
        stopAnimation();
        clearParagraph();
        if(DOMinterval){
            clearInterval(DOMinterval);
            DOMinterval = false;
            console.debug(EXT_NAME + " Extension disabled!");
        }
        extensionEnabled = false;
    }else if(message.command === "update-textarea"){
        browser.storage.local.get("textarea").then(res => obj=res.textarea);
    }
})

// Listener for keys in iframe box
document.getElementsByTagName("iframe")[0].contentWindow.document.addEventListener("keydown", e => {
    if(extensionEnabled){
        if (e.key === "+") {
            browser.storage.local.get("animation").then(res => {
                res.animation ? stopAnimation() : startAnimation();
            })
        }else if(e.key === "Tab"){
            if(!isPaused && animationInterval)
                isPaused = true;
        }


        if(isPaused && !animationInterval){
            handleKey(e.key);
        }
    }
})

// Get data from storage
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

// Delete last message in chat with 'Avatar set'
function delAvatarSet(frame) {
    var notices = frame.body.getElementsByClassName("notice");
    for (var i = 0; i < notices.length; i++) {
        var notice = notices[i];
        if (notice.innerHTML === "Avatar set") {
            notice.parentNode.removeChild(notice);
        }
    }
}

// Stop animation control
function stopAnimation() {
    browser.storage.local.set({ animation: false });
    if(animationSequence[0] !== undefined)
        sendMessage("/avatar " + animationSequence[animationIndex]);
    else
        sendMessage("/avatar -");

    animationSequence = [];
    animationIndex = 0;

    clearInterval(animationInterval);
    clearInterval(animationControlInterval);
    
    animationInterval=false;
    animationControlInterval=false;

    isPaused=true;

    editParagraph("Animation: 🔴");
    console.debug(EXT_NAME + " Animation stopped!");
}

// Start animation control
async function startAnimation() {
    isPaused=false;
    await getData();
    createSequence();
    checkControls();

    console.debug(EXT_NAME + " Start animation with: " + interval + "ms");
    browser.storage.local.set({ animation: true });
    
    animationIndex = 0;
    animationInterval = setInterval(animation, interval);

    editParagraph("Animation: 🟢");
}

// Animation frame control
function animation() {
    if(!isPaused){
        sendMessage("/avatar " + animationSequence[animationIndex]);
        animationIndex++;
        if (animationIndex > animationSequence.length - 1) animationIndex = 0;    
    }
}

// Send generic message in chat (with 'Avatar set' removed)
function sendMessage(text){
    let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
    let inp = frame.getElementsByClassName('input')[0].children[0];
    let send = frame.getElementsByClassName('input')[0].children[1];

    inp.value = text;
    send.click();
    delAvatarSet(frame);
}

// Create animation sequence
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

// Handling pressed keys
function handleKey(e){      
    if(keys.includes(e) || arrows.includes(e) && (e in obj)){
        if(obj[e] !== undefined) sendMessage("/avatar " + obj[e]);
    }
}

// Create animation and speed paragraph
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

    if(stats_view){
        stats_view.appendChild(p_animation);
        stats_view.appendChild(p_speed);
    }
}

// Edit animation paragraph
function editParagraph(text){
    let p = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-animation");
    p.innerText = text;
}

// Clear aniamtion and speed paragraph
function clearParagraph(){
    let p1 = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-animation");
    let p2 = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-speed");
    if(p1 && p2){
        p1.remove();
        p2.remove();
    }
}

// Check if input bar exists and put listener
function checkControls(){
    
    let inputListener = false;
    
    const check  = ()=>{
        
        if(!inputBar){
            inputListener = false;
        }

        if(inputBar && !inputListener){
            let input = document.getElementsByTagName("iframe")[0].contentWindow.document.querySelectorAll('input[data-hook="input"]')[0];
            input.addEventListener("keydown", e=>{
                if(e.key === "Enter"){
                    if(isPaused && animationInterval) isPaused = false;
                }else if(e.key === "Tab"){
                    if(isPaused && animationInterval) {
                        isPaused = false;
                    }
                }
            });

            inputListener = true;
        }
    }
    
    animationControlInterval = setInterval(check, 1000);
}

// Check with an interval if DOM is loaded
function checkDOM(){

    const checkParagraph = ()=>{
        let p = document.getElementsByTagName("iframe")[0].contentWindow.document.getElementById("ext-animation");
        if(!p){
            createParagraph();
            extParagraphs = true;
        }
    }

    const checkInputBar = ()=>{
        let input = document.getElementsByTagName("iframe")[0].contentWindow.document.querySelectorAll('input[data-hook="input"]')[0];
        if(input) inputBar = true;
        else inputBar = false;
    }

    if(extensionEnabled) {
        DOMinterval = setInterval(()=>{
            checkInputBar();
            checkParagraph();
        }, 1000);
    }
}