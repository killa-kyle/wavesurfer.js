"use strict";var wavesurfer=Object.create(WaveSurfer);document.addEventListener("DOMContentLoaded",function(){var e={container:document.querySelector("#waveform"),waveColor:"lightblue",progressColor:"navy",loaderColor:"purple",cursorColor:"navy"};location.search.match("scroll")&&(e.minPxPerSec=100,e.scrollParent=!0),location.search.match("normalize")&&(e.normalize=!0),wavesurfer.init(e),wavesurfer.load("example/media/demo.wav"),wavesurfer.enableDragSelection&&wavesurfer.enableDragSelection({color:"rgba(0, 255, 0, 0.1)"})}),wavesurfer.on("ready",function(){}),wavesurfer.on("error",function(e){console.error(e)}),wavesurfer.on("finish",function(){console.log("Finished playing")}),document.addEventListener("DOMContentLoaded",function(){var e=document.querySelector("#progress-bar"),r=e.querySelector(".progress-bar"),o=function(o){e.style.display="block",r.style.width=o+"%"},a=function(){e.style.display="none"};wavesurfer.on("loading",o),wavesurfer.on("ready",a),wavesurfer.on("destroy",a),wavesurfer.on("error",a)}),document.addEventListener("DOMContentLoaded",function(){var e=function(e,r){e.stopPropagation(),e.preventDefault(),r?e.target.classList.add("wavesurfer-dragover"):e.target.classList.remove("wavesurfer-dragover")},r={drop:function(r){e(r,!1),r.dataTransfer.files.length?wavesurfer.loadBlob(r.dataTransfer.files[0]):wavesurfer.fireEvent("error","Not a file")},dragover:function(r){e(r,!0)},dragleave:function(r){e(r,!1)}},o=document.querySelector("#drop");Object.keys(r).forEach(function(e){o.addEventListener(e,r[e])})});