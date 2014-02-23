
var list_of_found_nodes=[];

function searchEventListener(event)
{
    // Normilize the elements, that were found in previous search
    for( var i=0;i<list_of_found_nodes.length;i++)
        normilizeTheChosenPage(list_of_found_nodes[i]);
    //Load the xml_string with data into XML file
    var parser=new DOMParser();
    var xmlDoc=parser.parseFromString(xmlDataString,'text/xml');
    
    var searchQuery = document.body.getAttribute('searchQuery');
    //Check, that data about visits exist 
    if(xmlDoc.selectNodes('.//page').length<1)
    {
        alert('No data was found');
        return;
    }

    var xPathCondition = parseSearchCondition(searchQuery);
    list_of_found_nodes = xmlDoc.selectNodes(".//page"+xPathCondition);
    
    if(list_of_found_nodes.length==0)
        alert('No page fits the provided criteria');
   
    for( var i=0;i<list_of_found_nodes.length;i++)
        highLightTheChosenPage(list_of_found_nodes[i]);
}

function highLightTheChosenPage(inputXmlNode)
{
    var page_id= inputXmlNode.getAttribute('page_id');
    
     var shape = stage.get('#'+page_id)[0];
	  
    if (shape!=undefined)
    {
		shape.setShadow({color: 'blue',blur: 7 });
		windows_layer.draw();
    }
    
    var cell = document.getElementById(page_id);
    cell.style.color="#3399FF";
}

function normilizeTheChosenPage(inputXmlNode)
{
    var page_id= inputXmlNode.getAttribute('page_id');
    
     var shape = stage.get('#'+page_id)[0];
	  
    if (shape!=undefined)
    {
		shape.setShadow({color: 'black',blur: 0 });
		windows_layer.draw();
    }
    
    var cell = document.getElementById(page_id);
    cell.style.color="#000000";
}

//This function parses the input search condition and returns the result which may be embedded into XPath
function parseSearchCondition(conditionString)
{
    var return_expression="[";
    
    while(conditionString.length>3)
    {
        var first_operand = getNextWord(conditionString);
        conditionString=conditionString.substring(conditionString.indexOf(first_operand)+first_operand.length);
        var operator = getNextWord(conditionString);
        conditionString=conditionString.substring(conditionString.indexOf(operator)+operator.length);
        var second_operand = getNextWord(conditionString);
        conditionString=conditionString.substring(conditionString.indexOf(second_operand)+second_operand.length);
        
        if (operator!="contains" && operator!=">" && operator!="<")
        {
            return null;
        }
        
        if(return_expression.length>1)
                return_expression+=' and ';
                
        if(operator=="contains")
        {
           return_expression+="contains(@"+first_operand+","+second_operand+") ";
           continue;
        }
        
        if(operator==">" || operator=="<")
        return_expression+="@"+first_operand+operator+second_operand*1000+" ";

    }
    return_expression+="]";
    return return_expression;
}

//This function receives the strings and returns the next word, which may be lead by number of spaces
function getNextWord(input_string)
{
    while(input_string.substring(0,1)==" ")
    {
        input_string= input_string.substring(1);
    }
    
    var word_end_position = input_string.indexOf(" ");
    if(word_end_position>-1)
        {
            var word= input_string.substring(0,word_end_position);
            input_string= input_string.substring(word_end_position);
            return word;
        }
    else
        return input_string;
}