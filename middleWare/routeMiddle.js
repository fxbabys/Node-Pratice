let parse = require('url').parse();

module.exports = function route(obj) {

    /*可以利用闭包在这里缓存正则表达式*/

    return function(req, res, next) {
        /*检查确保req.method已定义*/
        if (!obj[req.method]) {
            next();
            return;
        }

        /*查找req.method对应的路径并存放到数组中  P139*/
        let routes = obj[req.method];
        let url    = parse(req.url);
        let paths  = Object.keys(routes);

        /*遍历路径*/
        for(let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let fn   = routes[path];
            path = path.replace(/\//g, '\\/')
                       .replace(/:(\w+)/g, '([^\\/]+)');
            let re = new RegExp('^' + path + '$');
            let captures = url.pathname.match(re);

            /*有相匹配的函数时传递并立即返回*/
            if (captures) {
                let args = [req, res].concat(captures.silce(1));
                fn.apply(null, args);
                return;
            }
        }
        next();
    }
};