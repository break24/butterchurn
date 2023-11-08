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
    function nextPreset(blendTime = 5.7) {
      presetIndexHist.push(presetIndex);

      var numPresets = presetKeys.length;
      if (presetRandom) {
        presetIndex = Math.floor(Math.random() * presetKeys.length);
      } else {
        presetIndex = (presetIndex + 1) % numPresets;
      }
      setPreset(blendTime);
    }

    function prevPreset(blendTime = 5.7) {
      var numPresets = presetKeys.length;
      if (presetIndexHist.length > 0) {
        presetIndex = presetIndexHist.pop();
      } else {
        presetIndex = (presetIndex - 1 + numPresets) % numPresets;
      }
      setPreset(blendTime);
    }

    const setPreset = (blendTime) => {
      document.title = presetKeys[presetIndex];
      visualizer.loadPreset(presets[presetKeys[presetIndex]], blendTime);

      // console.log(presets[presetKeys[presetIndex]]);

      window.$("#presetSelect").val(presetIndex);
    };

    function restartCycleInterval() {
      if (cycleInterval) {
        clearInterval(cycleInterval);
        cycleInterval = null;
      }

      if (presetCycle) {
        cycleInterval = setInterval(() => nextPreset(2.7), presetCycleLength);
      }
    }
    window.$("#presetSelect").change((evt) => {
      presetIndexHist.push(presetIndex);
      presetIndex = parseInt(window.$("#presetSelect").val());

      setPreset(5.7);
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
    //#endregion

    //#region keys
    window.$(document).keydown((e) => {
      if (e.which === 32 || e.which === 39) {
        nextPreset();
      } else if (e.which === 8 || e.which === 37) {
        prevPreset();
      } else if (e.which === 72) {
        nextPreset(0);
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

      const testPreset = {
        baseVals: {
          rating: 5,
          gammaadj: 1.998,
          echo_zoom: 1.421,
          wave_mode: 1,
          additivewave: 1,
          modwavealphabyvolume: 1,
          darken_center: 1,
          wave_a: 1.193,
          wave_scale: 1.489,
          wave_smoothing: 0,
          wave_mystery: -0.4,
          modwavealphastart: 0.87,
          modwavealphaend: 1.09,
          warpanimspeed: 1.348,
          warpscale: 1.16,
          zoom: 1.002,
          warp: 0.08979,
          wave_r: 0.5,
          wave_g: 0.5,
          wave_b: 0.5,
          wave_x: 0.6,
          mv_a: 0,
        },
        comp: " shader_body { \n  vec4 tmpvar_1;\n  tmpvar_1.w = 1.0;\n  tmpvar_1.xyz = ((texture (sampler_main, uv).xyz * 0.8) + ((\n    (texture (sampler_blur1, uv).xyz * scale1)\n   + bias1) * 0.7));\n  ret = tmpvar_1.xyz;\n }",
        comp_hlsl:
          "shader_body      \n{\n    ret = tex2D(sampler_main, uv).xyz;\n//ret = ret*2 - GetBlur1(uv);\n    ret = ret*0.8 + GetBlur1(uv)*0.7;\n    //ret *= float3(0.7,1.1,1.5);\n    //ret = lum(ret);\n    \n}",
        frame_eqs_eel:
          "wave_r = wave_r + 0.650*( 0.60*sin(1.437*time) + 0.40*sin(0.970*time) );\nwave_g = wave_g + 0.650*( 0.60*sin(1.344*time) + 0.40*sin(0.841*time) );\nwave_b = wave_b + 0.650*( 0.60*sin(1.251*time) + 0.40*sin(1.055*time) );\n//wave_mystery = time*0.3;\nrot = rot + 0.02*( 0.60*sin(0.181*time) + 0.09*sin(-0.279*time) );\nzoom = zoom + 0.025*( 0.60*sin(0.3131*time+2) + 0.4*sin(-0.479*time+4) );\n//cx = cx + 0.10*( 0.60*sin(0.374*time) + 0.10*sin(0.294*time) );\n//cy = cy + 0.10*( 0.60*sin(0.393*time) + 0.10*sin(0.223*time) );\n//dx = dx + 0.0040*( 0.60*sin(0.234*time) + 0.40*sin(0.277*time) );\n//dy = dy + 0.0040*( 0.60*sin(0.284*time) + 0.40*sin(0.247*time) );\ndecay = decay - 0.01*equal(frame%6,0);\n\n//wave_x = 0.1 + rand(80)*0.01;\n//wave_y = 0.1 + rand(80)*0.01;\nt2 = time*6;\nwave_x = 0.5 + 0.2*( 0.60*sin(0.374*t2) + 0.40*sin(0.294*t2) );\nwave_y = 0.5 + 0.2*( 0.60*sin(0.393*t2) + 0.40*sin(0.223*t2) );",
        frame_eqs_str:
          "a.wave_r+=.65*(.6*Math.sin(1.437*a.time)+.4*Math.sin(.97*a.time));a.wave_g+=.65*(.6*Math.sin(1.344*a.time)+.4*Math.sin(.841*a.time));a.wave_b+=.65*(.6*Math.sin(1.251*a.time)+.4*Math.sin(1.055*a.time));a.rot+=.02*(.6*Math.sin(.181*a.time)+.09*Math.sin(-.279*a.time));a.zoom+=.025*(.6*Math.sin(.3131*a.time+2)+.4*Math.sin(-.479*a.time+4));a.decay-=.01*equal(mod(a.frame,6),0);a.t2=6*a.time;a.wave_x=.5+.2*(.6*Math.sin(.374*a.t2)+.4*Math.sin(.294*a.t2));a.wave_y=.5+.2*(.6*Math.sin(.393*a.t2)+.4*Math.sin(.223*a.t2));",
        init_eqs_eel: "",
        init_eqs_str: "a.t2=0;",
        meta: {
          presetName: "_Geiss - Artifact 03",
        },
        pixel_eqs_eel:
          "dx = 0;\ndy = 0;\ndx = dx + cos(y*29.37 - time*1.9) * 1.0/pixelsx * 2;\ndy = dy + cos(x*33.21 - time*1.7) * 1.0/pixelsy * 2;\ndx = dx + cos(y*77.55 - time*2.1) * 1.0/pixelsx * 1.5;\ndy = dy + cos(x*78.32 - time*2.4) * 1.0/pixelsy * 1.5;",
        pixel_eqs_str:
          "a.dx=0;a.dy=0;a.dx+=2*div(Math.cos(29.37*a.y-1.9*a.time),a.pixelsx);a.dy+=2*div(Math.cos(33.21*a.x-1.7*a.time),a.pixelsy);a.dx+=1.5*div(Math.cos(77.55*a.y-2.1*a.time),a.pixelsx);a.dy+=1.5*div(Math.cos(78.32*a.x-2.4*a.time),a.pixelsy);",
        shapes: [
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
          },
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
          },
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
          },
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
          },
        ],
        version: 2,
        warp: " shader_body { \n  vec2 dxy_1;\n  dxy_1.x = cos(((154.56 * uv_orig.y) - time));\n  dxy_1.y = cos(((154.56 * uv_orig.x) - time));\n  float tmpvar_2;\n  tmpvar_2 = (time * 5.0);\n  dxy_1.x = (dxy_1.x + cos((\n    (412.16 * uv_orig.y)\n   - tmpvar_2)));\n  dxy_1.y = (dxy_1.y + cos((\n    (412.16 * uv_orig.x)\n   - tmpvar_2)));\n  dxy_1.y = (dxy_1.y + 0.15);\n  vec4 tmpvar_3;\n  tmpvar_3.w = 1.0;\n  tmpvar_3.xyz = (max (texture (sampler_fw_main, (uv + \n    (dxy_1 * texsize.zw)\n  )).xyz, (texture (sampler_main, uv_orig).xyz * 0.8)) - 0.004);\n  ret = tmpvar_3.xyz;\n }",
        warp_hlsl:
          "shader_body\n{\n    float2 dxy = 0;\n\n    float f = 1.12;\n\n    //dxy.x = cos(uv_orig.y*18 - time);\n    //dxy.y = cos(uv_orig.x*18 - time);\n    dxy.x += cos(uv_orig.y*138*f - time);\n    dxy.y += cos(uv_orig.x*138*f - time);\n    dxy.x += cos(uv_orig.y*368*f - time*5);\n    dxy.y += cos(uv_orig.x*368*f - time*5);\n    dxy.y += 0.15;\n//dxy = 0;\n\n    // sample previous frame\n    ret = tex2D( sampler_fw_main, uv + dxy*texsize.zw*1 ).xyz;\n    //ret += (0.59-0.2*rad)*N.xyz;\n\n    //ret = saturate((ret-0.5)*3 + 0.25);\n    //ret.yz = ret.x;    \n    //ret = normalize(lerp(ret, ret.yzx, 0.1)) * 0.99;\n    //ret = ret*ret*(3 - 2*ret);\n\n    ret = max(ret, GetPixel(uv_orig).xyz*0.8);\n\n    ret -= 0.004;\n}",
        waves: [
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            point_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
            point_eqs_eel: "",
          },
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            point_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
            point_eqs_eel: "",
          },
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            point_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
            point_eqs_eel: "",
          },
          {
            baseVals: {
              enabled: 0,
            },
            init_eqs_str: "",
            frame_eqs_str: "",
            point_eqs_str: "",
            init_eqs_eel: "",
            frame_eqs_eel: "",
            point_eqs_eel: "",
          },
        ],
      };

      // download("preset.json", JSON.stringify(presets));
      presets["$$$ Royal - Mashup (177)"] = testPreset;
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

const download = (filename, text) => {
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
