const express = require("express");
const server = express();

const fs = require("fs");
const url = require("url");
// const gbk = require('gbk');
const JSDOM = require("jsdom").JSDOM;
const Segment = require("segment");
let seg = new Segment();
seg.useDefault();

server.listen(8888);

/*
GET传url地址，正则替换文本类中的标签，使用segment中文分词模块统计出现次数多的词
 */

server.use("/getMsg", (req, res) => {
    console.log(req.query);
    GetUrl(req.query.str, data => {
        let DOM = new JSDOM(data);
        let document = DOM.window.document;

        var myHtml = document
            .querySelector(".post-body")
            .innerHTML.replace(/<[^>]+\d>/g, "");
        // console.log(myHtml);
        var arr = seg.doSegment(myHtml);
        // console.log(arr);
        var myarr = [];
        arr.forEach(data => {
            if (data.p != 2048) {
                myarr.push(data.w);
            }
        });
        var myJson = {};
        myarr.forEach(data => {
            if (!myJson[data]) {
                myJson[data] = 1;
            } else {
                myJson[data]++;
            }
        });

        let arr2 = [];
        for (let word in myJson) {
            if (myJson[word] <= 1) continue;
            arr2.push({
                w: word,
                c: myJson[word]
            });
        }
        arr2.sort((json1, json2) => json2.c - json1.c);

        res.send({ count: arr2 });
    });
});
function GetUrl(sUrl, success) {
    var urlObj = url.parse(sUrl);
    var http = "";
    if (urlObj.protocol == "http") {
        http = require("http");
    } else {
        http = require("https");
    }

    let req = http.request(
        {
            // 默认post访问，使用on--data获取
            hostname: urlObj.hostname,
            path: urlObj.path
        },
        res => {
            if (res.statusCode == 200) {
                var arr = [];
                var str = "";
                res.on("data", buffer => {
                    arr.push(buffer);
                    str += buffer;
                });
                res.on("end", () => {
                    // let b = Buffer.concat(arr);
                    success && success(str);
                });
            } else if (res.statusCode == 302 || res.statusCode == 301) {
                GetUrl(sUrl, success);
            }
        }
    );

    req.end();
    req.on("error", function() {
        console.log("404");
    });
}

server.use(express.static("./"));
