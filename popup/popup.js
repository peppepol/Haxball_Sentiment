//START
browser.storage.local.get("textarea").then( res => {
    document.getElementsByTagName("textarea")[0].innerText = JSON.stringify(res.textarea);
    try{
        JSON.stringify(res.textarea);
        document.getElementById("error").innerText = "Oggetto JSON valido!"
    }catch(err){
        document.getElementById("error").innerText = "Oggetto JSON non valido!"
    }
});

browser.storage.onChanged.addListener((changes, areaName)=>{
    console.log("Local Storage aggiornato correttamente!");
})

browser.storage.local.get("extStatus").then( res => {
    document.getElementById("extStatus").innerText = (res.extStatus ? "ESTENSIONE ATTIVA!": "");
});

/////////////////////////////////////////////////////////////

function listenForClicks() {
    const textarea = document.getElementsByTagName("textarea")[0];
    textarea.addEventListener('input',(e)=>{
        let message;
        try{
            message = JSON.parse(textarea.value);
            browser.storage.local.set({
                textarea: message
            })  
                .then(()=>{
                    document.getElementById("error").innerText = "Oggetto JSON valido!";
                })
        }catch(err){
            document.getElementById("error").innerText = "Oggetto JSON non valido!";
        }        
    })

    document.addEventListener("click", (e) => {
        //console.log("Ho ricevuto un click!");

        const enable = (tabs) => {
            
            browser.storage.local.set({
                extStatus: true
            });
            browser.tabs.sendMessage(tabs[0].id, {
                command: 'enable'
            });

            document.getElementById("extStatus").innerText = "ESTENSIONE ATTIVA";
        }
        

        const disable = (tabs) => {
            
            browser.storage.local.set({
                extStatus: false
            });
            browser.tabs.sendMessage(tabs[0].id,{
                command: 'disable'
            });
            document.getElementById("extStatus").innerText = "";
        }

        /**
        * Just log the error to the console.
        */
        function reportError(error) {
            console.error(`Error report: ${error}`);
        }

        /**
        * Get the active tab,
        * then call "beastify()" or "reset()" as appropriate.
        */
        if (e.target.classList.contains("btn-enable")) {
            browser.tabs.query({active: true, currentWindow: true})
                .then(enable)
                .catch(reportError);
        }else if (e.target.classList.contains("btn-disable")) {
            browser.tabs.query({active: true, currentWindow: true})
                .then(disable)
                .catch(reportError);
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
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browser.tabs.executeScript({file: "/scripts/content.js"})
    .then(listenForClicks)
    .catch(reportExecuteScriptError);