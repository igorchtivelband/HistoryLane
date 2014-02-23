
function myeventListener(event)
{
    initiateContent();
    
    var elm = event.target;
    
    xmlDataString = elm.getAttribute('windowsXmlString');
    
    var parser=new DOMParser();
    xmlDataDoc="";
    xmlDataDoc=parser.parseFromString(xmlDataString,'text/xml');
    
    if(xmlDataDoc.selectNodes(".//page").length>0)
    {
	
	canvas_start_time = getCanvasStartTime();
	var last_close_time = getCanvasEndTime();
	var time_length = (last_close_time-canvas_start_time)/1000;
	
	if ((MAIN_CANVAS_STANDARD_WIDTH/time_length)<sec_in_pixels_min)
		sec_in_pixels = sec_in_pixels_min;
	else
		sec_in_pixels = MAIN_CANVAS_STANDARD_WIDTH/time_length;
	
	drawWindowsInCanvas();
	fillTheTable();
    }
    else
	alert('No web sites were visited during selected time period');
    
}

function onTimeButtonClick(time_interval)
{
		var element = document.createElement('GetHistoryDataEventElement');  
		element.setAttribute('time_interval', time_interval);  
		document.documentElement.appendChild(element);  
  
                //Set the parameters for correct width resolution
                if(time_interval=='Day')
                {
                    sec_in_pixels = 0.25;
                    sec_in_pixels_min = 0.1;
                    sec_in_pixels_max = 2;
                    TIME_LINE_UNIT = 1800;
                }
                
		var evt = document.createEvent('Events');  
		evt.initEvent('GetHistoryDataEvent', true, false);  
		element.dispatchEvent(evt);	
}


function onTestButtonClick()
{
	xhttp=new XMLHttpRequest();
	xhttp.open("GET","./testfiles/test.xml",false);
	xhttp.send();
	xmlDataDoc=xhttp.responseXML;
	canvas_start_time = getCanvasStartTime();
	xmlDataString = (new XMLSerializer()).serializeToString(xmlDataDoc);
	
	var elm = document.getElementById("container");
	elm.setAttribute("windowsXmlString", xmlDataString);
	var evt = document.createEvent("Events");
	evt.initEvent("myevent", true, false);
	elm.dispatchEvent(evt);
}


function onMouseOverCell(page_id)
{
	
	 var shape = stage.get('#'+page_id)[0];
	  
	if (shape!=undefined)
	{
		shape.setShadow({color: 'black',blur: 10 });
		windows_layer.draw();
	}
}

function onMouseOutCell(page_id)
{
	
	 var shape = stage.get('#'+page_id)[0];
	  
	if (shape!=undefined)
	{
		shape.setShadow({color: 'black',blur: 0 });
		windows_layer.draw();
	}
}


function onPlusClick(event_y_coordinate)
{
        if(event_y_coordinate < document.getElementById('tab_div').offsetTop)
        {
            
	if(sec_in_pixels*1.5<sec_in_pixels_max)
		{
			sec_in_pixels=sec_in_pixels*1.2;
			drawWindowsInCanvas();
		}
        }
        
        else{
            if(tab_analysis_pixels_per_second*1.2 < tab_analysis_pixels_per_second_max)
            {
                tab_analysis_pixels_per_second=tab_analysis_pixels_per_second*1.2;
                moveFiguresToNewPositions();
            }
        }
	
}

function onMinusClick(event_y_coordinate)
{
        if(event_y_coordinate < document.getElementById('tab_div').offsetTop)
        {
            if(sec_in_pixels/1.2>sec_in_pixels_min)
            {
                    sec_in_pixels= sec_in_pixels/1.2;
            
                    drawWindowsInCanvas();
            }
        }
        else{
            if(tab_analysis_pixels_per_second/1.2 > tab_analysis_pixels_per_second_min)
            {
                tab_analysis_pixels_per_second=tab_analysis_pixels_per_second/1.2;
                moveFiguresToNewPositions();
            }
        }
}


function onWheelEvent(event)
{
	//if the data was already initiated
	if(xmlDataString.length>0)
	{
		var delta = -event.detail;
		if(delta)
		{
			if(delta>0)
			onPlusClick(event.pageY);
			else
			onMinusClick(event.pageY);
		}
                
		if (event.preventDefault)
                event.preventDefault();
		event.returnValue = false;
	}
}


function onMouseOverPageRect(rect,event)
{
	var id = rect.attrs.id;
	
        $('#'+id).attr("class",'selected_cell' );
	//Showing the image
	var image_x = event.pageX;
	var image_y = event.pageY;
	
	if (image_x>screen.width/2)
		image_x=image_x-THUMBNAIL_WIDTH ;
	if (image_y>screen.height/2)
		image_y=image_y-THUMBNAIL_HEIGHT;
		
	var image_name = getPageNodeByPageId(id).getAttribute("title");
	image_name=image_name.replace(":","");
	if (image_name.indexOf(" ")>-1)
		image_name=image_name.substr(0,image_name.indexOf(" "));
	
	$('#thumbnail_image').attr('src','thumbnails/'+image_name+'.png');
	$("#thumbnail_image").css({"top": image_y+"px", "left": image_x+"px"});
	$("#thumbnail_image").show();
}

function onMouseOutPageRect(rect)
{
	var id = rect.attrs.id;
        $('#'+id).attr("class",'unselected_cell' );
	$("#thumbnail_image").hide();
}

//Event for moving to and from tab_analysis area
function onPageDoubleClickMoveTab(page_rect)
{
    var stage_name = page_rect.getStage().attrs.name;
    
    
    if (stage_name=='main_stage')
    {
        var window_id = getWindowIdByPageID(page_rect.attrs.id);
        var tab_id = getTabIdByPageID(page_rect.attrs.id);
	var tab_rect = stage.get('#'+window_id+'_'+tab_id)[0];
        var tab_group = tab_rect.getParent();
	AdjustNumberOfRailsOnAdding();
	var shadow_rect = putTheShadow(tab_group);
	for(var i=0;i<rails_array.length;i++)
	{
	    if(rails_array[i].flag==0)
	    {
		setTabDiagramIntoTabCanvas(tab_rect,i);
		rails_array[i].flag=1;
		break;
	    }   
	}
	windows_layer.remove(tab_group);
	windows_layer.add(shadow_rect);
    }
    else
    {
        var tab_group= page_rect.getParent().getParent();
	setTabGroupPositionInMainCanvas(tab_group);
    }
    adjustTabAnalysisSize();
    tabs_layer.draw();
    windows_layer.draw();
}