var request   = require("request-promise");
const cheerio = require("cheerio");
const fs      = require("fs");

const headers = {
    "Referer": "https://www.nvshens.com/g/24656/"
}

const basePath = "/近期学习/NodePrac/crawler/photos/";
let downloadPath, pageIndex = 1;

module.exports = {
    async getPage(url) {
        const data = {
            url,
            res: await request({
                url: url
            })
        }
        return data;
    },
    getTitle(data) {
        const $ = cheerio.load(data);
        if($("#htilte").text()) {
            downloadPath = basePath + $("#htilte").text();
            if(!fs.existsSync(downloadPath)) {
                fs.mkdirSync(downloadPath);
                console.log(`${downloadPath}文件夹创建成功`);
            }
            return true;
        } else {
            return false;
        }
    },
    async download(data) {
        if(data) {
            var $ = cheerio.load(data);
            $("#hgallery").children().each(async (i, elem) => {
                const imgSrc  = $(elem).attr("src");
                const imgPath = "/" + imgSrc.split("/").pop().split(".")[0] + "." + imgSrc.split(".").pop();
                console.log(`${downloadPath + imgPath}下载中`);
                const imgData = await request({
                    uri: imgSrc,
                    resolveWithFullResponse: true,
                    headers,
                }).pipe(fs.createWriteStream(downloadPath + imgPath));
            })
            console.log("page done");
        }
    }
}