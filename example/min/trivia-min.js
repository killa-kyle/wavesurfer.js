var GLOBAL_ACTIONS={play:function(){wavesurfer.playPause()},back:function(){wavesurfer.skipBackward()},forth:function(){wavesurfer.skipForward()},"toggle-mute":function(){wavesurfer.toggleMute()}};document.addEventListener("DOMContentLoaded",function(){document.addEventListener("keydown",function(e){var t={13:"play",37:"back",39:"forth"},n=t[e.keyCode];n in GLOBAL_ACTIONS&&(e.preventDefault(),GLOBAL_ACTIONS[n](e))}),[].forEach.call(document.querySelectorAll("[data-action]"),function(e){e.addEventListener("click",function(e){var t=e.currentTarget.dataset.action;t in GLOBAL_ACTIONS&&(e.preventDefault(),GLOBAL_ACTIONS[t](e))})})}),document.addEventListener("DOMContentLoaded",function(){if(!window.AudioContext&&!window.webkitAudioContext){var e=document.querySelector("#demo");e&&(e.innerHTML='<img src="/example/screenshot.png" />')}var t=document.querySelector(".nav-pills"),n=t.querySelectorAll("li"),a=n[0];if(location.search){var o=location.search.split("&")[0],r=t.querySelector('a[href="'+o+'"]');r&&(a=r.parentNode)}a&&a.classList.add("active")});