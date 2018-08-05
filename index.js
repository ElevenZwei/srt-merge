const Subtitle = require('subtitle');

function merge(srtPrimary, srtSecondary, attrs, noString) {
  if (typeof srtPrimary === 'string') {
    srtPrimary = Subtitle.parse(srtPrimary);
  }
  if (typeof srtSecondary === 'string') {
    srtSecondary = Subtitle.parse(srtSecondary);
  }
  if (typeof srtPrimary !== 'object' || typeof srtSecondary !== 'object') {
    throw new Error('cannot parse srt file');
  }
  if(attrs) {
    if (typeof attrs === 'string') { attrs = [attrs]; }
    // top-bottom and move-merge must be performed before nearest-cue, so here is a sort
    attrs.sort((attr1, attr2) => {
      const order = ['s', 't', 'm', 'n'];
      return order.indexOf(attr1[0]) - order.indexOf(attr2[0]);
    });
    attrs.forEach(attr => {
      if (attr) { attr = attr.trim(); }
      if (attr === 'top-bottom') {
        srtPrimary = clearPosition(srtPrimary);
        srtSecondary = clearPosition(srtSecondary);
        srtSecondary.forEach(caption => {
          caption.text = '{\\an8}' + caption.text;
        });
      } else if (/^nearest-cue-[0-9]+(-no-append)?$/.test(attr)) {
        const threshold = parseInt(attr.substring(attr.lastIndexOf('cue-') + 4));
        const srtPrimaryTimeArray = srtPrimary.map(caption => caption.start);
        const noAppend = attr.indexOf('-no-append') > -1;
        const append = function(captionA, captionB) {
          if(noAppend) {
            captionB.start = captionA.start;
            if(Math.abs(captionB.end - captionA.end) <= threshold) {
              captionB.end = captionA.end;
            }
            return captionB;
          } else {
            captionA.text = captionA.text + '\n' + captionB.text;
            return undefined;
          }
        };
        // try to merge srtSecondary into srtPrimary, failed captions stay in srtSecondary
        srtPrimary = copySrt(srtPrimary);
        srtSecondary = srtSecondary.map(caption => {
          let index = binarySearch(caption.start, srtPrimaryTimeArray);
          if (index === -1) {
            if (srtPrimary[0].start - caption.start <= threshold) {
              return append(srtPrimary[0], caption);
            } else { return caption; }
          } else if (caption.start - srtPrimary[index].start <= threshold) {
            return append(srtPrimary[index], caption);
          } else if (index === srtPrimary.length - 1) {
            return caption;
          } else if (srtPrimary[index + 1].start - caption.start <= threshold) {
            return append(srtPrimary[index+1], caption);
          } else {
            return caption;
          }
        }).filter(caption => (caption !== undefined));
      } else if (/^move-[-]?[0-9]+$/.test(attr)) {
        const delay = parseInt(attr.substring(attr.lastIndexOf('e-') + 2));
        srtSecondary = Subtitle.resync(srtSecondary, delay);
      } else if (attr !== undefined && attr !== 'simple' && attr !== '') {
        throw new Error('Cannot parse attr');
      }
    });
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