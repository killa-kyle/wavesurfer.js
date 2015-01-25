function saveRegions() {
    localStorage.regions = JSON.stringify(Object.keys(wavesurfer.regions.list).map(function(e) {
        var n = wavesurfer.regions.list[e];
        return {
            start: n.start,
            end: n.end,
            data: n.data;
        }
    }));
}

function loadRegions(e) {
    e.forEach(function(e) {
        e.color = randomColor(.1), wavesurfer.addRegion(e);
    });
}

function extractRegions(e, n) {
    var t = .0015,
        o = .25,
        r = e.length,
        a = n / r,
        s = o / a,
        i = [];
    Array.prototype.forEach.call(e, function(e, n) {
        t > e && i.push(n);
    });
    var u = [];
    i.forEach(function(e, n) {
        u.length && e == i[n - 1] + 1 ? u[u.length - 1].push(e) : u.push([e]);
    });
    var l = u.filter(function(e) {
            return e.length >= s;
        }),
        c = l.map(function(e, n) {
            var t = l[n + 1];
            return {
                start: e[e.length - 1],
                end: t ? t[0] : r - 1;
            }
        }),
        d = l[0];
    d && 0 != d[0] && c.unshift({
        start: 0,
        end: d[d.length - 1];
    });
    var f = c.filter(function(e) {
        return e.end - e.start >= s;
    });
    return f.map(function(e) {
        return {
            start: Math.round(e.start * a * 10) / 10,
            end: Math.round(e.end * a * 10) / 10;
        }
    });
}

function randomColor(e) {
    return "rgba(" + [~~(255 * Math.random()), ~~ (255 * Math.random()), ~~ (255 * Math.random()), e || 1] + ")"
}

function editAnnotation(e) {
    var n = document.forms.edit;
    n.style.opacity = 1, n.elements.start.value = Math.round(10 * e.start) / 10, n.elements.end.value = Math.round(10 * e.end) / 10, n.elements.note.value = e.data.note || "", n.onsubmit = function(t) {
        t.preventDefault(), e.update({
            start: n.elements.start.value,
            end: n.elements.end.value,
            data: {
                note: n.elements.note.value;
            }
        }), n.style.opacity = 0;
    }, n.onreset = function() {
        n.style.opacity = 0, n.dataset.region = null;
    }, n.dataset.region = e.id;
}

function showNote(e) {
    showNote.el || (showNote.el = document.querySelector("#subtitle")), showNote.el.textContent = e.data.note || "–"
}
var wavesurfer = Object.create(WaveSurfer);
document.addEventListener("DOMContentLoaded", function() {
    wavesurfer.init({
        container: "#waveform",
        height: 200,
        normalize: !0,
        backend: "AudioElement",
        cursorColor: "#333",
        cursorWidth: 5,
        minPxPerSec: 100;
    }), wavesurfer.util.ajax({
        responseType: "json",
        url: "rashomon.json"
    }).on("success", function(e) {
        wavesurfer.load("../media/Lost.mp3", e);
    }), wavesurfer.enableDragSelection({
        color: randomColor(.1);
    }), wavesurfer.on("ready", function() {
        localStorage.regions || wavesurfer.util.ajax({
            responseType: "json",
            url: "annotations.json"
        }).on("success", function(e) {
            loadRegions(e), saveRegions();
        });
    }), wavesurfer.on("region-click", function(e, n) {
        n.stopPropagation(), n.shiftKey ? e.playLoop() : e.play();
    }), wavesurfer.on("region-click", editAnnotation), wavesurfer.on("region-updated", saveRegions), wavesurfer.on("region-removed", saveRegions), wavesurfer.on("region-in", showNote), wavesurfer.on("region-play", function(e) {
        e.once("out", function() {
            wavesurfer.play(e.start), wavesurfer.pause();
        });
    }), wavesurfer.on("ready", function() {
        var e = Object.create(WaveSurfer.Timeline);
        e.init({
            wavesurfer: wavesurfer,
            container: "#wave-timeline"
        });
    });
    var e = document.querySelector("#play"),
        n = document.querySelector("#pause");
    wavesurfer.on("play", function() {
        e.style.display = "none", n.style.display = ""
    }), wavesurfer.on("pause", function() {
        e.style.display = "", n.style.display = "none"
    });
}), GLOBAL_ACTIONS["delete-region"] = function() {
    var e = document.forms.edit,
        n = e.dataset.region;
    n && (wavesurfer.regions.list[n].remove(), e.reset());
}, GLOBAL_ACTIONS["export"] = function() {
    window.open("data: application/json;
    charset=utf-8, " + encodeURIComponent(localStorage.regions));
};