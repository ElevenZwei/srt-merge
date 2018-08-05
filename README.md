Srt-merge is a tiny node.js project, with just a hundred lines of code.  
It can merge two srt files into one with a few options.
##Usage
There is a usage example in example.js. Run it for a clear understanding.  
It provides just one function.  
###merge(srtPrimary, srtSecondary\[, attr, noString])
__srtPrimary__ and __srtSecondary__ accept srt-string, or srt-object with the format of [npm-module subtitle](https://www.npmjs.com/package/subtitle).  And they will not be changed in this function.  
__attr__ accepts one of the following values, __or an array of them__, but the order will always be top-bottom, move, then nearest-cue:

* __\<empty string\>, \<undefined\>, simple__  
Simply merge two files.
* __top-bottom__  
srtPrimary at bottom, srtSecondary at top.  
Using ass tag __{\an8}__ which is supported by many players.
* __nearest-cue-*\<threshold\>*\[-no-append]__  
srtSecondary will be appended to srtPrimary with a start time threshold. If there are multiple cues, it chooses the earliest.  
__no-append__ means srtSecondary will only be aligned with srtPrimary with a start time threshold. These two, which start time are aligned, their end time will also be aligned if they are within the threshold.
 
* __move-*\<time shifted\>*__
srtSecondary will be shifted (can be forward or backward) and merged into srtPrimary.  

__noString__ takes true or false, if it's true, output the srt-object, otherwise output srt text.  
If you only want to edit one file, simply leave the srtPrimary with an empty string.

##Testing
I haven't make any test. So if you find something strange, please leave a message.
 