$(function () {
    var lastImage = null;

    function getImage() {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('get', '/api/image', true);
        xhr.onload = function () {
            $('#userFileInput').val('');

            var resJson = JSON.parse(xhr.responseText);
            if (lastImage != resJson.lastImage) {
                var img = new Image();
                img.onload = function () {
                    $("#image").empty();
                    $("#image").append(img);
                };
                img.error = function () {
                   console.log("error, couln't load " + resJson.lastImage);
                };
                img.src = resJson.lastImage;
            }
        };
        xhr.onerror = function() {
            console.log("couldn't load /api/image");
        };
        xhr.send();
        return;
    };
    setInterval(getImage, 5000);
    getImage();

});