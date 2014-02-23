
function onSearchButtonClick()
{
    try
    {
        //Get the search text
        var searchTxt = document.getElementById('SearchTextBox').value;
        window.content.document.body.setAttribute("searchQuery",searchTxt);
        
        //Create the DOM event
        var evt = window.content.document.createEvent("Events");
        evt.initEvent("searchEvent", true, false);
        window.content.document.dispatchEvent(evt);
    }
    catch(err)
    {
	catchException(err,'getFaviconPath');
    }
}