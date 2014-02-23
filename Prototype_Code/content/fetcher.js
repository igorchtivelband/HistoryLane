
var time_limit = 3600;
//This object is responsible for fetching data about windows,tabs,etc. from DB
var fetcher =
{

//This function fetches data from DB for presenting it as visual diagram
getDataForDiagram:function(timeFlag)
{
	try
	{
		let parser=new DOMParser();
		let xmlDoc=parser.parseFromString("<doc></doc>","text/xml");
		//Hour is a default choice
		let command_text= GET_WINDOWS;
		
		if (timeFlag == 'Day')
			
			time_limit=3600*24;
		
		let statement = createSqlStatement(command_text);
		statement.params.time_limit = time_limit;
		try{
			while (statement.step()) 
			{
				var windowNode=xmlDoc.createElement("window");
				windowNode.setAttribute("window_id",statement.row.window_id);
                               
                                windowNode.setAttribute("open_time",statement.row.open_time);
                               
                                windowNode.setAttribute("close_time",statement.row.close_time);
				xmlDoc.documentElement.appendChild(windowNode);
			}	
		}
		finally
		{
			statement.reset(); 	
		}
		 
		fetcher.getMaxTabsPerWindow(xmlDoc);
		fetcher.getTabsOfWindow(xmlDoc);
		fetcher.getPagesOfTab(xmlDoc);
		fetcher.getHistoryEnriesAndPutThenIntoXML(xmlDoc);
		fetcher.cleanData(xmlDoc);
		return xmlDoc;
	}
	catch(err)
	{
		catchException(err,'GetDataForDiagram');
	}
},

getMaxTabsPerWindow:function(xmlDoc)
{
	try
	{
		let window_node_list=xmlDoc.selectNodes(".//window");
		for(var i=0;i<window_node_list.length;i++)
		{
			let statement = createSqlStatement(GET_MAX_SIMULT_TABS_PER_WINDOW);
			statement.params.window_id = window_node_list[i].getAttribute("window_id");
			try{
				statement.step();
				window_node_list[i].setAttribute("max_simult_tabs",statement.row.max_simult_tabs);
			}
			finally
				{
					statement.reset();
				}		
		}	
	}
	catch(err)
	{
		catchException(err,'getMaxTabsPerWindow');
	}
},

getTabsOfWindow:function(xmlDoc)
{
	try{
		let window_node_list=xmlDoc.selectNodes(".//window");
		for(var i=0;i<window_node_list.length;i++)
		{
			let statement = createSqlStatement(sql_commands.GET_TABS_PER_WINDOW);
			statement.params.window_id = window_node_list[i].getAttribute("window_id");
			statement.params.time_limit = time_limit;
			
			try{
				while (statement.step()) 
				{
					//window_node_list[i].setAttribute("max_simult_tabs",statement.row.max_simult_tabs);
					var tabNode=xmlDoc.createElement("tab");
					
					tabNode.setAttribute("tab_id",statement.row.tab_id);
					tabNode.setAttribute("open_time",statement.row.open_time);
					tabNode.setAttribute("close_time",statement.row.close_time);
					
					window_node_list[i].appendChild(tabNode);
				}
			}
			finally
			{
					statement.reset();
			}		
		}	
	}
	catch(err)
	{
		catchException(err,'getPagesOfWindow');
	}
},

getPagesOfTab:function(xmlDoc)
{
	try{
		let window_node_list=xmlDoc.selectNodes(".//window");
		
		for(var i=0;i<window_node_list.length;i++)
		{
			let tab_node_list = window_node_list[i].selectNodes("./tab");
			
				for(var j=0;j<tab_node_list.length;j++)
				{
					
					let statement = createSqlStatement(sql_commands.GET_PAGES_PER_TAB);
					
					statement.params.window_id = window_node_list[i].getAttribute("window_id");
					statement.params.tab_id = tab_node_list[j].getAttribute("tab_id");
					statement.params.time_limit = time_limit;
					try
					{
						while (statement.step()) 
						{						
							var pageNode=xmlDoc.createElement("page");						
							pageNode.setAttribute("page_id",statement.row.page_id);						
							pageNode.setAttribute("coming_time",statement.row.coming_time);						
							pageNode.setAttribute("leaving_time",statement.row.leaving_time);						
							pageNode.setAttribute("title",statement.row.title);						
							pageNode.setAttribute("url",statement.row.url);
							pageNode.setAttribute("favicon_path",statement.row.favicon_path);
							pageNode.setAttribute("active_time",statement.row.active_time);
							pageNode.setAttribute("focus_time",statement.row.focus_time);
							pageNode.setAttribute("visit_time",pageNode.getAttribute("leaving_time")-pageNode.getAttribute("coming_time"));
							pageNode.setAttribute("comment",statement.row.comment);
							tab_node_list[j].appendChild(pageNode);
						}
					}
					finally
					{
						statement.reset();	
					}
					
				}
		}
	}
	catch(err)
	{
		catchException(err,'fether.getPagesOfTab');
	}
},

//This function receives the XML doc and extracts 
getHistoryEnriesAndPutThenIntoXML:function(xmlDoc)
{
	try{
	var pages = xmlDoc.getElementsByTagName("page");
	var pagesArray = Array.prototype.slice.call(pages, 0);
	
	pagesArray.sort(function(a,b) {
		var a_page_id = a.getAttribute("page_id");
		var b_page_id = b.getAttribute("page_id");
		if (a_page_id < b_page_id) return 1;
		if (a_page_id > b_page_id) return -1;
		return 0;
		});
	
	var historyNode=xmlDoc.createElement("history");
	
	for(var i=0;i<pagesArray.length;i++)
	{
		historyNode.appendChild(pagesArray[i].cloneNode(true));
	}
	
	xmlDoc.documentElement.appendChild(historyNode);
	}
	catch(err)
	{
		catchException(err,'fetcher.getHistoryEnriesAndPutThenIntoXML');
	}
},
//Remove empty tabs, empty windows and update max_open_tabs if needed
cleanData:function(xmlDoc)
{
	try{
		let list_empty_tab_nodes = xmlDoc.selectNodes(".//tab[count(./page)=0]");
		
		for(var i=0;i<list_empty_tab_nodes.length;i++)
		{
			list_empty_tab_nodes[i].parentNode.removeChild(list_empty_tab_nodes[i]);
		}
		
		let list_empty_window_nodes = xmlDoc.selectNodes(".//window[count(./tab)=0]");
		
		for(var i=0;i<list_empty_window_nodes.length;i++)
		{
			list_empty_window_nodes[i].parentNode.removeChild(list_empty_window_nodes[i]);
		}
		
		let list_windows = xmlDoc.selectNodes(".//window");
		
		for(var i=0;i<list_windows.length;i++)
		{
			if (list_windows[i].getAttribute("max_simult_tabs")>list_windows[i].selectNodes(".//tab").length)
			{
				list_windows[i].setAttribute("max_simult_tabs",list_windows[i].selectNodes(".//tab").length);
			}
		}
	}
	catch(err)
	{
		catchException(err,'fetcher.cleanData');
	}
}

};