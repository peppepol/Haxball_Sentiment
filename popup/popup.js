//START
browser.storage.local.get("textarea").then( res => {    
    try{
        document.getElementById("textarea").innerHTML = JSON.stringify(res.textarea, null, 1);
        if(res.textarea === undefined){
            document.getElementById("textarea").innerText = "{}";
            throw new Error("JSON Undefined");
        }
        document.getElementById("error").innerText = "Oggetto JSON valido!"
        document.getElementById("error").classList.remove("bg-warning");
        document.getElementById("error").classList.add("bg-success");
    }catch(err){
        if(err.message === "JSON Undefined")
            document.getElementById("error").innerText = "";
        else
            document.getElementById("error").innerText = "Oggetto JSON non valido!";

        document.getElementById("error").classList.add("bg-warning");
        document.getElementById("error").classList.remove("bg-success");
    }
});

browser.storage.local.get("extStatus").then( res => {
    document.getElementById("power-extension").classList.add("btn-danger");
    document.getElementById("power-extension").classList.remove("btn-success");
    document.getElementById("power-extension").innerText = "OFF";
});



browser.storage.local.get("animation").then(res =>{
    console.log(res);
    if(res.animation){
        document.getElementById("interval").disabled = false;
        document.getElementById("animation").checked = true;        
    }else{
        document.getElementById("interval").disabled = true;
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

//STORAGE CHANGED EVENT
browser.storage.onChanged.addListener((changes, areaName)=>{
    if ('textarea' in changes){
        console.log("\n\nOLD VALUE");
        console.log(changes.textarea.oldValue);
        console.log("NEW VALUE");
        console.log(changes.textarea.newValue);
        
        if(changes.textarea.newValue === undefined)
            document.getElementsByTagName("textarea")[0].innerText = "{}";
    }
});

//TAB IN TEXTAREA
document.getElementById('textarea').addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
        e.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
    
        // set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) +
        "   " + this.value.substring(end);
    
        // put caret at right position again
        this.selectionStart =
            this.selectionEnd = start + 1;
    }
  });

/////////////////////////////////////////////////////////////

/*
* Listener for clicks event
*/
function listenForClicks() {

    document.getElementById("animation").addEventListener("change",e =>{
        if(e.target.checked){
            browser.storage.local.set({
                animation: true
            })

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

            browser.tabs.query({active: true, currentWindow: true}).then(tabs =>{
                browser.tabs.sendMessage(tabs[0].id,{
                    command: 'start-animation'
                })
            })

            document.getElementById("interval").disabled = false;
            document.getElementById("interval").value = 1000;
        }else{
            browser.storage.local.set({
                animation: false
            })

            browser.tabs.query({active: true, currentWindow: true}).then(tabs =>{
                browser.tabs.sendMessage(tabs[0].id,{
                    command: 'stop-animation'
                })
            })

            document.getElementById("interval").disabled = true;
        }
    });

    document.getElementById("interval").addEventListener("input", e=>{
        browser.storage.local.set({
            interval: e.target.value
        })
    })
    
    document.getElementById("textarea").addEventListener("input", (e)=>{
        e.preventDefault();
        try{
            let textarea = document.getElementById("textarea");
            let json = JSON.parse(textarea.value);

            browser.storage.local.set({
                textarea: json
            })  
                .then(()=>{
                    document.getElementById("error").innerText = "Oggetto JSON valido!"
                    document.getElementById("error").classList.remove("bg-warning");
                    document.getElementById("error").classList.add("bg-success");
                });
            browser.tabs.query({active:true, currentWindow: true})
                .then( (tabs)=>{
                    browser.tabs.sendMessage(tabs[0].id,{
                        command: 'update'
                    });
                });
                
        }catch(err){
            document.getElementById("error").innerText = "Oggetto JSON non valido!"
            document.getElementById("error").classList.remove("bg-success");
            document.getElementById("error").classList.add("bg-warning");
        }
    });
    

    document.addEventListener("click", (e) => {

        /*
        * Enable web extension
        */
        const enable = (tabs) => {
            browser.storage.local.set({
                extStatus: true
            });
            browser.tabs.sendMessage(tabs[0].id, {
                command: 'enable'
            });
            //document.getElementById("extStatus").innerText = "ESTENSIONE ATTIVA";
        }
        
        /*
        * Disable web extension
        */
        const disable = (tabs) => {
            browser.storage.local.set({
                extStatus: false
            });
            browser.tabs.sendMessage(tabs[0].id,{
                command: 'disable'
            });
            //document.getElementById("extStatus").innerText = "";
        }

        /*
        * Report generic error in console
        */
        function reportError(error) {
            console.error(`Error report: ${error}`);
        }

    
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
    }
)};

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
* When the popup loads, inject a content script into the active tab.
* If we couldn't inject the script, handle the error.
*/
browser.tabs.executeScript({file: "/scripts/content.js"})
    .then(listenForClicks)
    .catch(reportExecuteScriptError);