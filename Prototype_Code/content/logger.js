

//This object is responsible for writing collected data into xml doc (but not into file)
var logger={
	
	//This function receives the tabID where webpage was accessed and the url.
	//Both of them are stored in XML
	'addAccessedSite': function(tabID,url,title,favicon_path)
	{
		try
		{
			title = title.replace("'","''");
		
			logger.setPreviousPageClosingTime(tabID);
			
			var pageNode=xmlDoc.createElement("page");
			let page_id = Number(new Date());
			
			var urlNode = xmlDoc.createElement("url");
			var urlTextNode = xmlDoc.createTextNode(url);
			urlNode.appendChild(urlTextNode);
			pageNode.appendChild(urlNode);
			
			pageNode.setAttribute("comingtimestamp",Number(new Date()));
			pageNode.setAttribute("visit_type",getEntryAccessType(url));
			pageNode.setAttribute("page_id",page_id);
			
			var titleNode = xmlDoc.createElement("title");
			var titleText=xmlDoc.createTextNode(title);
			titleNode.appendChild(titleText);
			pageNode.appendChild(titleNode);
			
			//If the page was loaded in focused browser, the focus time should be started for this page, and stopped for previous page
			if(gBrowser.selectedBrowser._myExtensionTabId==tabID)
			{
				pageNode.setAttribute("startfocustime",Number(new Date()));
				pageNode.setAttribute("focustime",0);
				//calculate focus time for previously accessed web page, if such page exists
				if(xmlDoc.selectNodes('.//tab[@id='+tabID+']/page').length)
				{
					logger.calculateFocusTime(tabID);	
				}
			}
			var tabNode = xmlDoc.selectSingleNode('.//tab[@id='+tabID+']');
			tabNode.appendChild(pageNode);
			
			//Saving data to DB
			let sql_command="INSERT INTO pages VALUES ("+page_id+","+tabID+","+window_id+","+ Number(new Date()) +","+getEntryAccessType(url)+",null,null,null,"+"'"+url+"','"+title+"','"+favicon_path+"',null)";
			executeSqlCommand(sql_command);
		
		}
		catch(err)
		{
			catchException(err,'addAccessedSite');
		}
	},
	
	'setPreviousPageClosingTime':function(tabID)
	{
		try
		{
			//If tab already has some page
			if ( xmlDoc.selectNodes('.//tab[@id='+tabID+']/page').length)
				{
				var pageNode = xmlDoc.selectSingleNode('.//tab[@id='+tabID+']/page[last()]');
				pageNode.setAttribute("leavingtimestamp",Number(new Date()));
	
				//Save to DB
				let sql_command="UPDATE pages SET leaving_time="+Number(new Date())+" WHERE page_id="+pageNode.getAttribute("page_id");
				executeSqlCommand(sql_command);
				}		
			}
		catch(err)
		{
			catchException(err,'setPreviousPageClosingTime');
		}
		
	},
	
	'writeOpenedTabData':function(tabID,timeStamp,window_id)
	{
		try
		{
		
			var tabNode=xmlDoc.createElement("tab");
			tabNode.setAttribute("id",tabID);
			tabNode.setAttribute("opentime",timeStamp);
			xmlDoc.documentElement.appendChild(tabNode);
			
			//Write data about new tab to DB
			let sql_command="INSERT INTO tabs VALUES ("+tabID+","+window_id+","+ timeStamp+",null)";
			executeSqlCommand(sql_command);
			
			simult_tabs++;
			if(simult_tabs>max_simult_tabs)
			{
				max_simult_tabs=simult_tabs;
				logger.writeMaxSimultTab();
			}
		
		}
		catch(err)
		{
			catchException(err,'writeOpenedTabData');
		}
	},
	
	'onUnLoad':function()
	{
		try
		{
			for (var i = 0; i < gBrowser.browsers.length; i++) 
			{  
				logger.closeTabLogging(gBrowser.getBrowserAtIndex(i));
			}
				
			//Save to DB
			let sql_command="UPDATE windows SET close_time="+Number(new Date())+" WHERE window_id="+window_id;
			executeSqlCommand(sql_command);
		}
		catch(err)
		{
			catchException(err,'onUnLoad');
		}
	},
	
	'onTabClose':function(e)
	{
		try
		{
			var browser = gBrowser.getBrowserForTab(e.target);
			
			logger.closeTabLogging(browser);
			
			simult_tabs--;
		}
		catch(err)
		{
			catchException(err,'onTabClose');
		}	
		
	},	
	
	//This function writes all the relevant data, when single tab is closed/unloaded
	'closeTabLogging':function(browser)
	{
		try
		{
		var tabNode = xmlDoc.selectSingleNode('.//tab[@id='+browser._myExtensionTabId+']');
		
		if(tabNode)
		{
		
			tabNode.setAttribute("closetime",Number(new Date()));
			
			logger.setPreviousPageClosingTime(browser._myExtensionTabId);
			
			//Save to DB
			let sql_command="UPDATE tabs SET close_time="+Number(new Date())+" WHERE window_id="+window_id+" AND tab_id="+browser._myExtensionTabId;
			executeSqlCommand(sql_command);
			
			//If this tab was not closed in background we should stop counting the focus time of last page
			if(browser._myExtensionTabId==gBrowser.selectedBrowser._myExtensionTabId)
				logger.calculateFocusTime(browser._myExtensionTabId)
			}
		}
		catch(err)
		{
			catchException(err,'closeTabLogging');
		}
	},
	
	'onTabSelection':function(event)
	{
		 var browser = gBrowser.selectedBrowser;  
  
		if(!browser._myExtensionTabId)
		{
			browser._myExtensionTabId = ++tabscounter;
						
			logger.writeOpenedTabData(browser._myExtensionTabId,Number(new Date()),window_id);
		}
		//take care of page that was previously in focus
		if(browser._myExtensionTabId!=current_focus_tab_pointer)
		{
			logger.calculateFocusTime(current_focus_tab_pointer);
		}
  
		current_focus_tab_pointer=browser._myExtensionTabId;
		//Start the focus time of the last page in the selected 
		var pageNode = xmlDoc.selectSingleNode('.//tab[@id='+current_focus_tab_pointer+']/page[last()]');
		pageNode.setAttribute("startfocustime",Number(new Date()));
	},
	
	'onActiveEvent':function(e)
	{
		try
		{
			//Find the active page
			var pageNode = xmlDoc.selectSingleNode('.//tab[@id='+current_focus_tab_pointer+']/page[last()]');
		
			if (pageNode)
			{
				if (!pageNode.getAttribute("activetimestamp"))
				{
					pageNode.setAttribute("activetime",0);
					pageNode.setAttribute("activetimestamp",Number(new Date()));
				}
				else
				{
					//If less then minimum_time_interval time passed, then active time is not summarized, only time stamp is updated
					if (Number(new Date())-pageNode.getAttribute("activetimestamp")>config.minimum_time_interval)
					{
						var previous_active_time_value = pageNode.getAttribute("activetime");
						pageNode.setAttribute("activetime",Number(Number(previous_active_time_value)+5000));
						
						//Save to DB
						persistence.updateActiveTime(window_id,current_focus_tab_pointer,pageNode.getAttribute('page_id'),pageNode.getAttribute("activetime"));
					}
					
					pageNode.setAttribute("activetimestamp",Number(new Date()));	
				}
			}
		}
		catch(err)
		{
		catchException(err,'onActiveEvent');
		}
	},
	
	'calculateFocusTime':function(TabID)
	{
	try
	{
		var pageNode = xmlDoc.selectSingleNode('.//tab[@id='+TabID+']/page[last()]');
	
		if( pageNode )
		{
			var previous_focus_time=pageNode.getAttribute("focustime");
			var previous_startfocustime=pageNode.getAttribute("startfocustime")
			pageNode.setAttribute("focustime",Number(previous_focus_time)+Number(new Date())-Number(previous_startfocustime));
			
			persistence.updateFocusTime(window_id,TabID,pageNode.getAttribute("page_id"),pageNode.getAttribute("focustime"));
		}
	}
	catch(err)
	{
		catchException(err,'calculateFocusTime');
	}
	},
	
	'documentWindowOpen':function(window_id)
	{
		try
		{
			var open_time= Number(new Date());
			var sql_command="INSERT INTO windows VALUES ("+window_id+","+ open_time+",null,0)";
			executeSqlCommand(sql_command);
		}
		catch(err)
		{
			catchException(err,'write_log');
		}
	},
	
	'writeMaxSimultTab':function()
	{
		try
		{
			let statement = createSqlStatement("UPDATE windows SET max_simult_tabs=:max_simult_tabs WHERE window_id=:window_id");
			statement.params.max_simult_tabs = max_simult_tabs;
			statement.params.window_id = window_id;
			executeSqlStatement(statement);
		}
		catch(err)
		{
			catchException(err,'write_log');
		}
	},
	
	'updateCommentInDB':function(page_id,comment_text)
	{
		try
		{
			let statement = createSqlStatement("UPDATE pages SET comment=:comment_text WHERE page_id=:page_id");
			statement.params.comment_text = comment_text;
			statement.params.page_id = page_id;
			executeSqlStatement(statement);
		}
		catch(err)
		{
			catchException(err,'write_log');
		}
	}
};

//This logger is used for debug needs
var file_writer = {
	
	'write_log':function(contentString)
	{
		try
		{
			var profile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
			
			//create proper path for xml file
			var theFile = profile.path + "/" + "metrics.xml";
			//create component for file writing
			var file = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath( theFile );
			if(file.exists() == false) //check to see if file exists
			{
				alert("creating file...");
				file.create( Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 420);
			}
			//create file output stream and use write/create/truncate mode
			//0x02 writing, 0x08 create file, 0x20 truncate length if exist
			var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			stream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
			stream.write(contentString, contentString.length);
			stream.close();
			//alert(theFile);
		}
		catch(err)
		{
			catchException(err,'write_log');
		}
	}
	
};