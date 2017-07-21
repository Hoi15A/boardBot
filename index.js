var fs = require('fs');
var chan = require('4chanjs');



var conf = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'));

var board = chan.board(conf.board);

board.threads(function(err, pages){

  for (var i = 0; i < pages.length; i++) {
    for (var j = 0; j < pages[i].threads.length; j++) {
      console.log(pages[i].threads[j]);
    }
  }
});
