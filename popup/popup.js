/**
 * CSS to hide everything on the page,
 * except for elements that have the "beastify-image" class.
 */
const hidePage = `body > :not(.tux-image) {
    display: none;
  }`;

/**
* Listen for clicks on the buttons, and send the appropriate message to
* the content script in the page.
*/
function listenForClicks() {
    document.addEventListener("click", (e) => {

        /**
        * Insert the page-hiding CSS into the active tab,
        * then get the beast URL and
        * send a "beastify" message to the content script in the active tab.
        */
        function attiva(tabs) {
            browser.tabs.insertCSS({code: hidePage}).then(() => {
                let url = browser.extension.getURL("img/tux.jpg")
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "attiva",
                    imgUrl: url
                });
            });
        }

        /**
        * Remove the page-hiding CSS from the active tab,
        * send a "reset" message to the content script in the active tab.
        */
        function disattiva(tabs) {
            browser.tabs.removeCSS({code: hidePage}).then(() => {
                browser.tabs.sendMessage(tabs[0].id, {
                    command: "disable",
                });
            });
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
        if (e.target.classList.contains("active")) {
            browser.tabs.query({active: true, currentWindow: true})
                .then(attiva)
                .catch(reportError);
        }else if (e.target.classList.contains("disable")) {
            browser.tabs.query({active: true, currentWindow: true})
                .then(disattiva)
                .catch(reportError);
        }
    }
)};

/**
* There was an error executing the script.
* Display the popup's error message, and hide the normal UI.
*/
function reportExecuteScriptError(error) {
    document.querySelector("#popup-content").classList.add("hidden");
    document.querySelector("#error-content").classList.remove("hidden");
    console.error(`Failed to execute beastify content script: ${error.message}`);
}

/**
* When the popup loads, inject a content script into the active tab,
* and add a click handler.
* If we couldn't inject the script, handle the error.
*/
browser.tabs.executeScript({file: "/scripts/script.js"})
    .then(listenForClicks)
    .catch(reportExecuteScriptError);