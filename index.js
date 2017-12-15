var path = require('path')
var fs = require('fs')
var conf = require('./config.json')

var chan = require('4chanjs')
var Jimp = require('jimp')
var async = require('async')

var board = chan.board(conf.board)

function cropAndSave (urlList) {
  var savedFilePaths = []
  async.eachSeries(urlList, function (url, callback) {
    Jimp.read(url.url, function (err, image) {
      if (image === undefined) {
        console.error('Image is undefined, skipping: ', url.url)
        callback()
        return
      }

      if (err == null) {
        image.scaleToFit(512, 512)
        image.quality(80)

        var filePath = path.join(__dirname, 'tmp', url.tim + '.png')

        image.write(filePath, function () {
          console.log('File saved: ', filePath)
          savedFilePaths.push(filePath)
          callback()
        })
      } else {
        console.error('Failed to fetch image: ', url.url)
        callback(err)
      }
    })
  }, function (err) {
    if (err) {
      console.log('A file failed to download: ', err)
    } else {
      console.log('All files have been downloaded successfully')
    }
  })
}

function checkImageValidity (imagePath) {
  var fileStats = fs.statSync(imagePath)
  var fileSizeKb = fileStats.size / 1000.0
}

board.catalog(function (err, pages) {
  if (pages == null) {
    console.error('No pages were found: ', err)
  } else {
    var urlList = []

    for (var i = 0; i < pages.length; i++) {
      for (var j = 0; j < pages[i].threads.length; j++) {
        var url = board.image(pages[i].threads[j].tim + pages[i].threads[j].ext)

        switch (pages[i].threads[j].ext) {
          case '.webm':
          case '.gif':
            console.info(pages[i].threads[j].tim + pages[i].threads[j].ext + " was not used because it's a webm or gif")
            break
          default:
            if (pages[i].threads[j].tim > 0) {
              var urlobj = {'url': url, 'tim': pages[i].threads[j].tim}
              urlList.push(urlobj)
            }
        }
      }
    }
    cropAndSave(urlList)
  }
})
