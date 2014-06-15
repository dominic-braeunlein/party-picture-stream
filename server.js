var express = require('express'),
    app = express(),
    multer = require('multer')

var imgs = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
var baseFolder = "/static";

var lastImage;

function getExtension(fn) {
    return fn.split('.').pop();
}

function fnAppend(fn, insert) {
    var arr = fn.split('.');
    var ext = arr.pop();
    insert = (insert !== undefined) ? insert : new Date().getTime();
    return arr + '.' + insert + '.' + ext;
}

app.configure(function () {
    app.use(multer({
        dest: './static/uploads/',
        rename: function (fieldname, filename) {
            return filename.replace(/\W+/g, '-').toLowerCase();
        }
    }));
    app.use(express.static(__dirname + baseFolder));
});

app.post('/api/upload', function (req, res) {
    console.log("upload start");
    if (imgs.indexOf(getExtension(req.files.userFile.name)) != -1) {
        lastImage = req.files.userFile.path.substring(baseFolder.length);
        console.log(lastImage);
    }

    res.send({file: req.files.userFile.name});

});

app.get('/api/image', function (req, res) {
    res.send({lastImage: lastImage});
});

var server = app.listen(3000, function () {
    console.log('listening on port %d', server.address().port);
});