/**
 * Create a WaveSurfer instance.
 */
var wavesurfer = Object.create(WaveSurfer);

/**
 * Init & load.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Init wavesurfer
    wavesurfer.init({
        container: '#waveform',
        // height: 200,
        scrollParent: true,
        normalize: true,
        minimap: true,
        // backend: 'AudioElement',
        cursorColor: '#bada55',
        progressColor: '#B2FEBF',
        waveColor: '#6B697E',
        cursorWidth: 4,
        minPxPerSec: 60,
        pixelRatio: 1


    });

    wavesurfer.util.ajax({
        responseType: 'json',
        url: 'rashomon.json'
    }).on('success', function(data) {
        wavesurfer.load(
            '../media/Lost.mp3',
            data
        );
    });

    // Report errors
    wavesurfer.on('error', function(err) {
        console.error(err);
    });

    /* Regions */
    wavesurfer.enableDragSelection({
        // color: randomColor(0.3),
        color: 'rgba(255, 255, 255, 0.7)',
        resize: true
    });

    wavesurfer.on('ready', function() {
        if (localStorage.regions) {
            loadRegions(JSON.parse(localStorage.regions));
        } else {
            loadRegions(
                extractRegions(
                    wavesurfer.backend.getPeaks(512),
                    wavesurfer.getDuration()
                )
            );
            wavesurfer.util.ajax({
                responseType: 'json',
                url: 'annotations.json'
            }).on('success', function(data) {
                loadRegions(data);
                saveRegions();
            });
        }
    });
    wavesurfer.on('region-click', function(region, e) {
        e.stopPropagation();
        // Play on click, loop on shift click
        e.shiftKey ? region.playLoop() : region.play();


    });
    wavesurfer.on('region-dblclick', editAnnotation);
    // wavesurfer.on('region-dblclick', function(region, e) {
    //     e.stopPropagation();

    //     region.playLoop();
    // });
    wavesurfer.on('region-updated', saveRegions);
    wavesurfer.on('region-removed', saveRegions);
    wavesurfer.on('region-in', showNote);
    wavesurfer.on('region-in', function(region, e) {
        // e.stopPropagation();

        // region.playLoop();
        // region.playLoop(): region.play();
        // console.log('looping')

    });

    wavesurfer.on('region-play', function(region) {
        region.once('out', function() {
            wavesurfer.play(region.start);
            // wavesurfer.pause();

        });
    });


    wavesurfer.on('region-click', storeLoop);

    function storeLoop(region) {
        // console.log('stored!');
        // console.log(this);
    }





    /* Minimap plugin */
    wavesurfer.initMinimap({
        height: 30,
        waveColor: '#ddd',
        progressColor: '#999',
        cursorColor: '#bada55'
    });


    /* Loop Button */
    var loop1 = $('#loop1');
    loop1.click(function(e) {

        //list all regions 
        var regionList = wavesurfer.regions.list;
        var regionKeys = Object.keys(regionList);
        var rightNow = function() {
            // x = Math.floor(wavesurfer.getCurrentTime());
            x = wavesurfer.getCurrentTime();
            return x
        }



        //if loop1 hasn't been set yet
        var i = 0;
        //cue
        var LoopCue;
        if (!wavesurfer.regions.list[i]) {
            rightNow();
            wavesurfer.addRegion({
                id: i,
                start: x,
                end: x + 2
            })
            wavesurfer.regions.list[i].data.note = "LOOP " + i + 1;

            console.log('creating region ' + i + 1 + ' with start time:' + x);
            // set cuepoint
            loopCue = wavesurfer.regions.list[i].start;

            //play from cuepoint
            wavesurfer.play(loopCue);

            //set loop1 to looping
            wavesurfer.regions.list[i].loop = true;

            i++;
        } else {
            console.log('loop ' + i + ' already here');
            console.log(x);

            // set cuepoint
            loopCue = wavesurfer.regions.list[i].start;

            //play from cuepoint
            wavesurfer.play(loopCue);

            //set loop1 to looping
            wavesurfer.regions.list[i].loop = true;

        }



    }); //end loop1 click

    //CLEAR Button
    var btnClear = $('#clear');
    btnClear.click(function(event) {
        wavesurfer.clearRegions();
    });






    /* Timeline plugin */
    // wavesurfer.on('ready', function () {
    //     var timeline = Object.create(WaveSurfer.Timeline);
    //     timeline.init({
    //         wavesurfer: wavesurfer,
    //         container: "#wave-timeline"
    //     });
    // });


    /* Toggle play/pause buttons. */
    var playButton = document.querySelector('#play');
    var pauseButton = document.querySelector('#pause');

    wavesurfer.on('play', function() {
        playButton.style.display = 'none';
        pauseButton.style.display = '';

    });
    wavesurfer.on('pause', function() {
        playButton.style.display = '';
        pauseButton.style.display = 'none';
    });
});


/**
 * Save annotations to localStorage.
 */
function saveRegions() {
    localStorage.regions = JSON.stringify(
        Object.keys(wavesurfer.regions.list).map(function(id) {
            var region = wavesurfer.regions.list[id];
            return {
                start: region.start,
                end: region.end,
                data: region.data
            };
        })
    );
}


/**
 * Load regions from localStorage.
 */
function loadRegions(regions) {
    regions.forEach(function(region) {
        region.color = randomColor(0.4);
        wavesurfer.addRegion(region);
    });
}


/**
 * Extract regions separated by silence.
 */
function extractRegions(peaks, duration) {
    // Silence params
    var minValue = 0.0015;
    var minSeconds = 0.25;

    var length = peaks.length;
    var coef = duration / length;
    var minLen = minSeconds / coef;

    // Gather silence indeces
    var silences = [];
    Array.prototype.forEach.call(peaks, function(val, index) {
        if (val < minValue) {
            silences.push(index);
        }
    });

    // Cluster silence values
    var clusters = [];
    silences.forEach(function(val, index) {
        if (clusters.length && val == silences[index - 1] + 1) {
            clusters[clusters.length - 1].push(val);
        } else {
            clusters.push([val]);
        }
    });

    // Filter silence clusters by minimum length
    var fClusters = clusters.filter(function(cluster) {
        return cluster.length >= minLen;
    });

    // Create regions on the edges of silences
    var regions = fClusters.map(function(cluster, index) {
        var next = fClusters[index + 1];
        return {
            start: cluster[cluster.length - 1],
            end: (next ? next[0] : length - 1)
        };
    });

    // Add an initial region if the audio doesn't start with silence
    var firstCluster = fClusters[0];
    if (firstCluster && firstCluster[0] != 0) {
        regions.unshift({
            start: 0,
            end: firstCluster[firstCluster.length - 1]
        });
    }

    // Filter regions by minimum length
    var fRegions = regions.filter(function(reg) {
        return reg.end - reg.start >= minLen;
    });

    // Return time-based regions
    return fRegions.map(function(reg) {
        return {
            start: Math.round(reg.start * coef * 10) / 10,
            end: Math.round(reg.end * coef * 10) / 10
        };
    });
}


/**
 * Random RGBA color.
 */
function randomColor(alpha) {
    return 'rgba(' + [~~(Math.random() * 255), ~~ (Math.random() * 255), ~~ (Math.random() * 255),
        alpha || 1
    ] + ')';

}


/**
 * Edit annotation for a region.
 */
function editAnnotation(region) {
    var form = document.forms.edit;
    form.style.opacity = 1;
    form.elements.start.value = Math.round(region.start * 10) / 10,
    form.elements.end.value = Math.round(region.end * 10) / 10;
    form.elements.note.value = region.data.note || '';
    form.onsubmit = function(e) {
        e.preventDefault();
        region.update({
            start: form.elements.start.value,
            end: form.elements.end.value,
            data: {
                note: form.elements.note.value
            }
        });
        form.style.opacity = 0;
    };
    form.onreset = function() {
        form.style.opacity = 0;
        form.dataset.region = null;
    };
    form.dataset.region = region.id;
}


/**
 * Display annotation.
 */
function showNote(region) {
    if (!showNote.el) {
        showNote.el = document.querySelector('#subtitle');
    }
    showNote.el.textContent = region.data.note || '–';
}

/**
 * Bind controls.
 */
GLOBAL_ACTIONS['delete-region'] = function() {
    var form = document.forms.edit;
    var regionId = form.dataset.region;
    if (regionId) {
        wavesurfer.regions.list[regionId].remove();
        form.reset();
    }
};

GLOBAL_ACTIONS['export'] = function() {
    window.open('data:application/json;charset=utf-8,' +
        encodeURIComponent(localStorage.regions));
};