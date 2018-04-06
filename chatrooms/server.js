let http  = require('http');
let fs    = require('fs');
let path  = require('path');
let mime  = require('mime');
let cache = {};

/*错误响应*/
function send404(response) {
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
}

/*发送文件数据*/
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200,
        {"Content-Type": mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
}

/*静态文件服务*/
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                        console.log("获取硬盘信息出错");
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
                console.log("硬盘中没有信息");
            }
        });
    }
}

/*创建HTTP服务器*/
let server = http.createServer(function(request, response) {
    let filePath = false;

    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    let absPath = './' + filePath;
    serveStatic(response, cache, absPath);
});

server.listen(3000, function() {
    console.log("Server listening on port 3000.");
});

let chatServer = require('./lib/chat_server');
chatServer.listen(server);