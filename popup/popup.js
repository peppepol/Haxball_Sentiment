// STARTUP CHECKS
// Textarea
listenerPopup();
browser.storage.local.get("textarea").then( res => {    
    try{
        document.getElementById("textarea").innerHTML = JSON.stringify(res.textarea, null, 1);
        if(res.textarea === undefined){
            document.getElementById("textarea").innerText = "{}";
            throw new Error("JSON Undefined");
        }
        document.getElementById("error").innerText = "JSON verified!"
        document.getElementById("error").classList.remove("bg-warning");
        document.getElementById("error").classList.add("bg-success");
    }catch(err){
        if(err.message === "JSON Undefined")
            document.getElementById("error").innerText = "";
        else
            document.getElementById("error").innerText = "JSON not verified!";

        document.getElementById("error").classList.add("bg-warning");
        document.getElementById("error").classList.remove("bg-success");
    }
});

// Extension status
browser.storage.local.get("extStatus").then( res => {
    if(res.extStatus){
        document.getElementById("power-extension").classList.add("btn-danger");
        document.getElementById("power-extension").classList.remove("btn-success");
        document.getElementById("power-extension").innerText = "OFF";
    }else{
        document.getElementById("power-extension").classList.remove("btn-danger");
        document.getElementById("power-extension").classList.add("btn-success");
        document.getElementById("power-extension").innerText = "ON";
    }
});

// Animation status
browser.storage.local.get("animation").then(res =>{
    
    if(res.animation){
        browser.storage.local.set({
            aniamtion: false
        });
        document.getElementById("animation").checked = false;
    }

    browser.storage.local.get("interval").then( res => {
        if(isNaN(res.interval) || res.interval === ""){
            document.getElementById("interval").value =  1000;
            browser.storage.local.set({
                interval: 1000
            })
        }else{
            document.getElementById("interval").value = res.interval;
        }
    })
    .catch(e => document.getElementById("interval").value = 1000);
})

//TAB IN TEXTAREA
document.getElementById('textarea').addEventListener('keydown', (e) => {
    if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
    
        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) +
        "   " + this.value.substring(end);
    
        // put caret at right position again
        this.selectionStart = this.selectionEnd = start + 1;
    }
});


// LISTENER FOR THE POPUP
function listenerPopup() {

    // Listener interval input
    document.getElementById("interval").addEventListener("input", e=>{
        if(!isNaN(e.target.value) && e.target.value !== ""){
            browser.storage.local.set({
                interval: e.target.value
            })            
        }else{
            browser.storage.local.set({
                interval: 1000
            })
        }

        browser.tabs.query({active: true, currentWindow: true}).then(tabs =>{
            browser.tabs.sendMessage(tabs[0].id,{
                command: 'update-speed'
            })
        })
    })
    
    // Listener textarea input
    document.getElementById("textarea").addEventListener("input", (e)=>{
        e.preventDefault();
        try{
            let textarea = document.getElementById("textarea");
            let json = JSON.parse(textarea.value);

            browser.storage.local.set({
                textarea: json
            })  
                .then(()=>{
                    document.getElementById("error").innerText = "JSON verified!"
                    document.getElementById("error").classList.remove("bg-warning");
                    document.getElementById("error").classList.add("bg-success");
                });
            browser.tabs.query({active:true, currentWindow: true})
                .then( (tabs)=>{
                    browser.tabs.sendMessage(tabs[0].id,{
                        command: 'update-textarea'
                    });
                });
                
        }catch(err){
            document.getElementById("error").innerText = "JSON not verified!"
            document.getElementById("error").classList.remove("bg-success");
            document.getElementById("error").classList.add("bg-warning");
        }
    });
    

    // Listener extension power button
    document.addEventListener("click", (e) => {

        // Function enable
        const enable = (tabs) => {
            browser.storage.local.set({
                extStatus: true
            });
            browser.tabs.sendMessage(tabs[0].id, {
                command: 'enable'
            });
        }
        
        // Function disable
        const disable = (tabs) => {
            browser.storage.local.set({
                extStatus: false
            });
            browser.tabs.sendMessage(tabs[0].id,{
                command: 'disable'
            });

            browser.storage.local.get("animation").then(res =>{
                if(res.animation){
                    document.getElementById("animation").checked = false;
                    browser.storage.local.set({
                        animation: false
                    })
                }
            });
        }

        // Clicks condition    
        if (e.target.id === "power-extension") {
            if(document.getElementById(e.target.id).innerText === "ON"){
                document.getElementById("power-extension").innerText = "OFF";
                document.getElementById(e.target.id).classList.add("btn-danger");
                document.getElementById(e.target.id).classList.remove("btn-success");
                browser.tabs.query({active: true, currentWindow: true})
                    .then(enable)
                    .catch(reportError);
            }else{
                document.getElementById("power-extension").innerText = "ON";
                document.getElementById(e.target.id).classList.add("btn-success");
                document.getElementById(e.target.id).classList.remove("btn-danger");
                browser.tabs.query({active: true, currentWindow: true})
                    .then(disable)
                    .catch(reportError);
            }   
        }

        // Generic error report
        function reportError(error) {
            console.error(`Error report: ${error}`);
        }
    }
)};

// GENERIC SCRIPT ERROR REPORT
function reportExecuteScriptError(error) {
    console.error(`Failed to execute content script: ${error.message}`);
}