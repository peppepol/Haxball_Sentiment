(function() {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
      return;
    }
    window.hasRun = true;
  
    /**
     * Given a URL to a beast image, remove all existing beasts, then
     * create and style an IMG node pointing to
     * that image, then insert the node into the document.
     */
    function insertTux(imgUrl) {
      removeTux();
      let tux = document.createElement("img");
      tux.setAttribute("src", imgUrl);
      tux.style.height = "100vh";
      tux.className = "tux-image";
      document.body.appendChild(tux);
    }
  
    /**
     * Remove every beast from the page.
     */
    function removeTux() {
      let existingBeasts = document.querySelectorAll(".tux-image");
      for (let img of existingBeasts) {
        img.remove();
      }
    }

    function sendMessage(){

    }

    function switchEmoji(key){
        switch(key){
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":

        }
    }
  
    /**
     * Listen for messages from the background script.
     * Call "beastify()" or "reset()".
    */
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "attiva") {
        insertTux(message.imgUrl);
        window.addEventListener('keypress', (e)=>{
            console.log(e.key);
        })
        let x = document.getElementsByTagName('iframe')[0].contentWindow.document.getElementsByClassName('input')[0].children[0];
        console.log(x);
        x.value("attia lupo");
      } else if (message.command === "disable") {
        removeTux();
        window.removeEventListener('keypress');
      }
    });
  
  })();