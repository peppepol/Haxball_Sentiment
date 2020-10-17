//START
browser.storage.local.get("textarea").then( res => {
   
    document.getElementsByTagName("textarea")[0].innerHTML = JSON.stringify(res.textarea, null, 1);
    try{
        if(res.textarea === undefined){
            document.getElementsByTagName("textarea")[0].innerText = "{}";
            throw new Error("JSON Undefined");
        }
        JSON.stringify(res.textarea);
        document.getElementById("error").innerText = "Oggetto JSON valido!"
    }catch(err){
        if(err.message === "JSON Undefined")
            document.getElementById("error").innerText = "";
        else
            document.getElementById("error").innerText = "Oggetto JSON non valido!";
    }
});

browser.storage.local.get("extStatus").then( res => {
    document.getElementById("extStatus").innerText = (res.extStatus ? "ESTENSIONE ATTIVA!": "");
});

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
document.getElementsByClassName('textarea')[0].addEventListener('keydown', function(e) {
    if (e.key == 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
  
      // set textarea value to: text before caret + tab + text after caret
      this.value = this.value.substring(0, start) +
      " " + this.value.substring(end);
  
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
            document.getElementById("extStatus").innerText = "ESTENSIONE ATTIVA";
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
            document.getElementById("extStatus").innerText = "";
        }

        /*
        * Report generic error in console
        */
        function reportError(error) {
            console.error(`Error report: ${error}`);
        }

    
        if (e.target.classList.contains("btn-enable")) {
            browser.tabs.query({active: true, currentWindow: true})
                .then(enable)
                .catch(reportError);
        }else if (e.target.classList.contains("btn-disable")) {
            browser.tabs.query({active: true, currentWindow: true})
                .then(disable)
                .catch(reportError);
        }else if(e.target.classList.contains("btn-set")){
            try{
                const textarea = document.getElementsByTagName("textarea")[0];
                let message;
                message = JSON.parse(textarea.value);
                browser.storage.local.set({
                    textarea: message
                })  
                    .then(()=>{
                        document.getElementById("error").innerText = "Oggetto JSON valido!";
                    });
                browser.tabs.query({active:true, currentWindow: true})
                    .then( (tabs)=>{
                        browser.tabs.sendMessage(tabs[0].id,{
                            command: 'update'
                        });
                    });
            }catch(err){
                document.getElementById("error").innerText = "Oggetto JSON non valido!";
            }
        }else if(e.target.classList.contains("btn-clear")){
            browser.storage.local.remove("textarea");
            browser.tabs.query({active:true, currentWindow: true})
                    .then( (tabs)=>{
                        browser.tabs.sendMessage(tabs[0].id,{
                            command: 'clear'
                        });
                    });
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