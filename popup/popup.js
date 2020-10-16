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
        console.log("Ho ricevuto un click!");

        const enable = (tabs) => browser.tabs.sendMessage(
            tabs[0].id,     // integer
            {
                command: 'enable'
            }
        );

        const disable = (tabs) => browser.tabs.sendMessage(
            tabs[0].id,     // integer
            {
                command: 'disable'
            }
        );

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