const nvshens  = require("./co");
const base_url = "https://www.nvshens.com/g/";

let index = 1,
    start = 25380;
const end = 30000;

const main = async(URL) => {
    const data = await nvshens.getPage(URL);  // 请求网址
    if(nvshens.getTitle(data.res)) {  // 判断是否存在相册
        await nvshens.download(data.res); // 下载照片
        index++;                         // 请求分页
        const new_url = `${base_url}${start}/${index}.html`;
        main(new_url);
    }else {
        index = 1;
        console.log(`${base_url}${start}页面已完成`);
        start++;
        if(start < end) {
            main(base_url + start);  // 请求下一个网址
        } else {
            console.log(`${base_url}${end}所有页面已完成`);
        }
    }
}

main(base_url + start);