
var xmlCategoryDoc='';

var category_detector = {
    
    'initiate':function()
    {
        xhttp=new XMLHttpRequest();
	xhttp.open("GET","./categorization_resources/categories.xml",false);
	xhttp.send();
	xmlCategoryDoc=xhttp.responseXML;
    },
    
    'getCategoryColors':function(url_string)
    {
        var category_node_list = xmlCategoryDoc.selectNodes('.//category');
        for(var i=0;i<category_node_list.length;i++)
        {
            var sites_node_list = category_node_list[i].selectNodes('.//domain');
            for(var j=0;j<sites_node_list.length;j++)
            {
                if( url_string.indexOf(sites_node_list[j].textContent)>-1)
                {
                    var return_array={'default_color': category_node_list[i].getAttribute('default_color'),'focus_color':category_node_list[i].getAttribute('focus_color'), 'active_color':category_node_list[i].getAttribute('active_color')};
                    return return_array;
                }
            }
        }
        
        //Default colors
        var return_array={'default_color': '#BFD4D4','focus_color':'#94B8B8', 'active_color':'#669999'};
        return return_array;
    }
    
};