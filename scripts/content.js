(function() {
  
    if (window.hasRun) {
      return;
    }

    window.hasRun = true;

    //GLOBAL VARIABLES
    var obj;
    var animationIndex = 0;
    let animationSequence = [];
    var interval = 100;
    var intervalFunction;
    let keys = ["5","6","7","8","9","0"];
    let arrow = ["ArrowLeft","ArrowUp","ArrowRight","ArrowDown"];


    /*
    * Handle any key pressed
    */
    function handleKey(e){
      //console.log(e.key);
      //console.log(obj);

      let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
      let inp = frame.getElementsByClassName('input')[0].children[0];
      let send = frame.getElementsByClassName('input')[0].children[1];
      
      if(keys.includes(e.key) || arrow.includes(e.key) && (e.key in obj)){
        let command = "/avatar " + (obj[e.key.toString()] === undefined ? "" : obj[e.key.toString()]);
        inp.value = command;
        send.click();
        delAvatarSet(frame);
      }
    }

    /*
    * Delete "Avatar set" from chat after commnad send
    */
    function delAvatarSet(frame){
      var notices = frame.body.getElementsByClassName("notice");
      for (var i = 0; i < notices.length; i++) {
        var notice = notices[i];
        if (notice.innerHTML == "Avatar set") {
          notice.parentNode.removeChild(notice);
        }
      }
    }

    function stopAnimation(){
      if(animationSequence[0] !== undefined)
          sendMessage("/avatar " + animationSequence[0]);
      else
          sendMessage("/avatar -");
      animationSequence = [];
      animationIndex = 0;
      clearInterval(intervalFunction);
    }

    function startAnimation(){      
      for(i=5; i<10; i++){
        if(obj[i] !== undefined && obj[i] !== ""){
          animationSequence.push(obj[i]);
        }
      }

      if(obj[0] !== undefined && obj[i] !== "") animationSequence.push(obj[0]);
      if(animationSequence.length === 0) animationSequence.push("O");     
      
      animationIndex = 0;
      
      intervalFunction = setInterval(animation, interval);
      
    }

    function animation(){
      sendMessage("/avatar " + animationSequence[animationIndex]);
      animationIndex++;
      if (animationIndex > animationSequence.length - 1) animationIndex = 0;   
    }

    function sendMessage(text){
      let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
      let inp = frame.getElementsByClassName('input')[0].children[0];
      let send = frame.getElementsByClassName('input')[0].children[1];
  
      inp.value = text;
      send.click();
      delAvatarSet(frame);
  }

    //LISTENER DEI MESSAGGI
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "enable") {
        let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
        browser.storage.local.get("textarea").then(r => obj=r.textarea);
        if(frame !== undefined){
          frame.addEventListener("keydown", handleKey)
        }
        
      }else if (message.command === "disable") {
        let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
        if(frame !== undefined){
          frame.removeEventListener("keydown", handleKey)
        }
      }else if (message.command === "update"){
        browser.storage.local.get("textarea").then(r => obj=r.textarea);

      }else if (message.command === "clear"){
        browser.storage.local.get("textarea").then(r => obj=r.textarea);
      }else if (message.command === "start-animation"){
        
        browser.storage.local.get("textarea").then(r => obj=r.textarea);
        browser.storage.local.get("interval").then(res => {
          if(isNaN(res.interval) || res.interval === ""){
            interval = 100;
          }else{
            interval = res.interval;
          }

          startAnimation();
        });
      }else if(message.command === "stop-animation"){
        stopAnimation();
      }
    });
  })();