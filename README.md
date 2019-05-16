# srt-merge

Srt-merge is a small node.js project in one hundred lines.  
It can merge two srt files into one with some optional options.  
It can shift one srt file at given time to match the video file.  
It can place one subtitle at the top of screen and another one at bottom that is very useful for language learners.  

# Usage

You can use this tool in __Nodejs__ or in __Bash__ scripts.  
First, __npm install__ or __yarn__ to install dependencies.

## By JS Code

Examples are in __example.js__. Read and run it for a clear understanding.

This project contains one file __merge.js__, one function __merge()__.  

## merge(srtPrimary, srtSecondary\[, attr, noString])

__srtPrimary__ and __srtSecondary__ accept srt-string, or srt-object in the format of [npm-module subtitle](https://www.npmjs.com/package/subtitle). They will not be modified by this function.

__attr__ accepts one of the following values, __or an array of them__. They describe transformations performed on __srtSecondary__ before it is merge into __srtPrimary__. The action priority will always be "top-bottom", "move", then "nearest-cue".

Attribute inputs and corresponding effects:

1. __\<empty string> or \<undefined> or "simple"__

   Simply merge two files.

1. __top-bottom__

   Place srtPrimary at video bottom, srtSecondary at video top, using ass-file-format tag __{\an8}__ in srt-file output. This feature is supported by many video players including VLC, MPC-HC.

1. __nearest-cue-*\<threshold>*\[-no-append]__

   Cues in srtSecondary will be appended to corresponding cues in srtPrimary if the difference of their start time is no larger than the given threshold. If srtSecondary has multiple cues within the threshold, srtPrimary will append the earliest one.

   __no-append__ means srtSecondary will only be aligned with srtPrimary within a start time threshold. Whose start time are aligned, whose end time will also be aligned if they are within the threshold.

1. __move-*\<time shifted\>*__

   srtSecondary will be shifted (can be forward or backward) and merged into srtPrimary.

   __noString__ takes true or false, if it's true, output the srt-object, otherwise output srt text.

 If you only want to edit one file, leave the __srtPrimary__(not srtSecondary) with an empty string.


## By Bash
These JS Scripts read options from command line and output to stdout by default. They are helpful in writing bash scripts.
Use 'yarn build' to build them, which requires 'yarn global add browserify'.

### build/srt-merge.js
This can only accept one __attr__, not an array of them. When __-o \<out-file>__ is not specified, it will output to __stdout__. __-f__ option means overwrite existing file without prompt. Both input srt files must be text files encoded in utf-8. 
Piping is under construction.

``` bash
./srt-merge.js <srt-file-1> [<srt-file-2>] [<one-attr>] [-o [-f(force)] <output Filepath>]
```

## Practical Example

### Extracting multiple subtitles from an mkv file and merge them into one

This example is for Windows.

Suppose you want to show subtitles of two languages at the same time, and now both of them are embedded in an MKV video file. You want to extract them out and combine into one.

First, use [__ffmpeg__](https://www.ffmpeg.org/) to check which track is the subtitle you want.  

```bash
ffmpeg -i <your_mkv_file>
```

You will see something like:

>    Stream #0:10(eng): Subtitle: subrip  
>    Metadata:  
>      title           : English [Forced]

That means subtitle __English\[Forced]__ is on track 0:10. __-map__ option is used to extract it.

``` bash
ffmpeg -stats -v error -i <your_mkv_file> -map <track(here is 0:10)> <output_file(eng.srt)>
```

In the same way you can extract JPN subtitles.

``` bash
ffmpeg -stats -v error -i "xxx.mkv" -map 0:12 "xxx jpn.srt"
```

Then use this project to merge them.

``` bash
./srt-merge.js "xxx eng.srt" "xxx jpn.srt" top-bottom -o "xxx merged.srt"
```

Now, combine these processes into one script.

```PowerShell
// Powershell
Get-ChildItem ./ *.mkv | ForEach-Object {
    $srt1 = $_.BaseName + ' eng.srt'
    $srt2 = $_.BaseName + ' jpn.srt'
    ffmpeg -stats -v error -i $_.Name -map 0:10 $srt1
    ffmpeg -stats -v error -i $_.Name -map 0:12 $srt2
    $srt3 = $_.BaseName + ' eng_jpn.srt'
    node /path/to/srt-merge.js $srt1 $srt2 top-bottom -o $srt3
}
Get-ChildItem ./ '* eng.srt' | Remove-Item
Get-ChildItem ./ '* jpn.srt' | Remove-Item
```
### Shift and rename subtitles

This example is for Linux.

Suppose now you have following subtitle files and videos in one folder.

1. xx01xx.mkv, xx02xx.mkv, xx03xx.mkv
1. yy01yy_en.srt, yy01yy_jp.srt
1. yy02yy_en.srt, yy02yy_jp.srt
1.  yy03yy_en.srt, yy03yy_jp.srt

You want to shift these srt files a few seconds and rename it to match MKV filename.

First, You can use Debian package 'subtitleeditor' - it's a GUI subtitle editor - to check how many seconds to shift. 



