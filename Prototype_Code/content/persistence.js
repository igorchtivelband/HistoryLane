

var DEFAULT_ACCESS_TYPE=2;

//This function opens connection to DB and returns the SQL statement based on provided input
function createSqlStatement(cmdText)
{
	try{
		Components.utils.import("resource://gre/modules/Services.jsm");  
		Components.utils.import("resource://gre/modules/FileUtils.jsm");  
  
		let file = FileUtils.getFile("ProfD", ["places.sqlite"]);  
		let mDBConn = Services.storage.openDatabase(file);
		let statement = mDBConn.createStatement(cmdText);
		
		return statement;
	}
	catch(err)
	{
		catchException(err,'createSqlStatement' + '_'+cmdText);
	}
}

//This function receives url, timestamps and receives the type of access for this page
function getEntryAccessType(url)
{
		var return_value=DEFAULT_ACCESS_TYPE;
		try
		{
			
			let statement = createSqlStatement("SELECT * FROM moz_historyvisits INNER JOIN moz_places ON moz_historyvisits.place_id=moz_places.id WHERE  moz_places.url=:url ORDER BY visit_date DESC LIMIT 1");
			statement.params.url = url; 
			
			try 
			{  
				while (statement.step()) 
				{  
					return_value = statement.row.visit_type;
				}  
			}  
			finally 
			{  
			statement.reset();  
			}  
		}
		catch(err)
		{
		catchException(err,'accessHistoryDB');
		}
		finally
		{
			return return_value;
		}
}

//This function checks if log tables in mozilla DB were created, and if not, then creates them
function connectDB()
{
	
	try{
		
		let statement = createSqlStatement("SELECT count(name) as number FROM sqlite_master WHERE type='table' AND name='windows'");  
		
		try 
			{
				statement.step();
				 
				if (!statement.row.number)
					{
						statement.reset();  
						executeSqlCommand(CONFIG_DB_COMMAND_1);
						executeSqlCommand(CONFIG_DB_COMMAND_2);
						executeSqlCommand(CONFIG_DB_COMMAND_3);
						executeSqlCommand(CONFIG_DB_CREATE_TABS_VIEW_COMMAND);
					} 
			}  
			finally 
			{  
				statement.reset();  
			}  
	}
	catch(err)
	{
		catchException(err,'connectDB');
	}
}


//This function executes SQL command withour returning any result
function executeSqlCommand(command_text)
{
	try
	{
		let statement = createSqlStatement(command_text);
		executeSqlStatement(statement);
	}
	catch(err)
	{
		catchException(err,'executeSqlCommand');
	}
}

function executeSqlStatement(statement)
{
	try
	{
		try
		{
			statement.execute();	
		}
		finally 
		{  
			statement.reset();  
		}  
	}
	catch(err)
	{
		catchException(err,'executeSqlStatement');
	}
}

//This function fetches data from DB and returns XML
function getDataForDiagram(timeFlag)
{
	try
	{
		let parser=new DOMParser();
		let xmlDoc=parser.parseFromString("<doc></doc>","text/xml");
		//Hour is a default choice
		let command_text=GET_LAST_HOUR_WINDOWS;
		
		if (timeFlag == 'Week')
			command_text=GET_LAST_DAY_WINDOWS;
		if (timeFlag == 'Day')
			command_text=GET_LAST_WEEK_WINDOWS;
		
		let statement = createSqlStatement(command_text);
		
		try{
			while (statement.step()) 
			{
				var windowNode=xmlDoc.createElement("window");
				windowNode.setAttribute("window_id",statement.row.window_id);
				xmlDoc.documentElement.appendChild(windowNode);
			}	
		}
		finally
		{
			statement.reset(); 	
		}
		
		let window_node_list=xmlDoc.selectNodes(".//window");
		for(var i=0;i<window_node_list.length;i++)
		{
			let maximumTabStatement = createSqlStatement(GET_TABS_PER_WINDOW);
			maximumTabStatement.params.window_id = window_node_list[i].getAttribute("window_id");
			try{
				statement.step();
				window_node_list[i].setAttribute("max_simult_tabs",statement.row.max_simult_tabs);	
			}
			finally
				{
					maximumTabStatement.reset();
				}		
		}
		return xmlDoc;
	}
	catch(err)
	{
		catchException(err,'GetDataForDiagram');
	}
}


var persistence = {
	
	'updateActiveTime': function(window_id,tab_id,page_id,active_time)
	{
		try
		{
			var command_text= 'UPDATE pages SET active_time='+active_time+' WHERE window_id='+window_id+' AND tab_id='+tab_id+' AND page_id='+page_id;
			executeSqlCommand(command_text);
		}
		catch(err)
		{
			catchException(err,'updateActiveTime');
		}
	},
	
	'updateFocusTime':function(window_id,tab_id,page_id,focus_time)
	{
		try
		{
			var command_text= 'UPDATE pages SET focus_time='+focus_time+' WHERE window_id='+window_id+' AND tab_id='+tab_id+' AND page_id='+page_id;
			executeSqlCommand(command_text);
		}
		catch(err)
		{
			catchException(err,'updateActiveTime');
		}
	}
	
};
