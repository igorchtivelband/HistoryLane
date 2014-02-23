
//This is the array of objects, that represent graphical windows
var windows_array = [];

var stage;
var windows_layer;

//This array contains all objects:pages,tabs and windows
var visual_objects_array=[];

var xmlDataString="";

var parser=new DOMParser();

var xmlDataDoc=parser.parseFromString("",'text/xml');;

var drawActiveTimeFlag = false;

//This function reads the data about visited windows and draws the rectanges
function drawWindowsInCanvas()
{
	try
	{
	
	canvas_start_time = xmlDataDoc.selectSingleNode(".//window[last()]").getAttribute('open_time');
	//Create list of objects, that represent windows
	drawWindowObjectsFromXml(xmlDataDoc);
	}
	catch(err)
	{
		alert(err.message);
	}
}

//This function receives the xml_doc with data about windows and generates array where for each window is x_start, length and heights
function drawWindowObjectsFromXml(inputXmlDoc)
{
	windows_array = [];
	visual_objects_array=[];
	try{
		var list_of_window_nodes = inputXmlDoc.selectNodes(".//window");
		
		for (var i=0;i<list_of_window_nodes.length;i++)
		{
			var myWinRect = new WindowRectangle();
			myWinRect.initiate(canvas_start_time,list_of_window_nodes[i].getAttribute("window_id"), list_of_window_nodes[i].getAttribute("open_time"),list_of_window_nodes[i].getAttribute("close_time"), list_of_window_nodes[i].getAttribute("max_simult_tabs"));
				//Calculate y_Start for each window
				for(var j=0;j<i;j++)
				{ 
					if(myWinRect.right_buttom_corner_x>windows_array[j].x_Start)
						{
							myWinRect.y_Start = windows_array[j].right_buttom_corner_y+5;
						}
				}
				
			myWinRect.right_buttom_corner_y = myWinRect.y_Start+myWinRect.height;
	
			windows_array.push(myWinRect);
			myWinRect.draw_window();
			visual_objects_array.push(myWinRect);
			for(var j=0;j<list_of_window_nodes[i].selectNodes(".//tab").length;j++)
			{
				var current_tab_node = list_of_window_nodes[i].selectNodes(".//tab")[j];
				var tabRect = new TabRectangle();
				tabRect.initiate(myWinRect,list_of_window_nodes[i].getAttribute("open_time"),current_tab_node);
				
				if(tabRect.drawTab())
				{
					visual_objects_array.push(tabRect);
					
					for(var k=0;k<current_tab_node.selectNodes(".//page").length;k++)
					{
						var pageRect = new PageRectangle();
						pageRect.initiate(tabRect,current_tab_node.getAttribute("open_time"),current_tab_node.selectNodes(".//page")[k]);
						pageRect.drawPage();
						visual_objects_array.push(pageRect); 
					}
				}
			}
		}
		windows_layer.draw();
		adjustCanvasSize(windows_array);
		timeLine.drawTimeLine();
	}
	catch(err)
	{
		alert(err.message);
	}
}