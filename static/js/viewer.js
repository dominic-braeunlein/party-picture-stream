$(function () {
    // parameters
    displayTime = 5000;

    // stores the images to display
    var images = [];


    // renders the images
    function display() {
        console.log(images.length + " image(s) stored at the viewer")

        // check, if there are images left to display
        if(images.length > 0) {
            // display a new image
            var img = new Image();
            img.onload = function () {
                $("#image").empty();
                $("#image").append(img);
            };
            img.error = function () {
                console.log("error, couln't load " + resJson.lastImage);
            };
            img.src = images[0];
            images.splice(0, 1);

        } else {
            // get new images from the server
            getImages();

            // if there were images at the server, draw the first one right away
            if(images.length > 0) {
                display();
            }
        }
    }

    // pulls new images from the server
    function getImages() {
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('get', '/api/image', true);
        xhr.onload = function () {
            $('#userFileInput').val('');

            var resJson = JSON.parse(xhr.responseText);
            images = resJson['images'];
        };
        xhr.onerror = function() {
            console.log("couldn't load /api/image");
        };
        xhr.send();
        return;
    };

    // script execution starts here
    setInterval(display, displayTime);
    display();
});