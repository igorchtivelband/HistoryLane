


function WindowRectangle()
{
this.x_Start = corner_x;
this.y_Start = corner_y;
this.length = 0;
this.height = 0;
this.window_id = 0;
this.right_buttom_corner_x=0;
this.right_buttom_corner_y=0;
this.tabs_array = new Array();
this.name = 'window';

this.initiate = function(report_start_time,input_window, open_time,close_time, input_max_simult_tabs)
{
	this.window_id = input_window;
	this.length = Math.ceil((((close_time-open_time)/1000))*sec_in_pixels);
	this.height = input_max_simult_tabs*tab_height;
	this.x_Start = Math.ceil((((open_time-canvas_start_time)/1000))*sec_in_pixels)+corner_x;
	this.right_buttom_corner_x = this.x_Start+this.length;
	for(var i=0;i<input_max_simult_tabs;i++)
	{
		this.tabs_array[i]= open_time;
	}
},

this.draw_window = function()
{
	var shape = stage.get('#'+this.window_id)[0];
	
	if(shape==undefined)
		{
			var rect = new Kinetic.Rect({
			  x: this.x_Start,
			  y: this.y_Start,
			  width: this.length,
			  height: this.height,
			  fill: "#F6FBFD",
			  stroke: "black",
			  strokeWidth: 1,
			  id:this.window_id
			});
		
			// add the shape to the layer
			windows_layer.add(rect);
			windows_layer.draw();
		}
	else
	{
		shape.transitionTo({
			x: this.x_Start,
			y: this.y_Start,
			width: this.length,
			height: this.height,
			duration: 1,
			 });
	}
}

}

function TabRectangle()
{
	this.x_Start = 0;
	this.y_Start = 0;
	this.length = 0;
	this.window_id = 0;
	//Vertical slot where this tab will be drawn
	this.tab_slot=0;
	this.tab_id=0;
	this.tab_group = new Kinetic.Group({
          draggable: false,
	  name:'tab_group',
	  listening:true
        });
	this.name = 'tab';
	
	this.initiate = function(input_window_rectangle,window_open_time,tab_node)
	{
		var tab_open_time = tab_node.getAttribute("open_time");
		var tab_close_time = tab_node.getAttribute("close_time");
		this.x_Start = Math.ceil((((tab_open_time-window_open_time)/1000))*sec_in_pixels)+input_window_rectangle.x_Start;
		this.tab_id = input_window_rectangle.window_id+'_'+ tab_node.getAttribute("tab_id");
		this.tab_group.attrs.id='tab_group'+this.tab_id;
		
		for(var i=0;i<input_window_rectangle.tabs_array.length;i++)
		{
			if(tab_open_time>=input_window_rectangle.tabs_array[i])
				{
					tab_slot=i;
					input_window_rectangle.tabs_array[i]=tab_node.getAttribute("close_time");
					break;
				}
		}
		this.y_Start=input_window_rectangle.y_Start+tab_slot*tab_height;
		
		this.tab_group.attrs.x = this.x_Start;
		this.tab_group.attrs.y = this.y_Start;
		
		this.length = Math.ceil((((tab_close_time-tab_open_time)/1000))*sec_in_pixels);
                
                //In case there was problem with orunding the numbers
                if (this.x_Start+this.length>input_window_rectangle.right_buttom_corner_x)
                {
                    this.length = input_window_rectangle.right_buttom_corner_x-this.x_Start;
                }
		
	},
	
	this.drawTab = function()
	{
		var shape = stage.get('#'+this.tab_id)[0];
		////To put code here
		var shadow = stage.get('#'+this.tab_id+'_shadow')[0];
		
		if(shadow!=undefined)
		{
				shadow.transitionTo({
				x: this.x_Start,
				y: this.y_Start,
				width: this.length,
				height: tab_height,
				duration: 1,
				 });
				return false;
		}
		else
		{
			//If the shape was never drawn 
			if(shape==undefined)
			{
				var rect = new Kinetic.Rect({
				x: 0,
				y: 0,
				width: this.length,
				height: tab_height,
				fill: "#DDE2E4",
				stroke: "black",
				strokeWidth: 1,
				id:this.tab_id,
				name:'tab_rect'
				});
				
				this.tab_group.add(rect);
				
				windows_layer.add(this.tab_group);
				
			}
			else
			{
				//Move the tab_group to correct position
				var tab_group = shape.getParent();
				
				tab_group.transitionTo({
				x: this.x_Start,
				duration: 1,
				 });
				//Extend the tab rectangel
				
				shape.transitionTo({
				x: 0,
				width: this.length,
				duration: 1,
				 });
			}
			windows_layer.draw();
			return true;
		}
	}
	
}

function PageRectangle()
{
	this.x_Start = 0;
	this.y_Start = 0;
	this.length = 0;
	this.id = "";
	this.favicon_path ="";
	//This group includes all the shapes relevant for the page:favicans,etc.
	this.page_group = new Kinetic.Group({
	  name:'page_group',	
          draggable: false,
	  x:0,
	  y:0
        });
	this.name = 'page';
	this.page_node = "";
	
	
	this.initiate = function(input_tab_rectangle,input_tab_open_time,page_node)
	{
		var page_open_time = page_node.getAttribute("coming_time");
		var page_close_time = page_node.getAttribute("leaving_time");
		
		this.x_Start = Math.round(((page_open_time-input_tab_open_time)/1000))*sec_in_pixels;
		this.y_Start = 0;
		this.length = Math.round(((page_close_time-page_open_time)/1000))*sec_in_pixels;
		this.id = page_node.getAttribute("page_id");
                this.favicon_path= page_node.getAttribute("favicon_path");
		this.page_node = page_node;
                
		if(this.x_Start+this.length>input_tab_rectangle.x_Start+input_tab_rectangle.length)
                {
                    this.length = (input_tab_rectangle.x_Start+input_tab_rectangle.length)-this.x_Start;
                }
	},
	
	this.drawPage = function()
	{
		var shape = stage.get('#'+this.id)[0];
		
		var colors = category_detector.getCategoryColors(this.page_node.getAttribute("url"));
		
		if(shape==undefined)
		{
			var rect = new Kinetic.Rect({
			x: this.x_Start,
			y: this.y_Start,
			width: this.length,
			height: tab_height,
			fill:colors.default_color,
			stroke: "#F59611",
			strokeWidth: 1,
			id: this.id,
			name:'page_rect'
			});
			
			rect.on("mouseover", function(e) {
							onMouseOverPageRect(this,e);
							
							});
			rect.on("mouseout", function() {
							onMouseOutPageRect(this);
							});
			
			rect.on("dblclick dbltap", function() {
				onPageDoubleClickMoveTab(this);
				});
			
			this.page_group.add(rect);
			
			this.createFavicon();
			//if(favicon_image)
			//this.page_group.add(favicon_image);
			
			var title_text = generateTitleForPageRectangle(this.length-16,this.id,this.x_Start+17,(tab_height-CONST_TITLE_LETTER_HEIGHT)/2);
			
			if(title_text)
				this.page_group.add(title_text);	
			
			var parent_tab_id=getTabIdByPageID(this.id);
			var parent_window_id = getWindowIdByPageID(this.id);
			var tab_group = windows_layer.get("#"+"tab_group"+parent_window_id+"_"+parent_tab_id)[0];
			tab_group.add(this.page_group);
			
		}
		else
		{
			shape.transitionTo({
			x: this.x_Start,
			width: this.length,
			height: tab_height,
			duration: 1,
			 });
			
			var favShape = stage.get('#'+this.id+"fav")[0];
			//If favicon was already drawn
			if(favShape!=undefined)
			{
				if(this.length>16)
				favShape.transitionTo({
				x: this.x_Start,
				duration: 1,
				});
				else
					favShape.getParent().remove(favShape);	
			}
			else
			{
				this.createFavicon();
			}
			
			var title_text = shape.getParent().get("."+"title")[0];
			if(title_text!=undefined)
			{
				var page_group= title_text.getParent();
				title_text.getParent().remove(title_text);
				
				title_text = generateTitleForPageRectangle(this.length-16,this.id,this.x_Start+17,(tab_height-CONST_TITLE_LETTER_HEIGHT)/2);
			
				if(title_text)
					page_group.add(title_text);
				
			}
		}
	},
	
	this.createFavicon = function()
	{
		if(this.length>16 && tab_height>16 && this.favicon_path!= 'undefined')
			{

				 var imageObj = new Image();
				
				 imageObj.onload = function() {
					
				  windows_layer.draw();
				 }

				  var image = new Kinetic.Image({
				    x: this.x_Start,
				    y: this.y_Start,
				    image: imageObj,
				    width: 16,
				    height: 16,
				    id: this.id+"fav"
				  });
				  
				this.page_group.add(image);
				imageObj.src = this.favicon_path;
			}
	}
	
}


//This function receives the page_id and returns the text of title which is suitable to be embedded into rectangle
function generateTitleForPageRectangle(available_width,page_id,x_coord,y_coord)
{
	var page_node = getPageNodeByPageId(page_id);
	
	var title = page_node.getAttribute("title");
	
	if (title.length*CONST_TITLE_LETTER_WIDTH>available_width)
	{
		var num_letters = (available_width-5)/CONST_TITLE_LETTER_WIDTH;
		
		if(num_letters<1)
			return null;
		
		title = title.substr(0,num_letters)+"...";
	}
	
	var textImage = new Kinetic.Text({
			x: x_coord,
			y: y_coord,
			text: title,
			fontSize: 8,
			fontFamily: "Calibri",
			textFill: "black",
			name:"title"
		      });
	
	return textImage;
}


