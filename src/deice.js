export function deice (url, resourcename, innerfiles) {
  // DEICE.EXE was a tool id Software used to distribute their games
  // It contained a number of data files, numbered 1 through n, which
  // were then concatenated together into one big zip

  // Deice.load() requires a URL for the outer zip, and the basename of the 
  // resource files contained within. It also optionally takes a list
  // of files to return from the inner datafiles - if this is not specified,
  // all files are returned
  
  return new Promise((resolve, reject) => {
    fetch(url).then(f => {
      f.arrayBuffer().then(d => {
        let bytes = new Uint8Array(d);
        let zip = new JSZip();

        zip.loadAsync(bytes).then(z => {
          let files = [];
          for (let k in zip.files) {
            let parts = k.split('.');
            let idx = parseInt(parts[1]) - 1;
            if (parts[0] == resourcename && Number.isInteger(idx)) {
              files[idx] = zip.file(k);
            }
          }
console.log('beh', bytes, files, zip);
          if (files.length > 0) {
            let promises = [];
            for (let i = 0; i < files.length; i++) {
              promises[i] = files[i].async('uint8array');
            }
            Promise.all(promises).then(filedata => {
              // We've got all the inner resource file data, combine it into one big zip
              let totalLength = 0,
                  offset = 0;
              for (let i = 0; i < filedata.length; i++) {
                totalLength += filedata[i].length;
              }
              let combined = new Uint8Array(totalLength);
              for (let i = 0; i < filedata.length; i++) {
                combined.set(filedata[i], offset);
                offset += filedata[i].length;
              }

              // Extract that zip
              let innerzip = new JSZip();
              innerzip.loadAsync(combined).then(() => {
                let innerpromises = [],
                    innerdata = {};
                if (!innerfiles) innerfiles = Object.keys(innerzip.files);
                for (let i = 0; i < innerfiles.length; i++) {
                  let fname = innerfiles[i];
                  if (innerzip.files[fname]) {
                    // Asynchronously unzip each file into a Uint8Array
                    (function(fname) {
                      innerpromises[i] = innerzip.files[fname].async('uint8array');
                      innerpromises[i].then(d => innerdata[fname] = d);
                    })(fname);
                  }
                }
                // Once all files have been unzipped, we can finally return the data
                Promise.all(innerpromises).then(() => {
                  resolve(innerdata);
                });
              });
            });
          }
        });
      });
    });
  });
}
