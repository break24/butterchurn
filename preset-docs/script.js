import { testPreset } from "./modules/test.js";

addEventListener("DOMContentLoaded", (event) => {
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
    var canvas = document.getElementById("canvas");

    // defaults
    var presetCycle = false;
    var presetCycleLength = 15000;
    var blendTime = 2;
    var presetRandom = false;
    const canvasWidth = 1280;
    const canvasHight = 720;
    // const canvasWidth = 640;
    // const canvasHight = 360;
    let audioFiles = [];
    let timeoutId;

    // querystrng
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const presetIndexFromQueryString = urlParams.get("preset");

    var presetIndex = presetIndexFromQueryString
      ? parseInt(presetIndexFromQueryString) - 1
      : 0;

    const format = (value, digits) => {
      const nf = new Intl.NumberFormat("en-EN", {
        style: "decimal",
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      });
      return nf.format(value);
    };

    const formatSeconds = (seconds) => {
      const minutePart = Math.floor(seconds / 60);
      const secondPart = Math.floor(seconds % 60);
      return `${minutePart.toString().padStart(2, "0")}:${secondPart
        .toString()
        .padStart(2, "0")}`;
    };

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

    function loadLocalFiles(index = 0) {
      // console.trace();
      audioContext.resume();

      var file = audioFiles[index];
      var fileName = file.name.replace(".mp3", "");
      if (timeoutId) {
        // console.log(timeoutId);
        clearTimeout(timeoutId);
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        audioContext.decodeAudioData(event.target.result, (buf) => {
          playBufferSource(buf);

          const nowRunning = document.getElementById("now-running");
          nowRunning.innerHTML = `${fileName} ${formatSeconds(buf.duration)} `;

          // console.log(index, fileName, formatSeconds(buf.duration));

          timeoutId = setTimeout(() => {
            index = audioFiles.length > index + 1 ? index + 1 : 0;
            loadLocalFiles(index);
          }, buf.duration * 1000);
        });
      };

      reader.readAsArrayBuffer(file);
    }

    //#region set presets
    function nextPreset(blendTimePara) {
      const usedBlendTime =
        blendTimePara !== undefined ? blendTimePara : blendTime;
      presetIndexHist.push(presetIndex);

      var numPresets = presetKeys.length;
      if (presetRandom) {
        presetIndex = Math.floor(Math.random() * presetKeys.length);
      } else {
        presetIndex = (presetIndex + 1) % numPresets;
      }
      setPreset(usedBlendTime);
    }

    function prevPreset(blendTimePara) {
      const usedBlendTime =
        blendTimePara !== undefined ? blendTimePara : blendTime;

      presetIndexHist.push(presetIndex);
      var numPresets = presetKeys.length;
      if (presetIndexHist.length > 0) {
        presetIndex = presetIndexHist.pop();
      } else {
        presetIndex = (presetIndex - 1 + numPresets) % numPresets;
      }
      setPreset(usedBlendTime);
    }

    const setPreset = (blendTimePara) => {
      const usedBlendTime =
        blendTimePara !== undefined ? blendTimePara : blendTime;

      document.title = presetKeys[presetIndex];
      visualizer.loadPreset(presets[presetKeys[presetIndex]], usedBlendTime);

      // console.log(presets[presetKeys[presetIndex]]);

      window.$("#presetSelect").val(presetIndex);
    };

    function restartCycleInterval() {
      if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
      }

      if (presetCycle) {
        cycleInterval = setInterval(() => nextPreset(), presetCycleLength);
      }
    }

    function fullscreen() {
      const docEl = document.getElementById("canvas");
      if (!docEl) {
        return;
      }
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } // Careful to the capital S
      else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      } else if (docEl.webkitEnterFullscreen) {
        docEl.webkitEnterFullscreen();
      } // Magic is here for iOS
    }

    window.$("#presetSelect").change((evt) => {
      presetIndexHist.push(presetIndex);
      presetIndex = parseInt(window.$("#presetSelect").val());

      setPreset();
    });

    window.$("#presetCycle").change(() => {
      presetCycle = window.$("#presetCycle").is(":checked");
      restartCycleInterval();
    });

    window.$("#presetCycleLength").change((evt) => {
      if (presetCycle) {
        presetCycleLength = parseInt(
          window.$("#presetCycleLength").val() * 1000
        );
        restartCycleInterval();
      }
    });

    window.$("#presetRandom").change(() => {
      presetRandom = window.$("#presetRandom").is(":checked");
    });

    window.$("#canvas").dblclick(() => {
      fullscreen();
    });

    window.$("#blendTimeId").change((evt) => {
      blendTime = parseInt(window.$("#blendTimeId").val());
    });

    //#endregion

    //#region keys
    window.$(document).keydown((e) => {
      if (e.which === 32 || e.which === 39) {
        nextPreset();
      } else if (e.which === 8 || e.which === 37) {
        prevPreset();
      } else if (e.which === 72) {
        nextPreset(0);
      } else if (e.which === 13) {
        fullscreen();
      }
    });
    //#endregion

    //#region snapshot
    window.$("#createSnapshot").click(() => {
      const filename = presetKeys[presetIndex].replace(
        /^[a-zA-Z0-9](?:[a-zA-Z0-9 ._-]*[a-zA-Z0-9])?\.[a-zA-Z0-9_-]+$/g,
        "_"
      );

      var download = document.getElementById("download");
      var image = document
        .getElementById("canvas")
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");

      download.setAttribute("href", image);
      download.setAttribute("download", `${filename}.png`);
    });

    //#endregion

    window.$("#localFileBut").click(function () {
      var fileSelector = window.$(
        '<input type="file" accept="audio/*" multiple />'
      );

      fileSelector[0].onchange = function (event) {
        audioFiles = Array.from(fileSelector[0].files);
        const audioSelectEl = document.getElementById("audio-select");
        audioSelectEl.innerHTML = "";
        audioFiles.forEach((file, index) => {
          const optionEl = document.createElement("option");
          optionEl.value = index;
          optionEl.innerText = `${file.name.replace(".mp3", "")} ${format(
            file.size / 1000000,
            2
          )}`;
          audioSelectEl.appendChild(optionEl);
        });
        audioSelectEl.addEventListener("change", (event) => {
          loadLocalFiles(parseInt(event.target.selectedOptions[0].value, 10));
        });

        loadLocalFiles();
      };

      fileSelector.click();
    });

    function initPlayer() {
      audioContext = new AudioContext();

      presets = {};
      // const presetKey = "butterchurnPresets";
      // const presetKey = "butterchurnPresetsExtra";
      // const presetKey = "imageButterchurnPresets";
      const presetKey = "baseButterchurnPresets";
      if (window[presetKey]) {
        Object.assign(presets, window[presetKey].default);
      }
      presets = window
        ._(presets)
        .toPairs()
        .sortBy(([k, v]) => k.toLowerCase())
        .fromPairs()
        .value();

      presets["TestPreset"] = testPreset;
      presetKeys = Object.keys(presets);
      var presetSelect = document.getElementById("presetSelect");

      const length = presetKeys.length;
      for (var i = 0; i < presetKeys.length; i++) {
        var opt = document.createElement("option");
        opt.innerHTML = `${i + 1}/${length} ${presetKeys[i]}`;
        opt.value = i;
        if (i === presetIndex) {
          opt.selected = true;
        }
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

      // presetIndex = Math.floor(Math.random() * presetKeys.length);
      setPreset();
      document.title = presetKeys[0];
    }

    initPlayer();
  });
});

const downloadText = (filename, text) => {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);

  element.style.display = "none";
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};
