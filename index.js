var fs = require('fs');

// External
var chan = require('4chanjs');
var Jimp = require("jimp");
var async = require("async");
require('console-stamp')(console, '[HH:MM:ss.l]');

var conf = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

var board = chan.board(conf.board);

function cropAndSave(urlList) {
  async.eachSeries(urlList, function(url, callback) {
    Jimp.read(url.url, function (err, image) {

      if (err == null) {
        image.scaleToFit(512,512);
        image.quality(80);
        image.write(__dirname + "/tmp/" + url.tim + ".png", function () {
          console.log("File saved");
          callback();
        });
      } else {
        console.log(err);
        callback("Failed to fetch image");
      }

    });

  }, function(err) {
      if( err ) {
        console.log('A file failed to download');
        console.log(err);
      } else {
        console.log('All files have been downloaded successfully');
      }
  });



};


board.catalog(function(err, pages){
  console.log(err);
  if (pages == null) {
    console.log("wat");
  } else {

    var urlList = [];

    for (var i = 0; i < pages.length; i++) {
      for (var j = 0; j < pages[i].threads.length; j++) {

        var url = board.image(pages[i].threads[j].tim + pages[i].threads[j].ext);

        switch (pages[i].threads[j].ext) {
          case ".webm":
          case ".gif":
            console.log(pages[i].threads[j].tim + pages[i].threads[j].ext + " was not used because it's a webm or gif");
            break;
          default:
            if (pages[i].threads[j].tim > 0) {
              var urlobj = {"url": url, "tim": pages[i].threads[j].tim};
              urlList.push(urlobj);
            }
        }

      }
    }
    cropAndSave(urlList);

  }

});
