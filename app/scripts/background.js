browser.runtime.onInstalled.addListener((details) => {
  console.log("previousVersion", details.previousVersion);
});

browser.browserAction.setBadgeText({
  text: `3`,
});

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // if( request.greeting === "GetURL" )
  // {
  //     var tabURL = "Not set yet";
  //     chrome.tabs.query({active:true},function(tabs){
  //         if(tabs.length === 0) {
  //             sendResponse({});
  //             return;
  //         }
  //         tabURL = tabs[0].url;
  //         sendResponse( {navURL:tabURL} );
  //     });
  // }
  console.log("uhul");
});
