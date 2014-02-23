
var TimeEnum = {"Hour" : 0, "Day" : 1, "Week" : 3};


var config ={
	
	xml_template:"<window><profile></profile></window>",
	minimum_time_interval:5000,
	
	'initiateXml':function()
	{
		try
		{
			var parser=new DOMParser();
			var xmlDoc=parser.parseFromString(config.xml_template,"text/xml");
			var profileNode = xmlDoc.selectSingleNode('.//profile');
			var profileText=xmlDoc.createTextNode(config.getProfileName());
			profileNode.appendChild(profileText);
		
			return xmlDoc;
		}
		catch(err)
		{
			catchException(err,'initiateXml');
			return null;
		}
	},
	
	'getProfileName':function()
	{
		try
		{
			var path = Components.classes["@mozilla.org/file/directory_service;1"].getService( Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile).path;
			var startIndex = path.indexOf('Users')+6;
			var endIndex = path.indexOf('\AppData')-1;
	
			var profileName = path.substring(startIndex,endIndex);
			return profileName;
		}
		catch(err)
		{
			catchException(err,'getProfileName');
			return null;
		}
	}
};


const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;  
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

//Quersie for initiating DB

const CONFIG_DB_COMMAND_1= "CREATE TABLE windows ( window_id INTEGER, open_time INTEGER, close_time  INTEGER, max_simult_tabs INTEGER)";
const CONFIG_DB_COMMAND_2= "CREATE TABLE tabs (  tab_id INTEGER, window_id INTEGER, open_time INTEGER, close_time  INTEGER )";
const CONFIG_DB_COMMAND_3= "CREATE TABLE pages ( page_id INTEGER,  tab_id INTEGER, window_id INTEGER, coming_time INTEGER ,visit_type INTEGER , active_time INTEGER, focus_time INTEGER, leaving_time INTEGER , url VARCHAR(256) , title VARCHAR(256), favicon_path VARCHAR(256), comment VARCHAR(512))";

const CONFIG_DB_CREATE_TABS_VIEW_COMMAND="CREATE VIEW select_simult_tabs as \
 SELECT TabsA.window_id as window_id,TabsA.tab_id, count(*)+1 as count \
 FROM tabs as TabsA INNER JOIN tabs AS TabsB \
 ON TabsA.window_id = TabsB.window_id AND TabsA.open_time<=TabsB.open_time AND TabsA.close_time>=TabsB.close_time \
 GROUP BY TabsA.window_id,TabsA.tab_id";


const GET_WINDOWS = "SELECT window_id,CASE WHEN open_time <= (strftime('%s','now')-:time_limit)*1000 THEN (strftime('%s','now')-:time_limit)*1000 ELSE open_time END as open_time, CASE WHEN close_time IS NULL THEN strftime('%s','now')*1000 ELSE close_time END as close_time \
                   FROM windows  WHERE  close_time>=(strftime('%s','now')-:time_limit)*1000  or close_time IS NULL ORDER BY window_id DESC";

//Querie for getting the maximal amount of simultaneuously open tabs per specific window
const GET_MAX_SIMULT_TABS_PER_WINDOW="SELECT max_simult_tabs FROM windows WHERE window_id=:window_id";

//Querie for fetching pages by window_id, this querie is used by fetcher.getPagesOfWindow
const GET_TABS_PER_WINDOW="SELECT * FROM tabs WHERE window_id=:window_id ORDER BY open_time ";

var sql_commands={
	
	GET_TABS_PER_WINDOW:"SELECT tab_id, window_id, CASE WHEN open_time <= (strftime('%s','now')-:time_limit)*1000 THEN (strftime('%s','now')-:time_limit)*1000 ELSE open_time END as open_time, CASE WHEN close_time IS NULL THEN strftime('%s','now')*1000 ELSE close_time END as close_time FROM tabs WHERE window_id=:window_id and (close_time>=(strftime('%s','now')-:time_limit)*1000 or close_time IS NULL) ORDER BY open_time",
	GET_PAGES_PER_TAB:"SELECT page_id,tab_id, window_id,url, title,favicon_path,comment,CASE WHEN coming_time <= (strftime('%s','now')-:time_limit)*1000 THEN (strftime('%s','now')-:time_limit)*1000 ELSE coming_time END as coming_time, CASE WHEN leaving_time IS NULL THEN strftime('%s','now')*1000 ELSE leaving_time END as leaving_time, CASE WHEN active_time IS NULL THEN 0 ELSE active_time END as active_time, CASE WHEN focus_time IS NULL THEN 0 ELSE focus_time END as focus_time FROM pages WHERE window_id=:window_id AND tab_id=:tab_id AND url!='about:home' and length(title) and (leaving_time>=(strftime('%s','now')-:time_limit)*1000 or leaving_time IS NULL) ORDER BY coming_time"
};