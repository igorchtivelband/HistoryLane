
var initial_load_flag = 1;

function fillTheTable()
{
	try{
		var list=xmlDataDoc.selectNodes('.//history/page');
		
		var table = document.getElementById('history_table');
		
		//Reset the list of visited web sites
		table.innerHTML='';
		for (var i = 0; i < list.length; i++)
		{
			list[i].getAttribute('title');
			var rowCount = table.rows.length;
			var row = table.insertRow(rowCount);
			var cell = row.insertCell(0);
			cell.innerHTML = list[i].getAttribute('title');
			cell.id = list[i].getAttribute('page_id');
			cell.onmouseover = function() {onMouseOverCell(this.id);};
			cell.onmouseout=function() {onMouseOutCell(this.id);};
			cell.setAttribute("class", "history_entry");
		}
		
	}
	catch(err)
	{
		alert(err.message);
	}	
}

//This function checks if history canvas requres the extension and extends it
function adjustCanvasSize(windows_array)
{
	try
	{
		var containerDiv = document.getElementById("kinect_container");
		
		var max_height=containerDiv.offsetHeight;
		var max_witdth=containerDiv.offsetWidth;
		var new_max_height= max_height;
		var new_max_width = max_witdth;
		
		for(var i=0;i<windows_array.length;i++)
		{
			if(windows_array[i].right_buttom_corner_x>new_max_width)
				new_max_width=windows_array[i].right_buttom_corner_x;
			if(windows_array[i].right_buttom_corner_y>new_max_height*(1-CONST_TAB_ANALYSIS_HEIGHT_PROPORTION))
				new_max_height=Math.round(windows_array[i].right_buttom_corner_y/(1-CONST_TAB_ANALYSIS_HEIGHT_PROPORTION));
		}
		
		if(new_max_height> max_height || new_max_width>max_witdth)
		{
			stage.setSize(new_max_width,new_max_height);
		}
	
		if(new_max_height<=MAIN_CANVAS_STANDARD_HEIGHT)
		{
			stage.setSize(stage.getWidth(),MAIN_CANVAS_STANDARD_HEIGHT);
		}
		
		if(new_max_width<=MAIN_CANVAS_STANDARD_WIDTH)
		{
			stage.setSize(MAIN_CANVAS_STANDARD_WIDTH,stage.getHeight());
		}

	}
	catch(err)
	{
		alert(err.message);
	}
	
}

function initiateContent()
{
	try
	{
	//Reset the container
	var containerDiv = document.getElementById("kinect_container");
	
	if (stage == null)
	stage = new Kinetic.Stage({
          container: "kinect_container",
          width: containerDiv.offsetWidth-5,
          height: containerDiv.offsetHeight-5,
	  name: 'main_stage'
	  
        });
	
	stage.removeChildren();
	if (windows_layer==null)
		windows_layer = new Kinetic.Layer();
	
	windows_layer.removeChildren();
	
	stage.add(windows_layer);
	windows_layer.draw();
	
	tab_analysis.initiate();
	category_detector.initiate();
	
	//Now, when everything is loaded, simulate 'Hour' click
	if(initial_load_flag)
	{
		initial_load_flag=0;
		onTimeButtonClick('Hour');
	}
	}
	catch(err)
	{
		alert(err.message);
	}
	
}

var timeLine = {
	
	'time_line_width':'',
	'x_start':corner_x,
	'y_start':5,
	'time_line_height':6,
	
	
	'drawTimeLine':function()
	{
		//Remove existing lines
		var lines_array = windows_layer.get('.time_line');
		
		for (var i=0;i<lines_array.length;i++)
		{
			windows_layer.remove(lines_array[i]);
		}
		
		var time_marks_array= windows_layer.get('.time_mark');
		
		for (var i=0;i<time_marks_array.length;i++)
		{
			windows_layer.remove(time_marks_array[i]);
		}
		
		windows_layer.draw();
		
		timeLine.time_line_width=stage.getWidth()-corner_x;
		
		var i=timeLine.x_start;
		while (i<timeLine.time_line_width)
		{
			var line_height= Math.round(stage.getHeight()-5);
			
			var redLine = new Kinetic.Line({
			points: [i, timeLine.y_start, i, line_height],
			stroke: "#F6F6FF",
			strokeWidth: 1,
			lineCap: "round",
			lineJoin: "round",
			name: 'time_line'
			});
			windows_layer.add(redLine);
			
			timeLine.drawTimeMark(i,0,(i-timeLine.x_start)/sec_in_pixels);
			
			i=i+sec_in_pixels*TIME_LINE_UNIT;
		}
		windows_layer.draw();	
	},
	
	'drawTimeMark':function(x_coordinate,y_coordinate,timeInSeconds)
	{
		var hours=	Math.floor(timeInSeconds/3600);
		var minutes = 	Math.floor((timeInSeconds-hours*3600)/60);
		var seconds = 	Math.floor(timeInSeconds%60);
		if (hours.toString().length<2)
			hours="0"+hours.toString();
		if ( minutes.toString().length<2)
			 minutes="0"+ minutes.toString();
		if ( seconds.toString().length<2)
			 seconds="0"+ seconds.toString();
		
		var simpleText = new Kinetic.Text({
			x: x_coordinate-10,
			y: y_coordinate,
			text: hours+":"+minutes+":"+seconds,
			fontSize: 7,
			fontFamily: "Calibri",
			textFill: "black",
			name:"time_mark"
		      });
		windows_layer.add(simpleText);
	}	
};

var PageParametersController = {
	'showDialogWindow':function()
	{
		$("#divDialog").show();
	},
	
	'hideDialogWindow':function()
	{
		$("#divDialog").hide();
		
		var page_id = $("#page_id_buffer").text();
		
		PageParametersController.updateTheComment(page_id);
		
		var old_time_texts = tab_stage.get(".time_text"+page_id);
		for(var i=0;i<old_time_texts.length;i++)
		{
			old_time_texts[i].getParent().remove(old_time_texts[i]);
		}
		
		tabs_layer.draw();
		
		if($('#active_checkbox').is(':checked'))
			RectangleDrawer.putTimeText(page_id,'active');
		if($('#focus_checkbox').is(':checked'))
			RectangleDrawer.putTimeText(page_id,'focus');
		if($('#visit_checkbox').is(':checked'))
			RectangleDrawer.putTimeText(page_id,'visit');
		
		RectangleDrawer.organize_z_index(page_id);
		
	},
	
	'updateTheComment':function(page_id)
	{
		var page_node= getPageNodeByPageId(page_id);
		var previous_comment = page_node.getAttribute("comment");
		var current_comment = $('#comment').val();
		
		if(previous_comment!=current_comment)
		{
			setCommentAttributeValue(page_id,current_comment);
			
			var evt = document.createEvent('Events');  
			evt.initEvent('updatePageCommentEvent', true, false);  
			document.dispatchEvent(evt);
			
			if (current_comment.length>0)
			{
				RectangleDrawer.add_new_exclamation_sign(page_id);
			}
			else
				RectangleDrawer.remove_exclamation_sign(page_id);
			
			tabs_layer.draw();
		}
	}	
};
