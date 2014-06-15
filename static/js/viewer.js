$(function () {
    // parameters
    displayTime = 5000;  // time to display one image
    splitScreens = 1;  // number of parallel displayed images
    maxSplitScreens = 4;  // maximum number of parallel displayed images
    minDisplayTime = 2000;  // minimal time to display one image
    maxDisplayDelay = 1500;  // max time until new images should be loaded from the server

    // stores the images to display
    var images = [];


    // adjusts display settings to the current workload
    function adjustDisplaySettings(screens) {
        // compute the required display time
        neededDisplayTime = (maxDisplayDelay * screens) / images.length;
        console.log('display time has to be set to ' + neededDisplayTime + ' (assuming ' + screens + ' screens)');

        // if the required speed of the images changing is higher than the limit, then more screens are needed
        if(minDisplayTime > neededDisplayTime) {

            if(screens * 2 > maxSplitScreens) {
                console.log('cant use more screens, setting everything as fast as possible');
                console.log('setting display time to ' + minDisplayTime);
                console.log('setting number of screens to ' + screens);
                splitScreens = screens;
                displayTime = minDisplayTime;
            } else {
                adjustDisplaySettings(screens * 2);
                return;
            }
        } else {
            console.log('setting display time to ' + neededDisplayTime);
            console.log('setting number of screens to ' + screens);
            displayTime = neededDisplayTime;
            splitScreens = screens;
        }
    }

    // adjusts the page layout to the global parameters (paramters get changed by adjustDisplaySettings)
    function adjustPageLayout() {
        console.log('adjusting page layout');
        $("#images").empty();

        for(var i = 0; i < splitScreens; i++) {
            var code = '<div id=img' + i + '></div>';
            $("#images").append(code);
        }
    }

    function loadImage(id, imagePath) {
        if(images.length > 0) {
            // display a new image
            var img = new Image();
            img.onload = function () {
                var elem = "#img" + id;
                console.log(elem);
                $(elem).empty();
                $(elem).append(img);
            };
            img.error = function () {
                console.log("error, couln't load " + resJson.lastImage);
            };
            img.src = imagePath;
        }
    }

    // renders the images
    function display() {
        console.log(images.length + " image(s) stored at the viewer")

        // check, if there are images left to display
        if(images.length > 0) {

            for(var i = 0; i < splitScreens; i++) {
                loadImage(i, images[0]);
                images.splice(0, 1);
            }
            clearInterval(intervalId);
            
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

            // adjust the display settings to display the images
            adjustDisplaySettings(1);
            adjustPageLayout();

        };
        xhr.onerror = function() {
            console.log("couldn't load /api/image");
        };
        xhr.send();
        return;
    };

    // script execution starts here
    var intervalId = setInterval(display, displayTime);
    display();
});