var express = require('express'),
    app = express(),
    knox = require('knox'),
    fs = require('fs'),
    path = require('path'),
    multer = require('multer');

var allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
var baseFolder = path.join(__dirname, "static");

var images = [], s3client;

if (process.env.S3_ACCESS && process.env.S3_SECRET && process.env.S3_BUCKET) {
    s3client = knox.createClient({
      key : process.env.S3_ACCESS,
      secret : process.env.S3_SECRET,
      bucket : process.env.S3_BUCKET,
      region : process.env.S3_REGION
    });
} else {
    console.log("S3 support disabled. Please provide S3_SECRET, S3_ACCESS and S3_BUCKET as environment variable.")
}

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
        dest: path.join(__dirname, "static/uploads"),
        rename: function (fieldname, filename) {
            return new Date().toISOString().substring(0, 19).replace(/:/g, "-") +
                path.extname(filename);
        }
    }));
    app.use(express.static(baseFolder));
});

app.post('/api/upload', function (req, res) {

    var filename = path.basename(req.files.userFile.path);

    console.log("upload start");
    if (allowedExtensions.indexOf(getExtension(req.files.userFile.name)) == -1) {
        res.send(400);
        return;
    }

    if (s3client) {
        s3client.putFile(req.files.userFile.path, "/" + filename, { 'x-amz-acl': 'public-read' }, function (err, s3res) {
            if (err) {
                res.send(500);
                console.error(err);
            } else {
                var lastImage = s3res.req.url;
                images.push(lastImage);
                res.send({ image: lastImage });
                console.log("Stored", images);
            }
        });
    } else {
        var lastImage = path.relative(baseFolder, req.files.userFile.path);
        images.push(lastImage)
        res.send({ image: lastImage });
        console.log("Stored", images);
    }
});

app.get('/api/image', function (req, res) {
    if (req.query.from) {
        res.send({
            images: images.filter(function (image) {
                return path.basename(image) > req.query.from;
            })
        });
    } else {
        res.send({ images: images });
    }
});

var server = app.listen(3000, function () {
    console.log('listening on port %d', server.address().port);
});