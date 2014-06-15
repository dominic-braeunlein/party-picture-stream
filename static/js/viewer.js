// control flow (since im confused sometimes)

//========================================================================================================================
// main (called periodically)
//      if there are images -> render them
//      if not -> request new images from the server (todo: do the right request with time)
//          if there were images on the server
//              adjust display settings to current work load
//              adjust page layout to display settings
//              adjust call of the main function to current display settings
//              render next images right away to not have a black screen after adjusting the page layout
//          if not
//              the timer will call the main function again after an intervall
//========================================================================================================================



$(function () {
    // parameters
    var
        displayTime = 5000,  // time to display one image
        splitScreens = 1,  // number of parallel displayed images
        maxSplitScreens = 1,  // maximum number of parallel displayed images
        minDisplayTime = 2000,  // minimal time to display one image
        maxDisplayDelay = 10000;    // max time until new images should be loaded from the server
                                    // NOTE: this is a soft condition and will not always be fulfilled. It depends on the minimum display time and
                                    // the number of parallel displayed images you have set, if this condition can be met. However, the program will 
                                    // set everything to maximum speed if the condition can not be reached to get as close as possible.


    // globals
    var images = []; // stores the images, that are yet to display
    // timer that regularry triggers the main function
    var timer = setInterval(main, displayTime);
    // start the main function right away manually to not waste time
    main();
    // stores the images to display
    var images = [];
    var lastRequest;

    // adjusts display settings to the current workload
    function adjustDisplaySettings(screens) {
        // lets you call adjustDisplaySettings() with 1 as default
        screens = typeof screens !== 'undefined' ? a : 1;

        // if there are images to display, we have to adjust the display settings to the current workload
        if(images.length > 0) {
            // compute the required display time
            neededDisplayTime = (maxDisplayDelay * screens) / images.length;

            // if the required speed of the images changing is higher than the limit, then more screens are needed
            if(minDisplayTime > neededDisplayTime) {
                // check if more screens are supportet
                if(screens * 2 > maxSplitScreens) {
                    // if not, just go as fast as possible
                    console.log('\tcant use more screens, setting everything as fast as possible');
                    console.log('\tsetting display time to ' + minDisplayTime);
                    console.log('\tsetting number of screens to ' + screens);
                    splitScreens = screens;
                    displayTime = minDisplayTime;
                } else {
                    adjustDisplaySettings(screens * 2);
                    return;
                }
            } else {
                console.log('\tsetting display time to ' + neededDisplayTime);
                console.log('\tsetting number of screens to ' + screens);
                displayTime = neededDisplayTime;
                splitScreens = screens;
            }
        }
    }

    // adjusts the page layout to the global parameters (paramters get changed by adjustDisplaySettings)
    function adjustPageLayout() {
        if(images.length > 0) {
            $("#images").empty();
            for(var i = 0; i < splitScreens; i++) {
                var code = '<div id=img' + i + '></div>';
                $("#images").append(code);
            }
        }
    }

    // loads an image and appends it to the given div (id) on the page
    function loadImage(id, imagePath) {
        if(images.length > 0) {
            // display a new image
            var img = new Image();
            img.onload = function () {
                var elem = "#img" + id;
                $(elem).empty();
                $(elem).append(img);
            };
            img.error = function () {
                console.log("error, couln't load " + resJson.lastImage);
            };
            img.src = imagePath;
        }
    }

    // loads the right ammount of images using load image
    function renderNextImages() {
        for(var i = 0; i < splitScreens; i++) {
            if(images.length > 0) {
                console.log('\tloading image ' + images[0]);
                loadImage(i, images[0]);
                images.splice(0, 1);
            }
        }
    }

    // pulls new images from the server
    function getImages() {
        var url;
        if (lastRequest) {
            url = '/api/image?from=' + lastRequest;
        } else {
            url = '/api/image';
        }
        $.ajax({
            url : url,
            dataType : 'json'
        }).then(function (resJson) {
            images = resJson['images'];
            console.log('\tgot ' + images.length + ' new images');

            // if no images get pulled, the interval will not be cleared and try to pull again after a while
            // hopefully there are images then since always seeing the same image is quiet boring :(
            if(images.length > 0) {
                lastRequest = new Date().toISOString().substring(0, 19).replace(/:/g, "-");
                console.log('adjusing display settings...');
                adjustDisplaySettings();
                console.log('adjusing page layout...');
                adjustPageLayout();
                console.log('setting new timer interval ' + displayTime);
                clearInterval(timer);
                timer = setInterval(main, displayTime);
                renderNextImages();
            }
        }, function () {
            console.log("couldn't load /api/image");
        });
    };

    // starts the control flow
    function main() {
        if(images.length > 0) {
            console.log('rendering next images...');
            renderNextImages();
        } else {
            console.log('pulling images...');
            getImages();
        }
    }
});