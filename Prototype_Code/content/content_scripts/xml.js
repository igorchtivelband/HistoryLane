if (document.implementation.hasFeature("XPath", "3.0")) 
{
    if ( typeof XMLDocument == "undefined" ) {
        XMLDocument = Document;
    }
    XMLDocument.prototype.selectNodes = function(cXPathString, xNode) {
        if ( !xNode ) { xNode = this; }
        var oNSResolver = this.createNSResolver(this.documentElement);
        var aItems = this.evaluate(cXPathString, xNode, oNSResolver, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var aResult = [];
        for ( var i = 0; i < aItems.snapshotLength; i++) {
            aResult[i] =  aItems.snapshotItem(i);
        }
        return aResult;
    }
    XMLDocument.prototype.selectSingleNode = function(cXPathString, xNode) 
	{
        if( !xNode ) { xNode = this; }
        var xItems = this.selectNodes(cXPathString, xNode);
        if ( xItems.length > 0 ) { return xItems[0]; }
        else { return null; }
    }
 
    Element.prototype.selectNodes = function(cXPathString) {
        if (this.ownerDocument.selectNodes) {
            return this.ownerDocument.selectNodes(cXPathString, this);
        } else { throw "For XML Elements Only"; }
    }
 
    Element.prototype.selectSingleNode = function(cXPathString) {
        if (this.ownerDocument.selectSingleNode) {
            return this.ownerDocument.selectSingleNode(cXPathString, this);
        } else { throw "For XML Elements Only"; }
    }
}


//This function receives the 
function getTabIdByPageID(page_id)
{
    var tab_id = xmlDataDoc.selectSingleNode(".//page[@page_id="+page_id+"]/parent::*").getAttribute('tab_id');
    return tab_id;
}

//This function receives the 
function getWindowIdByPageID(page_id)
{
    var window_id = xmlDataDoc.selectSingleNode(".//page[@page_id="+page_id+"]/parent::*/parent::window").getAttribute('window_id');
    return window_id;
}

//This function receives the 
function getWindowIdByTabId(tab_id,tab_open_time)
{
    var window_id = xmlDataDoc.selectSingleNode(".//tab[@tab_id="+tab_id+" and @open_time="+tab_open_time+"]/parent::window").getAttribute('window_id');
    return window_id;
}

function getTabNodeByComplexTabId(complex_tab_id)
{
    var tab_id = complex_tab_id.split("_")[1];
	
    var win_id = complex_tab_id.split("_")[0];

    var tab_node = xmlDataDoc.selectSingleNode(".//window[@window_id="+win_id+"]/tab[@tab_id="+tab_id+"]");
    
    return tab_node;
}

function getTabNodeByPageId(page_id)
{
    var tab_node = xmlDataDoc.selectSingleNode(".//page[@page_id="+page_id+"]/parent::tab");
    return tab_node;
}

function getPageNodeByPageId(page_id)
{
    var page_node = xmlDataDoc.selectSingleNode(".//page[@page_id="+page_id+"]");
    return page_node;
}

function setCommentAttributeValue(page_id,comment_value)
{
    xmlDataDoc.selectSingleNode(".//page[@page_id="+page_id+"]").setAttribute("comment",comment_value);
}

//This function returns the opening time of first window in chronological order
function getCanvasStartTime()
{
    var start_time = xmlDataDoc.selectSingleNode(".//window[last()]").getAttribute('open_time');
    
    var list_of_window_nodes = xmlDataDoc.selectNodes(".//window");
    
    for (var i=0;i<list_of_window_nodes.length;i++)
    {
	if (list_of_window_nodes[i].getAttribute('open_time')<start_time)
	    start_time= list_of_window_nodes[i].getAttribute('open_time');
    }
    
    return start_time;	
}

function getCanvasEndTime()
{
    var end_time = xmlDataDoc.selectSingleNode(".//window[last()]").getAttribute('close_time');
    
    var list_of_window_nodes = xmlDataDoc.selectNodes(".//window");
    
    for (var i=0;i<list_of_window_nodes.length;i++)
    {
	if (list_of_window_nodes[i].getAttribute('close_time') > end_time)
	    end_time = list_of_window_nodes[i].getAttribute('close_time');
    }
    
    return end_time;
}