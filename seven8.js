    var wavesurfer = Object.create(WaveSurfer);
    //intialize container + waveform
    wavesurfer.init({
        container: document.querySelector('#wave'),
        waveColor: '#666666',
        progressColor: 'lightblue',
        height: 300,
        // scrollParent: true,
        normalize: true,
        minimap: true,
    });


    //subscribe to events
    wavesurfer.on('ready', function () {
        wavesurfer.play();
    });

    // load track
    wavesurfer.load('example/media/Lost.mp3');



    /* Regions */
    wavesurfer.enableDragSelection({
        color: randomColor(0.1)
    });

    /**
     * Random RGBA color.
     */
    function randomColor(alpha) {
        return 'rgba(' + [
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            ~~(Math.random() * 255),
            alpha || 1
        ] + ')';

    }


    wavesurfer.on('region-click', function (region, e) {
        e.stopPropagation();
        // Play on click, loop on shift click
        e.shiftKey ? region.playLoop() : region.play();
    });