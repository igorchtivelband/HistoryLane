
//////////////////////Here is a short instruction about HistoryLane code/////////////////

For installing the HistoryLane extension simply open one of .xpi files located in this folder
-----------------------------------------------------------------------------------------
                                Compiling the code
For compiling the code to new xpi, take following steps:
    1) Go to 'code' subfolder
    2) Compress the content of code subfolder into zip file
    3) Rename zip file into xpi
  
-----------------------------------------------------------------------------------------
                                Code structure
Our code can be devided into 2 parts, one is responsible for collecting the data about browser events and runs in the level of browser chrome.
These scripts can be found in 'chrome_scripts' folder.
The other part is responsible for managing visual diagram that is loaded as regular HTML page, so these scripts are usual client-side javascripts.
These scripts can be found in 'content_scripts' folder.
-----------------------------------------------------------------------------------------
                                Questions
In case you have any question, please contact me, Igor using email igor.chtivelband@gmail.com