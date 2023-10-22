addEventListener("DOMContentLoaded", (event) => {
  const maxPresetLabelLength = 120;
  window.$(function () {
    var visualizer = null;
    var rendering = false;
    var audioContext = null;
    var sourceNode = null;
    var delayedAudible = null;
    var cycleInterval = null;
    var presets = {};
    var presetKeys = [];
    var presetIndexHist = [];
    var presetIndex = 0;
    var canvas = document.getElementById("canvas");

    // defaults
    var presetCycle = false;
    var presetCycleLength = 15000;
    var presetRandom = false;
    const canvasWidth = 1280;
    const canvasHight = 720;

    function connectToAudioAnalyzer(sourceNode) {
      if (delayedAudible) {
        delayedAudible.disconnect();
      }

      delayedAudible = audioContext.createDelay();
      delayedAudible.delayTime.value = 0.26;

      sourceNode.connect(delayedAudible);
      delayedAudible.connect(audioContext.destination);

      visualizer.connectAudio(delayedAudible);
    }

    function startRenderer() {
      requestAnimationFrame(() => startRenderer());
      visualizer.render();
    }

    function playBufferSource(buffer) {
      if (!rendering) {
        rendering = true;
        startRenderer();
      }

      if (sourceNode) {
        sourceNode.disconnect();
      }

      sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = buffer;
      connectToAudioAnalyzer(sourceNode);

      sourceNode.start(0);
    }

    function loadLocalFiles(files, index = 0) {
      audioContext.resume();

      var reader = new FileReader();
      reader.onload = (event) => {
        audioContext.decodeAudioData(event.target.result, (buf) => {
          playBufferSource(buf);

          setTimeout(() => {
            if (files.length > index + 1) {
              loadLocalFiles(files, index + 1);
            } else {
              sourceNode.disconnect();
              sourceNode = null;
              window.$("#audioSelectWrapper").css("display", "block");
            }
          }, buf.duration * 1000);
        });
      };

      var file = files[index];
      reader.readAsArrayBuffer(file);
    }

    function connectMicAudio(sourceNode, audioContext) {
      audioContext.resume();

      var gainNode = audioContext.createGain();
      gainNode.gain.value = 1.25;
      sourceNode.connect(gainNode);

      visualizer.connectAudio(gainNode);
      startRenderer();
    }

    function nextPreset(blendTime = 5.7) {
      presetIndexHist.push(presetIndex);

      var numPresets = presetKeys.length;
      if (presetRandom) {
        presetIndex = Math.floor(Math.random() * presetKeys.length);
      } else {
        presetIndex = (presetIndex + 1) % numPresets;
      }

      visualizer.loadPreset(presets[presetKeys[presetIndex]], blendTime);
      window.$("#presetSelect").val(presetIndex);
    }

    function prevPreset(blendTime = 5.7) {
      var numPresets = presetKeys.length;
      if (presetIndexHist.length > 0) {
        presetIndex = presetIndexHist.pop();
      } else {
        presetIndex = (presetIndex - 1 + numPresets) % numPresets;
      }

      visualizer.loadPreset(presets[presetKeys[presetIndex]], blendTime);
      window.$("#presetSelect").val(presetIndex);
    }

    function restartCycleInterval() {
      if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
      }

      if (presetCycle) {
        cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength);
      }
    }

    window.$(document).keydown((e) => {
      if (e.which === 32 || e.which === 39) {
        nextPreset();
      } else if (e.which === 8 || e.which === 37) {
        prevPreset();
      } else if (e.which === 72) {
        nextPreset(0);
      }
    });

    window.$("#presetSelect").change((evt) => {
      presetIndexHist.push(presetIndex);
      presetIndex = parseInt(window.$("#presetSelect").val());
      visualizer.loadPreset(presets[presetKeys[presetIndex]], 5.7);
    });

    window.$("#presetCycle").change(() => {
      presetCycle = window.$("#presetCycle").is(":checked");
      restartCycleInterval();
    });

    window.$("#presetCycleLength").change((evt) => {
      presetCycleLength = parseInt(window.$("#presetCycleLength").val() * 1000);
      restartCycleInterval();
    });

    window.$("#presetRandom").change(() => {
      presetRandom = window.$("#presetRandom").is(":checked");
    });
    window.$("#createShanpshot").click(() => {
      console.log("##");
      // download("test.png");
      var download = document.getElementById("download");
      var image = document
        .getElementById("canvas")
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      download.setAttribute("href", image);
    });

    window.$("#localFileBut").click(function () {
      window.$("#audioSelectWrapper").css("display", "none");

      var fileSelector = window.$(
        '<input type="file" accept="audio/*" multiple />'
      );

      fileSelector[0].onchange = function (event) {
        loadLocalFiles(fileSelector[0].files);
      };

      fileSelector.click();
    });

    function initPlayer() {
      audioContext = new AudioContext();

      presets = {};
      if (window.butterchurnPresets) {
        Object.assign(presets, window.butterchurnPresets.getPresets());
      }
      if (window.butterchurnPresetsExtra) {
        Object.assign(presets, window.butterchurnPresetsExtra.getPresets());
      }
      presets = window
        ._(presets)
        .toPairs()
        .sortBy(([k, v]) => k.toLowerCase())
        .fromPairs()
        .value();
      presetKeys = window._.keys(presets);
      presetIndex = Math.floor(Math.random() * presetKeys.length);

      var presetSelect = document.getElementById("presetSelect");
      for (var i = 0; i < presetKeys.length; i++) {
        var opt = document.createElement("option");
        opt.innerHTML =
          presetKeys[i].substring(0, maxPresetLabelLength) +
          (presetKeys[i].length > maxPresetLabelLength ? "..." : "");
        opt.value = i;
        presetSelect.appendChild(opt);
      }

      visualizer = window.butterchurn.default.createVisualizer(
        audioContext,
        canvas,
        {
          width: canvasWidth,
          height: canvasHight,
          pixelRatio: window.devicePixelRatio || 1,
          textureRatio: 1,
        }
      );
      nextPreset(0);
      cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength);
    }

    initPlayer();
  });
});
