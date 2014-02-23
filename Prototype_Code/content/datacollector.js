
//This window id is used for saving the log
var window_id='';

var tabscounter=0;
//Number of simultaneously open tab, this number is updated every time that tab is opened or closed
var simult_tabs=0;
//Maximal number of simultaneously opened tabs, this parameter is important later for visulalization
var max_simult_tabs=0;
//Initially the focus will be always on the first tab
var current_focus_tab_pointer=1;
//Variable for storing the XML before it is flushed into file
var xmlDoc;


var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)  
                  .getInterface(Components.interfaces.nsIWebNavigation)  
                  .QueryInterface(Components.interfaces.nsIDocShellTreeItem)  
                  .rootTreeItem  
                  .QueryInterface(Components.interfaces.nsIInterfaceRequestor)  
                  .getInterface(Components.interfaces.nsIDOMWindow);


var datacollector={

    'init':function()
	{
		try
		{
			xmlDoc=config.initiateXml();
			connectDB();
			
			var container = gBrowser.tabContainer;
			window_id=Number(new Date());
			logger.documentWindowOpen(window_id);
			
			//Listeners to count tabs when opening or closing windows or tabs
			container.addEventListener("TabClose", logger.onTabClose, true);
			container.addEventListener("TabSelect", logger.onTabSelection, false);  
			gBrowser.addEventListener("load",datacollector.collectBrowserData, true);
			
			mainWindow.document.addEventListener("GetHistoryDataEvent", function(e) { chromeEventsListeners.getDataListener(e); }, false, true);
			mainWindow.document.addEventListener("updatePageCommentEvent", function(e) { chromeEventsListeners.updateCommentChromeEventListener(e); }, false, true);
			
			window.addEventListener("click",logger.onActiveEvent, true);
			window.addEventListener("scroll",logger.onActiveEvent, true);
			window.addEventListener("keypress",logger.onActiveEvent, true);
		}
		catch(err)
		{
			catchException(err,'init');
		}
	},
		
	//This handler is executed every time, that page is loaded
	'collectBrowserData': function(event)
	{
		try
		{
			if (event.originalTarget instanceof HTMLDocument) 
			{  
				var win = event.originalTarget.defaultView;  
				if (win.frameElement) 
					return;  
			
				var num = gBrowser.browsers.length;  
				for (var i = 0; i < num; i++) 
				{  
					var b = gBrowser.getBrowserAtIndex(i);  
				
					if (b.contentDocument==event.originalTarget)
					{
						//If this tab was never indexed, we add id now
						if(!b._myExtensionTabId)
						{
							b._myExtensionTabId = ++tabscounter;
							
							logger.writeOpenedTabData(b._myExtensionTabId,Number(new Date()),window_id);
						}
						//If this is a real page loaded through http protocol
						if(b.currentURI.spec.indexOf("http") !=-1)
						{
							logger.addAccessedSite(b._myExtensionTabId,b.currentURI.spec,b.contentTitle,datacollector.getFaviconPath(b.currentURI));
						}
					}
				}  
			}  
		}
		catch(err)
		{
			catchException(err,'collectBrowserData');
		}
	},
	
	'getFaviconPath':function(pageURI)
	{
		try
		{
			var faviconService = Components.classes["@mozilla.org/browser/favicon-service;1"].getService(Components.interfaces.nsIFaviconService);
			var faviconURI = faviconService.getFaviconImageForPage(pageURI);
			var linkToFavicon = faviconURI.spec.split("moz-anno:favicon:")[1];
			return linkToFavicon;
		}
		catch(err)
		{
			catchException(err,'getFaviconPath');
			return null;
		}
		
	}
	
};


function catchException(err,function_name)
{
		var txt="There was an error in function"+function_name+".\n\n";
		txt+="Error description: " + err.message + "\n\n";
		txt+="Click OK to continue.\n\n";
		alert(txt);
};

window.addEventListener(
    'load',
    function()
    {
        datacollector.init();
    },
    true
);

window.addEventListener("unload", function() { logger.onUnLoad(); }, false);

