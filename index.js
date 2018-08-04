const Subtitle = require('subtitle');

function merge(srtPrimary, srtSecondary, attr, noString) {
  if (typeof srtPrimary === 'string') {
    srtPrimary = Subtitle.parse(srtPrimary);
  }
  if (typeof srtSecondary === 'string') {
    srtSecondary = Subtitle.parse(srtSecondary);
  }
  if (typeof srtPrimary !== 'object' || typeof srtSecondary !== 'object') {
    console.error('cannot parse srt file');
    return;
  }
  if(attr) { attr = attr.trim(); }
  if (attr === 'top-bottom') {
    srtPrimary = clearPosition(srtPrimary);
    srtSecondary = clearPosition(srtSecondary);
    srtSecondary.forEach(caption => {
      caption.text = '{\\an8}' + caption.text;
    });
  } else if (/^nearest-cue-[0-9]+$/.test(attr)) {
    const threshold = parseInt(attr.substring(attr.lastIndexOf('-') + 1));
    const srtPrimaryTimeArray = srtPrimary.map(caption => caption.start);
    // try to merge srtSecondary into srtPrimary, failed captions stay in srtSecondary
    srtPrimary = copySrt(srtPrimary);
    srtSecondary = srtSecondary.map(caption => {
      let index = binarySearch(caption.start, srtPrimaryTimeArray);
      if (index === -1) {
        if (srtPrimary[0].start - caption.start <= threshold) {
          srtPrimary[0].text = srtPrimary[0].text + '\n' + caption.text;
        } else { return caption; }
      } else if (caption.start - srtPrimary[index].start <= threshold) {
        srtPrimary[index].text = srtPrimary[index].text + '\n' + caption.text;
      } else if (index === srtPrimary.length - 1) {
        return caption;
      } else if (srtPrimary[index + 1].start - caption.start <= threshold) {
        srtPrimary[index + 1].text = srtPrimary[index + 1].text + '\n' + caption.text;
      } else {
        return caption;
      }
    }).filter(caption => (caption !== undefined));
  } else if (/^move-merge-[-]?[0-9]+$/.test(attr)) {
    const delay = parseInt(attr.substring(attr.lastIndexOf('e') + 2));
    srtSecondary = Subtitle.resync(srtSecondary, delay);
  } else if (attr !== undefined && attr !== 'simple' && attr !== '') {
    console.error('Cannot parse attr');
    return;
  }
  let srt3 = srtPrimary.concat(srtSecondary);
  srt3.sort((caption1, caption2) => {
    return caption1.start - caption2.start;
  });
  return noString ? srt3 : Subtitle.stringify(srt3);
}

function clearPosition(srt) {
  return srt.map(caption => {
    caption = Object.assign({}, caption);
    caption.text = caption.text.replace(/{\\a[n]?[0-9]}/g, '');
    caption.text = caption.text.replace(/{\\pos\([0-9]+,[0-9]+\)}/g, '');
    return caption;
  });
}

function copySrt(srt) {
  return srt.map(caption => Object.assign({}, caption));
}

function binarySearch(value, array, comp) {
  let left = 0, right = array.length;
  while(right > left) {
    let mid = Math.floor((left + right) / 2);
    let result;
    if(comp) {
      result = comp(array[mid], value);
    } else {
      result = array[mid] < value ? -1 : array[mid] > value ? 1 : 0;
    }
    if(result === 0) { return mid; }
    if(result < 0) { left = mid + 1; }
    else { right = mid; }
  }
  return left - 1;
}

module.exports = {
  merge
};