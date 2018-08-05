Srt-merge is a tiny node.js project, with just a hundred lines of code.  
It can merge two srt files into one with a few options.  
Top-Bottom feature is very suitable for foreign language learners.
# Usage
There is a usage example in __example.js__. Run it for a clear understanding.  
It provides just one function.  
## merge(srtPrimary, srtSecondary\[, attr, noString])
__srtPrimary__ and __srtSecondary__ accept srt-string, or srt-object with the format of [npm-module subtitle](https://www.npmjs.com/package/subtitle).  And they will not be changed in this function.  
__attr__ accepts one of the following values, __or an array of them__, but the performing order will always be top-bottom, move, then nearest-cue:

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

# Testing
I haven't make any test. So if you find something strange, please leave a message.

# Scripts
In folder /scripts are some scripts which reads command line arguments. They are great tools when writing shell scripts.
## Files
### merge-script.js
#### Usage
It only accepts one __attr__.  
If __output__ is not specified, it will print to console.log.  
__Force__ flag means overwrite without questioning.

    node merge-script.js <srt Filepath 1> <srt Filepath 2> [<attr>] [-o [-f(force)] <output Filepath>]  
## Scripts Example
Examples here are on windows platform.
### Extracting subtitles from mkv file and merge
First, use [__ffmpeg__](https://www.ffmpeg.org/) to check on which track is the subtitle you want.
  
```bash
ffmpeg -i <your_mkv_file>
```

You will see something like:

    Stream #0:10(eng): Subtitle: subrip
    Metadata:
      title           : English [Forced]
    
Which means subtitle __English\[Forced]__ is on track 0:10. You can use this to extract.
    
    ffmpeg -stats -v error -i <your_mkv_file> -map <track(0:10)> <output_file(eng.srt)>
     
Now we need to automate it. 

```PowerShell
// Powershell
Get-ChildItem ./ *.mkv | ForEach-Object {
    $srt1 = $_.BaseName + ' eng.srt'
    $srt2 = $_.BaseName + ' jpn.srt'
    ffmpeg -stats -v error -i $_.Name -map 0:10 $srt1
    ffmpeg -stats -v error -i $_.Name -map 0:12 $srt2
    $srt3 = $_.BaseName + ' eng_jpn.srt'
    node /path/to/merge-script.js $srt1 $srt2 top-bottom -o $srt3
}
Get-ChildItem ./ '* eng.srt' | Remove-Item
Get-ChildItem ./ '* jpn.srt' | Remove-Item
```

   
 
