
var tabs_layer;
var tab_stage;
var rails_array=new Array();

//This function simulates an object
function Rail()
{
    this.flag = 0;
    this.group='';
}

var tab_analysis = {
	
	'initiate':function()
	{
            var containerDiv = document.getElementById("tab_div");
	
	if (tab_stage==null)
	tab_stage = new Kinetic.Stage({
          container: "tab_div",
          width: containerDiv.offsetWidth-1,
          height: containerDiv.offsetHeight,
	  name:'tab_stage'
	  
        });
	
	tab_stage.removeChildren();
	
	if (tabs_layer == null)
		tabs_layer = new Kinetic.Layer();
	
	tabs_layer.removeChildren();
	
        tab_analysis.drawRails();
	tab_stage.add(tabs_layer);

	},
        
        'drawRails':function()
        {
	    rails_array=new Array();
            for(var i=0;i<initial_rails_number;i++)
            {
                tab_analysis.drawRail(i);
            }
        },
	
	'drawRail':function(i)
	{
		var tabDiv = document.getElementById("tab_div");
		
		rail_group = new Kinetic.Group({
                name:'rail_group',	
                draggable: false
                });
                
                var rect = new Kinetic.Rect({
                x: 0,
                y: RAIL_HEIGHT*i,
                width: tabDiv.offsetWidth*1.5,
                height: RAIL_HEIGHT,
                fill: "#F4F4F4",
                stroke: "black",
                strokeWidth: 0,
		name:'rail'
                });
                
                rail_group.add(rect);
               
                var rail_object= new Rail();
                rail_object.flag=0;
                rail_object.group=rail_group;
                rails_array.push(rail_object);
                tabs_layer.add(rail_group);
	}
	
};


////This function is executed, when we try to add tab
function AdjustNumberOfRailsOnAdding()
{
	for(var i=0;i<rails_array.length;i++)
	{
		if(rails_array[i].flag==0)
			return;
	}
	//If code arrived this point, then rail should be added
	tab_analysis.drawRail(rails_array.length);
	
	//Adjust the size of both canvases
	var window_div = document.getElementById('kinect_container');
	var new_height = window_div.offsetHeight - RAIL_HEIGHT;
	window_div.style.height = new_height + 'px';
	
	var tab_analysis_div = document.getElementById('tab_div');
	new_height = tab_analysis_div.offsetHeight + RAIL_HEIGHT;
	tab_analysis_div.style.height = new_height + 'px';
	tab_analysis_div.style.top = (tab_analysis_div.style.top.substring(0,3) - RAIL_HEIGHT)+'px';
	//Enlarge the tab_stage
	tab_stage.setSize(tab_stage.getWidth(),tab_stage.getHeight()+RAIL_HEIGHT);
}

//This function is executed, after that tab is removed from analysis area
function AdjustNumberOfRailsOnRemoving()
{
	//Check if the number of rails is bigger, than minimum
	if (rails_array.length>initial_rails_number)
	{
		rails_array[rails_array.length-1].group.getParent().remove(rails_array[rails_array.length-1].group);
		rails_array.pop();
		
		//Adjust the size of both canvases
		var tab_analysis_div = document.getElementById('tab_div');
		var new_height = tab_analysis_div.offsetHeight - RAIL_HEIGHT;
		tab_analysis_div.style.height = new_height + 'px';
		tab_analysis_div.style.top = Number((Number(tab_analysis_div.style.top.substring(0,3)) + RAIL_HEIGHT))+'px';
		
		var window_div = document.getElementById('kinect_container');
		new_height = window_div.offsetHeight + RAIL_HEIGHT;
		window_div.style.height = new_height + 'px';
		
		tab_stage.setSize(tab_stage.getWidth(),tab_stage.getHeight()-RAIL_HEIGHT);
	}
}


function setTabDiagramIntoTabCanvas(tab_rectangle,rail_number)
{
	var tabObject= new  TabAnalysisTabEntity();
	
	var complex_tab_id = tab_rectangle.getId();
	
	var tab_node = getTabNodeByComplexTabId(complex_tab_id);
	
	tabObject.initiate(tab_node);
	
	var analysis_tab_group=tabObject.generateTabForAnalysisCanvas(rail_number);

	rails_array[rail_number].group.add(analysis_tab_group);
}

function setTabGroupPositionInMainCanvas(tab_group)
{
	removeTheShadow(tab_group);
	
	for(var i=0;i<rails_array.length;i++)
	{
		if(rails_array[i].group==tab_group.getParent())
		{
			rails_array[i].group.remove(tab_group);
			rails_array[i].flag=0;
			break;
		}
	}
	AdjustNumberOfRailsOnRemoving();
	
	drawWindowsInCanvas();
}

//This function is used to put the shadow instead of moved rectangle
//as input it receives the tab_group that has to be substituted
function putTheShadow(tab_group)
{
	var tab_rectangle= tab_group.get('.tab_rect')[0];
	
	var rect = new Kinetic.Rect({
			  x: tab_group.getX(),
			  y: tab_group.getY(),
			  width: tab_rectangle.getWidth(),
			  height: tab_rectangle.getHeight(),
			  fill: "#FFC4C4",
			  stroke: "black",
			  strokeWidth: 1,
			  id:tab_rectangle.getId()+'_shadow'
			});
	
	return rect;
	
}

function getShadowRectangle(tab_group)
{
	var tab_rectangle = tab_group.get('.tab_rect')[0];
	var shadow_id='#'+tab_rectangle.getId()+'_shadow';
	var shadow_rect = windows_layer.get(shadow_id)[0];
	return shadow_rect;
}
//This function is used to remove the shadow rectangle
function removeTheShadow(tab_group)
{
	var shadow_rect = getShadowRectangle(tab_group);
	
	if(shadow_rect!=undefined)
	windows_layer.remove(shadow_rect);
}

function OnMouseOverToShadow(tab_group)
{
	var shadow_rect = getShadowRectangle(tab_group)
	
	//add the shadow
	if(shadow_rect != undefined)
	{
		shadow_rect.setShadow({color: 'black',blur: 10 });
		windows_layer.draw();
	}
}

function OnMouseOutShadow(tab_group)
{
	var shadow_rect = getShadowRectangle(tab_group)
	
	//Remove the shadow from shadow
	if(shadow_rect != undefined)
	{
		shadow_rect.setShadow({color: 'black',blur: 0 });
		windows_layer.draw();
	}
}

//This function is executed every time tab is added/removed from tab canvas
function adjustTabAnalysisSize()
{
	var max_width=0;
	var tab_analysis_div = document.getElementById('tab_div');
	var window_div = document.getElementById('kinect_container');
	var amount_of_tabs = tab_stage.get(".tab_rect").length;
	
	for(var i=0;i<tab_stage.get(".tab_rect").length;i++)
	{
		if ((tab_stage.get(".tab_rect")[i].attrs.x+tab_stage.get(".tab_rect")[i].getWidth()>max_width) && tab_stage.get(".tab_rect")[i].getStage().attrs.name=='tab_stage')
			max_width=tab_stage.get(".tab_rect")[i].attrs.x+tab_stage.get(".tab_rect")[i].getWidth();
	}
	
	if(max_width>MAIN_CANVAS_STANDARD_WIDTH && max_width>tab_stage.getWidth())
	{
		//If the tab_analysis still have the original width, the additional space should be added for scrolling
		if(tab_stage.getWidth()<=MAIN_CANVAS_STANDARD_WIDTH)
		{
			//Adjust the size of both canvases
			var new_height = window_div.offsetHeight - scrolling_height;
			window_div.style.height = new_height + 'px';
		
			new_height = tab_analysis_div.offsetHeight + scrolling_height;
			tab_analysis_div.style.height = new_height + 'px';
			
			tab_analysis_div.style.top = Number((Number(tab_analysis_div.style.top.substring(0,3)) - scrolling_height))+'px';;
		}
		tab_stage.setSize(max_width,tab_stage.getHeight());	
	}
	if(max_width<MAIN_CANVAS_STANDARD_WIDTH)
	{
		tab_stage.setSize(tab_analysis_div.offsetWidth,tab_analysis_div.offsetHeight);
		
	}
	
}

//This function is executed when user zoom-in/out
function moveFiguresToNewPositions()
{
	var tab_analysis_div = document.getElementById('tab_div');
	//Find the tab with biggest width
	var max_width=0;
	var max_width_element_index = 0;
	var array_of_tab_rect = tab_stage.get('.tab_rect');
	
	for (var i=0;i<array_of_tab_rect.length;i++)
	{
		if ((array_of_tab_rect[i].getParent().attrs.x+array_of_tab_rect[i].getWidth())>max_width)
			max_width=array_of_tab_rect[i].getParent().attrs.x+array_of_tab_rect[i].getWidth();
			max_width_element_index = i;
	}
	//Calculate the new width
	var max_tab_id = array_of_tab_rect[max_width_element_index].attrs.id;
	var window_id = max_tab_id.substr(0,max_tab_id.indexOf("_"));
	var tab_id = max_tab_id.substr(max_tab_id.indexOf("_")+1);
	
	var tab_node = getTabNodeByComplexTabId(max_tab_id);
	var tab_open_time = tab_node.getAttribute("open_time");
	var tab_close_time = tab_node.getAttribute("close_time");
	var new_lenth = Math.ceil(((tab_close_time-tab_open_time)/1000))*tab_analysis_pixels_per_second;
	var new_right_corner_x = tab_stage.get('#'+max_tab_id)[0].getParent().attrs.x+new_lenth;
	
	//0- Extend the tab_stage
	if(new_right_corner_x>MAIN_CANVAS_STANDARD_WIDTH && new_right_corner_x>tab_stage.getWidth())
	{
		tab_stage.setSize(new_right_corner_x,tab_stage.getHeight());
		
		var rails_array= tab_stage.get('.rail');
		
		for (var i=0;i<rails_array.length;i++)
		{
			rails_array[i].transitionTo({
				width: new_right_corner_x,
				duration: 0.5,
				});
		}
	}
	if(new_right_corner_x<tab_stage.getWidth())
	{
		if (new_right_corner_x<MAIN_CANVAS_STANDARD_WIDTH)
			new_right_corner_x = MAIN_CANVAS_STANDARD_WIDTH;
			
		tab_stage.setSize(tab_analysis_div.offsetWidth,tab_analysis_div.offsetHeight);
		
		var rails_array= tab_stage.get('.rail');
		for (var i=0;i<rails_array.length;i++)
		{
			rails_array[i].transitionTo({
				width: tab_analysis_div.offsetWidth,
				duration: 0.5,
				});
		}
	}
	//2- Move page group
	var page_group_array = tab_stage.get('.page_group');
	for (var i=0;i<page_group_array.length;i++)
	{
		var page_group_id = page_group_array[i].attrs.id;
		var page_id = page_group_id.substr(0,page_group_id.indexOf("page_group"));
		var page_node = getPageNodeByPageId(page_id);
		var tab_node = getTabNodeByPageId(page_id);
		var x_Start = Math.round(((page_node.getAttribute("coming_time")-tab_node.getAttribute("open_time"))/1000))*tab_analysis_pixels_per_second+1;
		
		page_group_array[i].transitionTo({
				x: x_Start,
				duration: 0.5,
				});
		
	}
	
	//3 - Extend/shrink rectangles
	var page_rect_array = tab_stage.get('.page_rect');
	for (var i=0;i<page_rect_array.length;i++)
	{
		var page_id = page_rect_array[i].attrs.id;
		var page_node = getPageNodeByPageId(page_id);
		var visit_time_length = Math.round(((page_node.getAttribute("leaving_time")-page_node.getAttribute("coming_time"))/1000))*tab_analysis_pixels_per_second;
		page_rect_array[i].transitionTo({
				width: visit_time_length,
				duration: 0.5,
				});
		
		if(tab_stage.get('#'+page_id+'_focus_rectangle')[0]!=null)
		{
			var focus_time_length = Math.round((( page_node.getAttribute("focus_time") )/1000))*tab_analysis_pixels_per_second;
			
			tab_stage.get('#'+page_id+'_focus_rectangle')[0].transitionTo({
				width: focus_time_length,
				duration: 0.5,
				});
		}
		if(tab_stage.get('#'+page_id+'_active_rectangle')[0]!=null)
		{
			var focus_time_length = Math.round((( page_node.getAttribute("active_time") )/1000))*tab_analysis_pixels_per_second;
			
			tab_stage.get('#'+page_id+'_active_rectangle')[0].transitionTo({
				width: focus_time_length,
				duration: 0.5,
				});
		}
	}
}