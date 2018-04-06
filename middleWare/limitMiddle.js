function type(type, fn) {
    return function(req, res, next) {
        let ct = req.headers['content-type'] || '';
        if (0 != ct.indexOf(type)) {
            return next();
        }
        fn(req, res, next);
    }
}

let app = connect().use(type('application/x-www-form-urlencoded', connect.limit('64kb')))
                   .use(type('application/json', connect.limit('32kb')))
                   .use(type('image', connect.limit('2mb')))
                   .use(type('video', connect.limit('300mb')))
                   .use(connect.bodyParser())
                   .use(hello);