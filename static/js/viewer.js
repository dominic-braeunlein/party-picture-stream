$(function () {
    // parameters
    var displayTime = 5000;

    // stores the images to display
    var images = [],
        pointer = 0,
        lastRequest;

    // renders the images
    function display() {
        console.log(images.length + " image(s) stored at the viewer")

        // check, if there are images left to display
        if (images.length > 0 && images.length > pointer) {
            // display a new image
            $("#image").css({
                backgroundImage : 'url(' + images[pointer] + ')'
            });
            pointer++;

        } else {
            // get new images from the server
            getImages();
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
        }).then(function (json) {
            images = images.concat(json.images);
            lastRequest = new Date().toISOString().substring(0, 20).replace(/:/g,"-");
            return images;
        }, function () {
            console.log("couldn't load /api/image");
        });
    };

    // script execution starts here
    setInterval(display, displayTime);
    display();
});
