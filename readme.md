Srt-merge is a tiny node.js project.  
It can merge two srt files into one with a few options.
##Usage
There is a usage example in example.js. Run it for a clear understanding.  
It provides just one function.  
###merge(srtPrimary, srtSecondary[, attr, noString])
__srtPrimary__ and __srtSecondary__ accept srt-string, or srt-object with the format of [npm-module subtitle](https://www.npmjs.com/package/subtitle).  And they will not be changed in this function.  
__attr__ accepts one of the following values:

* __'' or 'simple' or undefined__  
Simply merge two files.
* __'top-bottom'__  
srtPrimary at bottom, srtSecondary at top.  
Using ass tag __{\an8}__ which is supported by many players.
* __'nearest-cue-*\<threshold\>*'__  
srtSecondary will be merged into srtPrimary with a time threshold. If there are multiple cues, it chooses the earliest.
* __'move-merge-*\<time shifted\>*'__
srtSecondary will be shifted (can be forward or backward) and merged into srtPrimary.  

__noString__ takes true or false, if it's true, output the srt-object, otherwise output srt text.


 





    
