(function() {

    if (window.hasRun) {
      return;
    }

    window.hasRun = true;

    var obj;
    browser.storage.local.get("textarea").then(r => obj=r.textarea);

    let keys = ["5","6","7","8","9","0"];
    function handleKey(e){
      //console.log(e.key);
      //console.log(obj);

      let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
      let inp = frame.getElementsByClassName('input')[0].children[0];
      let send = frame.getElementsByClassName('input')[0].children[1];
      
      if(keys.includes(e.key)){
        let command = "/avatar " + (obj[e.key] === undefined ? "" : obj[e.key]);

        inp.value = command;
        send.click();
        delAvatarSet(frame);
      }
    }

    //ELIMINAZIONE "Avatar set"
    function delAvatarSet(frame){
      var notices = frame.body.getElementsByClassName("notice");
      for (var i = 0; i < notices.length; i++) {
        var notice = notices[i];
        if (notice.innerHTML == "Avatar set") {
          notice.parentNode.removeChild(notice);
        }
      }
    }
  
    browser.runtime.onMessage.addListener((message) => {
      if (message.command === "enable") {
        let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
        if(frame !== undefined){
          frame.addEventListener("keypress", handleKey)
        }
        
      } else if (message.command === "disable") {
        let frame = document.getElementsByTagName('iframe')[0].contentWindow.document;
        if(frame !== undefined){
          frame.removeEventListener("keypress", handleKey)
        }
      }
    });
  
  })();