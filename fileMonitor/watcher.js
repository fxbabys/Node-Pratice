function Watcher(watchDir, processedDir) {
    this.watchDir     = watchDir;
    this.processedDir = processedDir;
}

var events = require('events');
    util   = require('util');

/*继承事件发射器行为*/
util.inherits(Watcher, events.EventEmitter);

// Watcher.prototype = new events.EventEmitter();

/*扩展事件发射器的功能*/
var fs           = require('fs');
    watchDir     = './watch';
    processedDir = './done';

Watcher.prototype.watch = function() {
    var watcher = this;     //保存对Watcher对象的引用
    fs.readdir(this.watchDir, function(err, files) {
        if (err) throw err;
        for(var index in files) {
            watcher.emit('process', files[index]);
        }
    });
}

Watcher.prototype.start = function() {
    let watcher = this;
    fs.watchFile(watchDir, function() {
        watcher.watch();
    });
}

let watcher = new Watcher(watchDir, processedDir);

watcher.on('process', function process(file) {
    let watchFile = this.watchDir + '/' + file;
    let processedFile = this.processedDir + '/' + file.toLowerCase();

    fs.rename(watchFile, processedFile, function(err) {
        if (err) throw err;
    });
});

watcher.start();