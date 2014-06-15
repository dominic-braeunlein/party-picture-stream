$(function () {
    status('Choose a file.');

    $("body").on("drop", function (event) {
        event.stopPropagation();
        event.preventDefault();
        var files = event.originalEvent.dataTransfer.files;
        for (var i = 0; i < files.length; i++)
            uploadFile(files[i]);
    }).on("dragenter dragover", function (event) {
        event.stopPropagation();
        event.preventDefault();
    });

    $("#upload-button").click(function () {
        $("#userFileInput").click();
    });

    function setProgress(percent) {
        $('#percent').html(percent + '%');
        $('#bar').css('width', percent + '%');
    }

    function uploadFile(file) {

        var formData = new FormData();
        formData.append('userFile', file);

        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('post', '/api/upload', true);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable) {
                var percent = Math.round((e.loaded / e.total) * 100);
                if (percent == 100) {
                    status('Processing.');
                }
                setProgress(percent);
            }
        };
        xhr.onerror = function (e) {
            status('Error while uploading.');
        };
        xhr.onload = function () {
            setProgress(0);
            var resJson = JSON.parse(xhr.responseText);
            status('Uploaded ' + resJson.image + '. Choose a new file.');
            if (resJson.image) {
                $('<div>')
                    .css({ backgroundImage : 'url(' + resJson.image + ')' })
                    .prependTo('#photostream');
            }
        };
        xhr.send(formData);
    }

    $("#userFileInput").change(function () {

        if (!this.value) return;

        status('Uploading.');
        uploadFile(document.getElementById('userFileInput').files[0]);

    });
    function status(message) {
        $('#status').text(message);
    }
});