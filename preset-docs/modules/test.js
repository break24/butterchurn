export const testPreset = {
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