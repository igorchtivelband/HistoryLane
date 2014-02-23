
//This is event which is caught by chrome
var chromeEventsListeners = {  
		getDataListener: function(evt) {
			try{
				let windows_xml=((new XMLSerializer()).serializeToString(fetcher.getDataForDiagram(evt.target.getAttribute("time_interval"))));
				
				//alert(windows_xml);
				//file_writer.write_log(windows_xml);
				dispatchEventToDOM(windows_xml);
			
			}
			catch(err)
			{
				catchException(err,'getDataListener');
			}
		},
		
		updateCommentChromeEventListener:function(evt)
		{
			try{
				let page_id = window.content.document.getElementById("page_id_buffer").textContent;
				let comment_text = window.content.document.getElementById("comment").value;
			
				logger.updateCommentInDB(page_id,comment_text);
			}
			catch(err)
			{
				catchException(err,'updateCommentChromeEventListener');
			}
		}
}

//This is event, that is caught by document
function dispatchEventToDOM(windows_xml)
{
    var elm = window.content.document.getElementById("container");
    elm.setAttribute("windowsXmlString", windows_xml);
    var evt = window.content.document.createEvent("Events");
    evt.initEvent("myevent", true, false);
    elm.dispatchEvent(evt);
}


function drawCanvas()
{
	try
	{
		window.gBrowser.loadOneTab("chrome://datacollector/content/template.html", {inBackground: false});
	}
	catch(err)
	{
		catchException(err,'drawCanvas');
	}
}

//This function was created for reading the content of html template
function Read(file)
{
	try{
		var ioService=Components.classes["@mozilla.org/network/io-service;1"]
		    .getService(Components.interfaces.nsIIOService);
		var scriptableStream=Components
		    .classes["@mozilla.org/scriptableinputstream;1"]
		    .getService(Components.interfaces.nsIScriptableInputStream);
	    
		var channel=ioService.newChannel(file,'UTF-8',null);
		var input=channel.open();
		scriptableStream.init(input);
		var str=scriptableStream.read(input.available());
		scriptableStream.close();
		input.close();
		return str;
	}
	catch(err)
	{
		catchException(err,'Read file');
	}
}
