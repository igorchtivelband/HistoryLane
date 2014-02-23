
function TabAnalysisTabEntity()
{
	this.x_Start = 0;
	this.y_Start = 0;
	this.length = 0;

	this.tab_slot=0;
	
        this.TabAnalysisTabEntity_id=0;
        
        this.tab_id= 0;
	
	this.name = 'tab';
        
        this.tab_node="";
	
	this.initiate = function(tab_node)
	{
                this.tab_id = tab_node.getAttribute("tab_id");
		var tab_open_time = tab_node.getAttribute("open_time");
		var tab_close_time = tab_node.getAttribute("close_time");
		this.TabAnalysisTabEntity_id = getWindowIdByTabId(this.tab_id,tab_open_time)+'_'+ tab_node.getAttribute("tab_id");
		this.length = Math.ceil((((tab_close_time-tab_open_time)/1000))*tab_analysis_pixels_per_second);
                this.tab_node = tab_node;
	},
	
	this.generateTabForAnalysisCanvas = function(rail_number)
	{
                this.y_Start = rail_number*RAIL_HEIGHT+1;
		var tab_group = new Kinetic.Group({
				draggable: false,
				name:'analysis_tab_group',
				id:'analysis_tab_group'+this.TabAnalysisTabEntity_id,
                                x:1,
                                y:this.y_Start
			});
                
                tab_group.on("mouseover", function() {
								document.body.style.cursor = "pointer";
                                                                OnMouseOverToShadow(tab_group);
								});
		tab_group.on("mouseout", function() {
								document.body.style.cursor = "default";
                                                                OnMouseOutShadow(tab_group);
								});
		//1 - generate tab_rectangle
		var rect = new Kinetic.Rect({
				x: 0,
				y: 0,
				width: this.length,
				height: tab_analysis_tab_height,
				fill: "#DDE2E4",
				stroke: "black",
				strokeWidth: 1,
				id:this.TabAnalysisTabEntity_id,
				name:'tab_rect'
				});
                
                rect.on("dblclick dbltap", function() {
				onTabDoubleClick(this);
				});
		
		//2 - add tab_rectangle
                tab_group.add(rect);
		
                var list_of_page_nodes = this.tab_node.selectNodes(".//page");
                for(var i=0;i<list_of_page_nodes.length;i++)
                {
                    var page_entity = new TabAnalysisPageEntity();
                    page_entity.initiate(list_of_page_nodes[i],this);
                    var page_group = page_entity.draw_entity();
                    tab_group.add(page_group);
                }
		//4 - return tab_group
                return tab_group;
	}
}


function TabAnalysisPageEntity()
{
        this.x_Start = 0;
	this.y_Start = 0;
	this.length = 0;
        this.height;
        this.page_id;
        this.page_group = "";
        this.favicon_path ="";
        
        this.initiate = function(page_node,tab_entity)
        {
            var page_open_time = page_node.getAttribute("coming_time");
	    var page_close_time = page_node.getAttribute("leaving_time");
            this.page_id = page_node.getAttribute("page_id");
            
            var tab_node = getTabNodeByPageId(this.page_id);
            
            this.x_Start = Math.round(((page_open_time-tab_node.getAttribute("open_time"))/1000))*tab_analysis_pixels_per_second+tab_entity.x_Start;
	    this.y_Start = 0;
            this.length = Math.round(((page_close_time-page_open_time)/1000))*tab_analysis_pixels_per_second;
            this.favicon_path= page_node.getAttribute("favicon_path");
            this.comment = page_node.getAttribute("comment");
            
            this.page_group = new Kinetic.Group({
                name:'page_group',	
                draggable: false,
                x:this.x_Start,
                y: this.y_Start,
                id:this.page_id+'page_group'
              });
            
            this.page_group.on("click", function(e) {
                       
                        if(e.button==0)
                        {
                            var page_rect = this.get('.page_rect')[0];
                            onPageDoubleClickMoveTab(page_rect);
                        }
                        
                        if(e.button==2)
                            onPageClick(this);  
			});

        },
        
        this.draw_entity = function()
        {
            var colors = category_detector.getCategoryColors(getPageNodeByPageId(this.page_id).getAttribute("url"));
            //Add page rectangle
            var rect = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: this.length,
			height: tab_analysis_tab_height,
			fill: colors.default_color,
			stroke: "#F59611",
			strokeWidth: 1,
			id: this.page_id,
			name:'page_rect'
			});
                
            this.page_group.add(rect);
            
            this.page_group.on("mouseover", function() {
                                                        OnMouseOverToShadow(this.getParent());
                                                        
							});
	    
            this.page_group.on("mouseout", function() {
                                                        OnMouseOutShadow(this.getParent());
							});
            
             var focus_rect = RectangleDrawer.drawFocusRectangle(this.page_id);
            if (focus_rect)
                this.page_group.add(focus_rect);
                
            var active_rect = RectangleDrawer.drawActiveRectangle(this.page_id)
            if (active_rect)
                this.page_group.add(active_rect);
            //RectangleDrawer.drawFocusRectangle(this.page_id);
            
            //Add favicon
            if(this.length>16 && tab_analysis_tab_height>16 && this.favicon_path!= 'undefined')
			{

				 var imageObj = new Image();
				
				  var image = new Kinetic.Image({
				    x: 0,
				    y: 0,
				    image: imageObj,
				    width: 16,
				    height: 16,
				    id: this.page_id+"fav"
				  });
                                imageObj.src = this.favicon_path;
				this.page_group.add(image);
			}
            if (this.comment && this.comment!=undefined && this.comment.length>0)
            {
                var image = RectangleDrawer.create_exclamation_sign_image(this.page_id);
                this.page_group.add(image);
            }
            return this.page_group;
        }
        
}



function onPageClick(page_group)
{
        var page_rect = page_group.get('.page_rect')[0];
        
        $("#page_id_buffer").text(page_rect.attrs.id);
        
        var page_node= getPageNodeByPageId(page_rect.attrs.id);
	var previous_comment = page_node.getAttribute("comment");
        
        if(previous_comment!=undefined && previous_comment.length>0)
            $('#comment').val(previous_comment);
        
        PageParametersController.showDialogWindow();
}


var RectangleDrawer = {
    
    'drawActiveRectangle':function(page_id)
    {
        //var shape = tab_stage.get('#'+page_id+'_active_rectangle')[0];
        var page_node = getPageNodeByPageId(page_id);
        var active_rect_length = (page_node.getAttribute("active_time")/1000)*tab_analysis_pixels_per_second;
        
        var rect = null;
        if(active_rect_length>0)
        {
            //var rectangle_page_group = tab_stage.get('#'+page_id)[0].getParent();
            var colors = category_detector.getCategoryColors(page_node.getAttribute("url"));
            
            rect = new Kinetic.Rect({
				x: 0,
				y: 0,
				width: active_rect_length,
				height: tab_analysis_tab_height,
				fill: colors.active_color,
				stroke: "black",
				strokeWidth: 1,
				id: page_id+'_active_rectangle',
				name:'active_rectangle'
				});
        }
        return rect; 
    },
    
    'drawFocusRectangle':function(page_id)
    {
        var page_node = getPageNodeByPageId(page_id);
        var focus_rect_length = Math.round((( page_node.getAttribute("focus_time") )/1000))*tab_analysis_pixels_per_second;
    
        var focus_rect = null;
        if(focus_rect_length>0)
        {
            var colors = category_detector.getCategoryColors(page_node.getAttribute("url"));
            
            focus_rect = new Kinetic.Rect({
				x: 0,
				y: 0,
				width: focus_rect_length,
				height: tab_analysis_tab_height,
				fill: colors.focus_color,
				stroke: "black",
				strokeWidth: 1,
				id: page_id+'_focus_rectangle',
				name:'focus_rectangle'
				});
        }
        return focus_rect;
    },
    
    'create_exclamation_sign_image' : function(page_id)
    {
        var imageObj = new Image();
                   
                     var image = new Kinetic.Image({
                       x: 17,
                       y: 0,
                       image: imageObj,
                       width: 16,
                       height: 16,
                       id: page_id+"_exclamation_sign"
                     });
                   
                   imageObj.src = "./images/exclamation_mark.png";
       
       return image;
            
    },
    
    'add_new_exclamation_sign' : function(page_id)
    {
        var image = tab_stage.get("#"+page_id+"_exclamation_sign")[0];
        
        if(image== undefined)
        {
            var page_group= tab_stage.get("#"+page_id+"page_group")[0];
            
            var image= RectangleDrawer.create_exclamation_sign_image(page_id);
            
            page_group.add(image);
        }
        else
        image.moveToTop();
    },
    
    'remove_exclamation_sign': function(page_id)
    {
        var image = tab_stage.get("#"+page_id+"_exclamation_sign")[0];
        
        if(image != undefined)
        {
            image.getParent().remove(image);
            
        }
    },
    
    'organize_z_index':function(page_id)
    {
         var fav = tab_stage.get('#'+page_id+'fav')[0];
            if(fav!=undefined)
            fav.moveToTop();
        
        var sign = tab_stage.get("#"+page_id+"_exclamation_sign")[0];
            if(sign!=undefined)
            sign.moveToTop();
        
        tabs_layer.draw();
    },
    
    'putTimeText':function(page_id,time_type_string)
    {
        var page_node= getPageNodeByPageId(page_id);
        var active_time =  Math.ceil(((page_node.getAttribute(time_type_string+'_time'))/1000));
        var active_time_text = time_type_string+'_time='+ active_time;
        var page_group = tab_stage.get('#'+page_id+'page_group')[0];
        
        var x_coordinate = 2;     
        var y_coordinate = 17 ;
        
        if(time_type_string=='focus')
           y_coordinate = 27;
        
        if(time_type_string=='visit')
           y_coordinate = 37;
        
        var textObject = new Kinetic.Text({
			x: x_coordinate,
			y: y_coordinate,
			text: active_time_text,
			fontSize: 8,
			fontFamily: "Calibri",
			textFill: "black",
			name:"time_text"+page_id,
                        id:time_type_string+"_time_text"+page_id
		      });
        
        page_group.add(textObject);
        tabs_layer.draw();
    }
};