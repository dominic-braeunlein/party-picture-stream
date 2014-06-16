$(function () {
    status('Choose a file.');

    var queue = [];
    var currentUploadCounter = 0;

    $("body").on("drop", function (event) {
        event.stopPropagation();
        event.preventDefault();
        var files = event.originalEvent.dataTransfer.files;
        for (var i = 0; i < files.length; i++)
            queueFile(files[i]);
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

    function queueFile(file) {
        if (file) {
            queue.push(file);
        }
        if (currentUploadCounter === 0 && queue.length > 0) {
            var upload = queue.shift();
            currentUploadCounter++;
            uploadFile(upload).always(function () {
                currentUploadCounter--;
                queueFile();
            });
        }
    }

    function uploadFile(file) {

        var formData = new FormData();
        formData.append('userFile', file);
        console.log(file);

        return $.ajax({
            xhr : function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.onprogress = function (e) {
                    if (e.lengthComputable) {
                        var percent = Math.round((e.loaded / e.total) * 100);
                        if (percent == 100) {
                            status('Processing.');
                        }
                        setProgress(percent);
                    }
                };
                return xhr;
            },
            url: '/api/upload',
            type: "POST",
            contentType: false,
            processData: false,
            data: formData,
            dataType: "json"
        }).fail(function (e) {
            status('Error while uploading.');
        }).done(function (resJson) {
            setProgress(0);
            status('Choose a new file.');
            if (resJson.image) {
                $('<div>')
                    .css({ backgroundImage : 'url(' + resJson.image + ')' })
                    .prependTo('#photostream');
            }
        });
    }

    $("#userFileInput").change(function () {

        if (!this.value) return;

        status('Uploading.');
        queueFile(document.getElementById('userFileInput').files[0]);

    });
    function status(message) {
        $('#status').text(message);
    }
});