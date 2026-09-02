(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,267366,e=>{"use strict";let t=(0,e.i(514514).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",()=>t],267366)},491385,e=>{"use strict";let t=(0,e.i(514514).default)("map-pin",[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]);e.s(["MapPin",()=>t],491385)},310305,914969,470655,e=>{"use strict";var t=e.i(718439),r=e.i(809858),s=e.i(912840),n=e.i(235044),n=n;let a=e=>e===Object(e)&&!Array.isArray(e)&&"function"!=typeof e;function i(e,i){let o=(0,s.useThree)(e=>e.gl),l=(0,n.G)(r.TextureLoader,a(e)?Object.values(e):e);return(0,t.useLayoutEffect)(()=>{null==i||i(l)},[i]),(0,t.useEffect)(()=>{if("initTexture"in o){let e=[];Array.isArray(l)?e=l:l instanceof r.Texture?e=[l]:a(l)&&(e=Object.values(l)),e.forEach(e=>{e instanceof r.Texture&&o.initTexture(e)})}},[o,l]),(0,t.useMemo)(()=>{if(!a(e))return l;{let t={},r=0;for(let s in e)t[s]=l[r++];return t}},[e,l])}i.preload=e=>n.G.preload(r.TextureLoader,e),i.clear=e=>n.G.clear(r.TextureLoader,e),e.s(["useTexture",()=>i],310305);var o=r;function l(e,t,r,s){var n;return(n=class extends o.ShaderMaterial{constructor(n){for(const s in super({vertexShader:t,fragmentShader:r,...n}),e)this.uniforms[s]=new o.Uniform(e[s]),Object.defineProperty(this,s,{get(){return this.uniforms[s].value},set(e){this.uniforms[s].value=e}});this.uniforms=o.UniformsUtils.clone(this.uniforms),null==s||s(this)}}).key=o.MathUtils.generateUUID(),n}e.s(["shaderMaterial",()=>l],914969);var c=e.i(608827);let d=`
uniform vec2 uPlaneRes;
uniform vec2 uMediaRes1;
uniform vec2 uMediaRes2;
uniform vec2 uMediaRes3;
uniform vec2 uCanvasRes;
uniform vec2 uMouse2D;
uniform sampler2D tMap1;
uniform sampler2D tMap2;
uniform sampler2D tMap3;
uniform float uTime;
uniform float uTransitionProgress;
uniform float uHoverProgress;
uniform float uNausea; // Nausea intensity (0.0 to 1.0)
uniform float uIsNight; // 0.0 for day, 1.0 for night
uniform float uVar1;
uniform float uVar2;
uniform float uVar3;

varying vec2 vUv;

#define PI 3.14159265359

vec2 getUvs(vec2 planeRes, vec2 mediaRes, vec2 uv) {
    vec2 ratio = vec2(
        min((planeRes.x / planeRes.y) / (mediaRes.x / mediaRes.y), 1.0),
        min((planeRes.y / planeRes.x) / (mediaRes.y / mediaRes.x), 1.0)
    );
    vec2 finalUv = vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    return finalUv;
}

float parabola( float x, float k ) {
    return pow( 4. * x * ( 1. - x ), k );
}

vec2 mirrored(vec2 v) {
    vec2 m = mod(v,2.0);
    return mix(m, 2.0-m, step(1.0, m));
}

//https://www.shadertoy.com/view/ldfSDj
float udRoundBox( vec2 p, vec2 b, float r ){
    return length(max(abs(p)-b+r,0.0))-r;
}
float roundCorners(vec2 planeRes, vec2 uv, float radius) {
    float iRadius = min(planeRes.x, planeRes.y) * radius;
    vec2 halfRes = 0.5 * planeRes.xy;
    float b = udRoundBox( (uv * planeRes) - halfRes, halfRes, iRadius );
    return clamp(1.0 - b, 0.0, 1.0);
}

float tri(float v) {
    return mix(v, 1.0 - v, step(0.5, v)) * 2.0;
}

float remap01 (float a, float b, float t){
    return (t-a) / (b-a);
}

float remap(float a, float b, float c, float d, float t){
    return remap01(a, b, t) * (d-c) + c;
}

float paintCircle (vec2 uv, vec2 center, float rad, float width, float distortion) {
    vec2 diff = center-uv;
    float len = length(diff);

    float circle = smoothstep(rad-width, rad, len - distortion) ;
    return circle;
}

//Avener Random FBM
mat2 rot2d (in float angle) {
        return mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
}

float r(in float a, in float b) { return fract(sin(dot(vec2(a, b), vec2(12.9898, 78.233))) * 43758.5453); }
float h(in float a) { return fract(sin(dot(a, dot(12.9898, 78.233))) * 43758.5453); }

float noise(in vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float n = p.x + p.y * 57.0 + 113.0 * p.z;
    return mix(mix(mix(h(n + 0.0), h(n + 1.0), f.x),
        mix(h(n + 57.0), h(n + 58.0), f.x), f.y),
    mix(mix(h(n + 113.0), h(n + 114.0), f.x),
        mix(h(n + 170.0), h(n + 171.0), f.x), f.y), f.z);
}

// http://www.iquilezles.org/www/articles/morenoise/morenoise.htm
// http://www.pouet.net/topic.php?post=401468
vec3 dnoise2f(in vec2 p) {
    float i = floor(p.x), j = floor(p.y);
    float u = p.x - i, v = p.y - j;
    float du = 30. * u * u * (u * (u - 2.) + 1.);
    float dv = 30. * v * v * (v * (v - 2.) + 1.);
    u = u * u * u * (u * (u * 6. - 15.) + 10.);
    v = v * v * v * (v * (v * 6. - 15.) + 10.);
    float a = r(i, j);
    float b = r(i + 1.0, j);
    float c = r(i, j + 1.0);
    float d = r(i + 1.0, j + 1.0);
    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k3 = a - b - c + d;
    return vec3(k0 + k1 * u + k2 * v + k3 * u * v,
    du * (k1 + k3 * v),
    dv * (k2 + k3 * u));
}

float fbm(in vec2 uv) {
    vec2 p = uv;
    float f, dx, dz, w = 0.5;
    f = dx = dz = 0.0;
    for (int i = 0; i < 3; ++i) {
    vec3 n = dnoise2f(uv);
    dx += n.y;
    dz += n.z;
    f += w * n.x / (1.0 + dx * dx + dz * dz);
    w *= 0.86;
    uv *= vec2(1.36);
    uv *= rot2d(1.25 * noise(vec3(p * 0.1, 0.12 * uTime)) +
        0.75 * noise(vec3(p * 0.1, 0.20 * uTime)));
    }
    return f;
}

float fbmLow(in vec2 uv) {
    float f, dx, dz, w = 0.5;
    f = dx = dz = 0.0;
    for (int i = 0; i < 3; ++i) {
    vec3 n = dnoise2f(uv);
    dx += n.y;
    dz += n.z;
    f += w * n.x / (1.0 + dx * dx + dz * dz);
    w *= 0.95;
    uv *= vec2(3);
    }
    return f;
}


vec2 zoom (in vec2 uv_1, in float zoom) {
    return (uv_1 - vec2(0.5)) / vec2(zoom) + vec2(0.5);
}

// Noise functions included above...

void main() {
    vec2 uv = vUv;

    // --- NAUSEA EFFECT START ---
    if (uNausea > 0.0) {
        float freq = 3.0; // Wobbly frequency
        float amp = 0.05 * uNausea; // Amplitude scales with nausea intensity
        float timeScale = uTime * 2.0;
        
        uv.x += sin(uv.y * freq + timeScale) * amp;
        uv.y += cos(uv.x * freq + timeScale) * amp;
    }
    // --- NAUSEA EFFECT END ---

    float progress = uTransitionProgress;
    vec4 finalColor;

    if (progress <= 0.0) {
        // Fully above water
        vec2 uv1 = getUvs(uPlaneRes, uMediaRes1, uv);
        finalColor = texture2D(tMap1, uv1);
    } else if (progress >= 1.0) {
        // Fully underwater
        vec2 uv2 = getUvs(uPlaneRes, uMediaRes2, uv);
        vec4 tex2 = texture2D(tMap2, uv2);

        // Underwater color correction (blulish tint and darkness)
        tex2.rgb *= vec3(0.9, 0.95, 1.0); 

        // --- NIGHT MODE TINT ---
        if(uIsNight > 0.0) {
            vec3 nightTint = vec3(0.2, 0.3, 0.6); 
            tex2.rgb = mix(tex2.rgb, tex2.rgb * nightTint * 1.5, uIsNight * 0.8);
        }

        finalColor = tex2;

        float depth = smoothstep(0.8, 0.0, uv.y);
        finalColor.rgb *= 1.0 - (depth * 0.2);
    } else {
        // In Transition
        vec2 uv1 = getUvs(uPlaneRes, uMediaRes1, uv);
        vec2 uv2 = getUvs(uPlaneRes, uMediaRes2, uv);
        
        // Create a wavy water surface line
        float level = mix(-0.1, 1.7, progress); 

        // Wave distortion
        float wave = sin(uv.x * 10.0 + uTime * 2.0) * 0.02;
        wave += sin(uv.x * 23.0 - uTime * 3.5) * 0.01;
        wave += noise(vec3(uv.x * 5.0, uTime, 0.0)) * 0.02;

        float surfaceY = level + wave;

        // Soft edge for the water surface
        float mixVal = smoothstep(surfaceY + 0.01, surfaceY - 0.01, uv.y);

        // Distortion near surface (refraction)
        float distortStrength = smoothstep(0.1, 0.0, abs(uv.y - surfaceY)) * 0.05;
        vec2 distortedUv2 = uv2 + vec2(
            sin(uv.y * 50.0 + uTime) * distortStrength, 
            cos(uv.x * 50.0 + uTime) * distortStrength
        );

        vec4 tex1 = texture2D(tMap1, uv1);
        vec4 tex2 = texture2D(tMap2, distortedUv2);

        // Underwater color correction (blulish tint and darkness)
        tex2.rgb *= vec3(0.9, 0.95, 1.0); 

        // --- NIGHT MODE TINT ---
        if(uIsNight > 0.0) {
            vec3 nightTint = vec3(0.2, 0.3, 0.6); 
            tex2.rgb = mix(tex2.rgb, tex2.rgb * nightTint * 1.5, uIsNight * 0.8);
        }

        // Final mix
        finalColor = mix(tex1, tex2, clamp(mixVal, 0.0, 1.0));

        // Deep ocean darkness at bottom when fully submerged
        float depth = smoothstep(0.8, 0.0, uv.y);
        float darkStrength = smoothstep(0.8, 1.0, progress);
        finalColor.rgb *= 1.0 - (depth * 0.2 * darkStrength);
    }

    // --- NAUSEA PURPLE TINT START ---
    if (uNausea > 0.0) {
        vec3 portalColor = vec3(0.35, 0.05, 0.6); 
        float pulse = 0.8 + 0.2 * sin(uTime * 4.0);
        finalColor.rgb = mix(finalColor.rgb, portalColor, uNausea * 0.6 * pulse);
        
        float dist = length(vUv - 0.5);
        finalColor.rgb *= 1.0 - (dist * 0.8 * uNausea);
    }
    // --- NAUSEA PURPLE TINT END ---

    gl_FragColor = finalColor;
}
`,u=`
varying vec2 vUv;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
}
`,f=l({uTime:0,uTransitionProgress:0,uHoverProgress:0,uVar1:0,uVar2:0,uVar3:0,uPlaneRes:new r.Vector2(1,1),uMediaRes1:new r.Vector2(1,1),uMediaRes2:new r.Vector2(1,1),uCanvasRes:new r.Vector2(1,1),uMouse2D:new r.Vector2(0,0),tMap1:null,tMap2:null,tMap3:null,uNausea:0,uIsNight:0},u,d);(0,c.extend)({TransitionMaterial:f}),e.s(["TransitionMaterial",0,f],470655)},374789,(e,t,r)=>{},881927,(e,t,r)=>{var s=e.i(866541);e.r(374789);var n=e.r(718439),a=n&&"object"==typeof n&&"default"in n?n:{default:n},i=void 0!==s.default&&s.default.env&&!0,o=function(e){return"[object String]"===Object.prototype.toString.call(e)},l=function(){function e(e){var t=void 0===e?{}:e,r=t.name,s=void 0===r?"stylesheet":r,n=t.optimizeForSpeed,a=void 0===n?i:n;c(o(s),"`name` must be a string"),this._name=s,this._deletedRulePlaceholder="#"+s+"-deleted-rule____{}",c("boolean"==typeof a,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=a,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var l="undefined"!=typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=l?l.getAttribute("content"):null}var t,r=e.prototype;return r.setOptimizeForSpeed=function(e){c("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),c(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},r.isOptimizeForSpeed=function(){return this._optimizeForSpeed},r.inject=function(){var e=this;if(c(!this._injected,"sheet already injected"),this._injected=!0,"undefined"!=typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(i||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,r){return"number"==typeof r?e._serverSheet.cssRules[r]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),r},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},r.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},r.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},r.insertRule=function(e,t){if(c(o(e),"`insertRule` accepts only strings"),"undefined"==typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var r=this.getSheet();"number"!=typeof t&&(t=r.cssRules.length);try{r.insertRule(e,t)}catch(t){return i||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var s=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,s))}return this._rulesCount++},r.replaceRule=function(e,t){if(this._optimizeForSpeed||"undefined"==typeof window){var r="undefined"!=typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!r.cssRules[e])return e;r.deleteRule(e);try{r.insertRule(t,e)}catch(s){i||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),r.insertRule(this._deletedRulePlaceholder,e)}}else{var s=this._tags[e];c(s,"old rule at index `"+e+"` not found"),s.textContent=t}return e},r.deleteRule=function(e){if("undefined"==typeof window)return void this._serverSheet.deleteRule(e);if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];c(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},r.flush=function(){this._injected=!1,this._rulesCount=0,"undefined"!=typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},r.cssRules=function(){var e=this;return"undefined"==typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,r){return r?t=t.concat(Array.prototype.map.call(e.getSheetForTag(r).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},r.makeStyleTag=function(e,t,r){t&&c(o(t),"makeStyleTag accepts only strings as second parameter");var s=document.createElement("style");this._nonce&&s.setAttribute("nonce",this._nonce),s.type="text/css",s.setAttribute("data-"+e,""),t&&s.appendChild(document.createTextNode(t));var n=document.head||document.getElementsByTagName("head")[0];return r?n.insertBefore(s,r):n.appendChild(s),s},t=[{key:"length",get:function(){return this._rulesCount}}],function(e,t){for(var r=0;r<t.length;r++){var s=t[r];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}(e.prototype,t),e}();function c(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var d=function(e){for(var t=5381,r=e.length;r;)t=33*t^e.charCodeAt(--r);return t>>>0},u={};function f(e,t){if(!t)return"jsx-"+e;var r=String(t),s=e+r;return u[s]||(u[s]="jsx-"+d(e+"-"+r)),u[s]}function h(e,t){"undefined"==typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var r=e+t;return u[r]||(u[r]=t.replace(/__jsx-style-dynamic-selector/g,e)),u[r]}var m=function(){function e(e){var t=void 0===e?{}:e,r=t.styleSheet,s=void 0===r?null:r,n=t.optimizeForSpeed,a=void 0!==n&&n;this._sheet=s||new l({name:"styled-jsx",optimizeForSpeed:a}),this._sheet.inject(),s&&"boolean"==typeof a&&(this._sheet.setOptimizeForSpeed(a),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"undefined"==typeof window||this._fromServer||(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var r=this.getIdAndRules(e),s=r.styleId,n=r.rules;if(s in this._instancesCounts){this._instancesCounts[s]+=1;return}var a=n.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[s]=a,this._instancesCounts[s]=1},t.remove=function(e){var t=this,r=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(r in this._instancesCounts,"styleId: `"+r+"` not found"),this._instancesCounts[r]-=1,this._instancesCounts[r]<1){var s=this._fromServer&&this._fromServer[r];s?(s.parentNode.removeChild(s),delete this._fromServer[r]):(this._indices[r].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[r]),delete this._instancesCounts[r]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],r=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return r[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,r;return t=this.cssRules(),void 0===(r=e)&&(r={}),t.map(function(e){var t=e[0],s=e[1];return a.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:r.nonce?r.nonce:void 0,dangerouslySetInnerHTML:{__html:s}})})},t.getIdAndRules=function(e){var t=e.children,r=e.dynamic,s=e.id;if(r){var n=f(s,r);return{styleId:n,rules:Array.isArray(t)?t.map(function(e){return h(n,e)}):[h(n,t)]}}return{styleId:f(s),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),p=n.createContext(null);function v(){return new m}function x(){return n.useContext(p)}p.displayName="StyleSheetContext";var b=a.default.useInsertionEffect||a.default.useLayoutEffect,g="undefined"!=typeof window?v():void 0;function y(e){var t=g||x();return t&&("undefined"==typeof window?t.add(e):b(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}y.dynamic=function(e){return e.map(function(e){return f(e[0],e[1])}).join(" ")},r.StyleRegistry=function(e){var t=e.registry,r=e.children,s=n.useContext(p),i=n.useState(function(){return s||t||v()})[0];return a.default.createElement(p.Provider,{value:i},r)},r.createStyleRegistry=v,r.style=y,r.useStyleRegistry=x},750755,(e,t,r)=>{t.exports=e.r(881927).style},107983,(e,t,r)=>{"use strict";var s=e.r(718439),n="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},a=s.useState,i=s.useEffect,o=s.useLayoutEffect,l=s.useDebugValue;function c(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!n(e,r)}catch(e){return!0}}var d="undefined"==typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var r=t(),s=a({inst:{value:r,getSnapshot:t}}),n=s[0].inst,d=s[1];return o(function(){n.value=r,n.getSnapshot=t,c(n)&&d({inst:n})},[e,r,t]),i(function(){return c(n)&&d({inst:n}),e(function(){c(n)&&d({inst:n})})},[e]),l(r),r};r.useSyncExternalStore=void 0!==s.useSyncExternalStore?s.useSyncExternalStore:d},33347,(e,t,r)=>{"use strict";t.exports=e.r(107983)},683842,(e,t,r)=>{"use strict";var s=e.r(718439),n=e.r(33347),a="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},i=n.useSyncExternalStore,o=s.useRef,l=s.useEffect,c=s.useMemo,d=s.useDebugValue;r.useSyncExternalStoreWithSelector=function(e,t,r,s,n){var u=o(null);if(null===u.current){var f={hasValue:!1,value:null};u.current=f}else f=u.current;var h=i(e,(u=c(function(){function e(e){if(!l){if(l=!0,i=e,e=s(e),void 0!==n&&f.hasValue){var t=f.value;if(n(t,e))return o=t}return o=e}if(t=o,a(i,e))return t;var r=s(e);return void 0!==n&&n(t,r)?(i=e,t):(i=e,o=r)}var i,o,l=!1,c=void 0===r?null:r;return[function(){return e(t())},null===c?void 0:function(){return e(c())}]},[t,r,s,n]))[0],u[1]);return l(function(){f.hasValue=!0,f.value=h},[h]),d(h),h}},551165,(e,t,r)=>{"use strict";t.exports=e.r(683842)},7284,e=>{"use strict";function t(){for(var e,t,r=0,s="",n=arguments.length;r<n;r++)(e=arguments[r])&&(t=function e(t){var r,s,n="";if("string"==typeof t||"number"==typeof t)n+=t;else if("object"==typeof t)if(Array.isArray(t)){var a=t.length;for(r=0;r<a;r++)t[r]&&(s=e(t[r]))&&(n&&(n+=" "),n+=s)}else for(s in t)t[s]&&(n&&(n+=" "),n+=s);return n}(e))&&(s&&(s+=" "),s+=t);return s}e.s(["clsx",()=>t,"default",0,t])},934082,e=>{"use strict";let t=(0,e.i(514514).default)("instagram",[["rect",{width:"20",height:"20",x:"2",y:"2",rx:"5",ry:"5",key:"2e1cvw"}],["path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",key:"9exkf1"}],["line",{x1:"17.5",x2:"17.51",y1:"6.5",y2:"6.5",key:"r4j83e"}]]);e.s(["Instagram",()=>t],934082)},626191,e=>{"use strict";let t=(0,e.i(514514).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",()=>t],626191)},149931,e=>{"use strict";let t=(0,e.i(514514).default)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]);e.s(["LogOut",()=>t],149931)},862204,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var s={callServer:function(){return a.callServer},createServerReference:function(){return o.createServerReference},findSourceMapURL:function(){return i.findSourceMapURL}};for(var n in s)Object.defineProperty(r,n,{enumerable:!0,get:s[n]});let a=e.r(600860),i=e.r(867320),o=e.r(293929)},685119,e=>{"use strict";var t=e.i(862204),r=(0,t.createServerReference)("40cc9ed6c280cb7b2d0422338aaff460b52167eeae",t.callServer,void 0,t.findSourceMapURL,"signOutOfGitHub");e.s(["signOutOfGitHub",()=>r])},635514,e=>{"use strict";var t=e.i(670931),r=e.i(934082),s=e.i(626191),n=e.i(173615),a=e.i(399439),i=e.i(602627);let o=[{link:"https://www.instagram.com/hackfest.dev",icon:(0,t.jsx)(r.Instagram,{className:"h-6 w-6 transition-colors"}),name:"Instagram"},{link:"mailto:admin@hackfest.dev",icon:(0,t.jsx)(s.Mail,{className:"h-6 w-6 transition-colors"}),name:"E-mail"}];e.s(["default",0,({overlayNeeded:e=!1})=>{let{isNight:r}=(0,i.useDayNight)();return(0,t.jsxs)("footer",{className:"relative z-20 w-full flex flex-col",children:[(0,t.jsx)("div",{className:"relative h-45 w-full overflow-hidden pointer-events-none",children:(0,t.jsx)("div",{className:"absolute inset-0 z-10 bg-transparent bg-[url('/images/corals_cropped.png')] bg-repeat-x bg-size-[auto_100%] bg-top-left pointer-events-none transition-all duration-1000",style:{filter:r?"brightness(0.5) saturate(0.8) sepia(0.2) hue-rotate(180deg)":"brightness(0.6) saturate(0.8) hue-rotate(-5deg) contrast(1.0)"}})}),(0,t.jsxs)("div",{className:`relative z-20 w-full flex-col overflow-hidden border-t transition-colors duration-1000 bg-linear-to-b md:backdrop-blur-md ${r?"border-sky-900/40 from-[#0f2a3f] via-[#091a2a] to-[#040e1a]":"border-sky-300/40 from-[#8e8071] via-[#6b5e50] to-[#42392f]"}`,children:[(0,t.jsx)("div",{className:`${e?"hidden md:block":"hidden"} absolute inset-0 pointer-events-none z-0 mix-blend-overlay transition-opacity duration-1000`,style:{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"}}),(0,t.jsxs)("div",{className:"relative z-10 flex h-full flex-col items-center justify-evenly space-y-12 p-4 py-8 lg:flex-row",children:[(0,t.jsx)("div",{className:`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-linear-to-r from-transparent to-transparent blur-sm transition-colors duration-1000 ${r?"via-sky-600/50":"via-amber-300/60"}`}),(0,t.jsxs)("div",{className:"flex flex-col items-center gap-8 z-10",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center gap-4 transition-all duration-1000",children:[(0,t.jsxs)("div",{className:"flex flex-row items-center justify-center gap-6",children:[(0,t.jsx)(a.default,{href:"/",className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(n.default,{src:"/logo.webp",priority:!0,alt:"Logo - Hackfest",width:95,height:50,className:`transition-all duration-1000 ${r?"drop-shadow-[0_0_15px_rgba(2,132,199,0.6)]":"drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"}`})}),(0,t.jsx)(a.default,{href:"https://finiteloop.club/",target:"_blank",className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(n.default,{src:"/logos/flc_logo_crop.png",priority:!0,alt:"Logo - Finite Loop Club",width:75,height:50,className:"opacity-85 hover:opacity-100 transition-all duration-1000"})})]}),(0,t.jsx)(a.default,{href:"https://nitte.edu.in/nmamit/",target:"_blank",className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(n.default,{src:"/logos/NMAMITLogo.png",priority:!0,alt:"Logo - NMAMIT",width:180,height:100,className:"opacity-85 hover:opacity-100 transition-all duration-1000",style:{filter:r?"brightness(0) invert(1) opacity(0.8)":"brightness(0) invert(1) opacity(0.95)"}})})]}),(0,t.jsxs)("div",{className:"flex flex-col items-center gap-4 md:gap-4",children:[(0,t.jsx)("p",{className:`text-base font-medium transition-colors duration-1000 ${r?"text-stone-300":"text-amber-50"}`,children:"Connect with us:"}),(0,t.jsx)("ul",{className:"flex gap-6 md:gap-6",children:o.map(e=>(0,t.jsx)("li",{className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(a.default,{href:e.link,className:`block text-2xl transition-all duration-1000 hover:scale-110 ${r?"text-sky-400 hover:text-sky-300":"text-amber-100 hover:text-white"}`,target:e.link.startsWith("mailto:")?void 0:"_blank",children:e.icon})},e.name))})]})]}),(0,t.jsxs)("div",{className:"flex flex-col items-center gap-8 z-10",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center gap-10 md:flex-row",children:[(0,t.jsx)("div",{"data-lenis-prevent":!0,className:`overflow-hidden rounded-lg border transition-colors duration-1000 relative z-30 ${r?"border-sky-800/40 shadow-[0_0_15px_rgba(2,132,199,0.15)]":"border-amber-600/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]"}`,style:{touchAction:"auto",overscrollBehavior:"contain"},onWheel:e=>e.stopPropagation(),onTouchStart:e=>e.stopPropagation(),onTouchMove:e=>e.stopPropagation(),onPointerDown:e=>e.stopPropagation(),children:(0,t.jsx)("iframe",{title:"Maps",src:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15538.662520521424!2d74.93399100000002!3d13.18347!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbb56415ad85e5b%3A0x10b77ac6f6afc7fa!2sNitte%20Mahalinga%20Adyantaya%20Memorial%20Institute%20of%20Technology%20-%20NMAMIT!5e0!3m2!1sen!2sin!4v1771872967031!5m2!1sen!2sin",width:"250",height:"180",style:{border:0,touchAction:"auto",pointerEvents:"auto"},className:`relative z-30 filter transition-all duration-1000 ${r?"sepia-0 grayscale opacity-80 hover:opacity-100 hover:grayscale-50":"sepia-[0.3] hue-rotate-15 saturate-[0.9] hover:sepia-0 hover:saturate-100"}`,"aria-hidden":"false",loading:"lazy",allowFullScreen:!0})}),(0,t.jsxs)("div",{className:"flex flex-col gap-2 text-center",children:[(0,t.jsx)("p",{className:`text-lg font-bold transition-colors duration-1000 ${r?"text-sky-300":"text-amber-100"}`,children:"NMAM Institute of Technology, Nitte"}),(0,t.jsx)("p",{className:`text-sm font-medium transition-colors duration-1000 ${r?"text-stone-400":"text-amber-50/80"}`,children:"Karkala, Udupi District, Karnataka"})]})]}),(0,t.jsxs)("p",{className:`text-center text-base font-medium transition-colors duration-1000 ${r?"text-stone-300":"text-amber-50/90"}`,children:["Interested to sponsor? Let us know"," ",(0,t.jsx)(a.default,{href:"mailto:sponsor@hackfest.dev",className:`relative z-50 pointer-events-auto underline font-bold transition-all duration-1000 hover:scale-105 inline-block ${r?"text-sky-400 hover:text-sky-300":"text-amber-100 hover:text-white"}`,children:"sponsor@hackfest.dev"})]})]})]}),(0,t.jsx)("div",{className:`w-full border-t py-4 text-center font-medium text-sm transition-colors duration-1000 ${r?"border-sky-900/40 text-stone-500":"border-amber-900/40 text-amber-50/60"}`,children:(0,t.jsx)("p",{children:"2026 © Hackfest | All rights reserved"})})]})]})}])},37319,e=>{"use strict";var t=e.i(670931),r=e.i(7284),s=e.i(291872),n=e.i(227171),a=e.i(149931),i=e.i(173615),o=e.i(399439),l=e.i(389351),c=e.i(718439),d=e.i(923191),u=e.i(685119);function f(...e){return(0,d.twMerge)((0,r.clsx)(e))}let h=[{name:"Home",href:"/"},{name:"About",href:"/about"},{name:"Events",href:"/events"},{name:"Timeline",href:"/timeline"},{name:"Contact",href:"/contact"}];function m({isUnderwater:e,session:r,authType:a="hackathon"}){let d=(0,l.usePathname)(),[u,m]=(0,c.useState)(!1),[v,x]=(0,c.useState)(!1),b=(0,c.useRef)(null);return(0,c.useEffect)(()=>{let e=()=>m(window.scrollY>20);return window.addEventListener("scroll",e),()=>window.removeEventListener("scroll",e)},[]),(0,c.useEffect)(()=>{let e=e=>{b.current&&!b.current.contains(e.target)&&x(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]),(0,c.useEffect)(()=>{x(!1)},[]),(0,t.jsxs)(n.motion.nav,{ref:b,layout:!0,className:f("fixed left-1/2 -translate-x-1/2 z-100 w-[85%] md:w-[75%] lg:w-[85%] max-w-5xl pointer-events-auto","transition-all duration-500 ease-out",u&&!v?"top-2 scale-[0.98]":"top-6"),children:[(0,t.jsxs)(n.motion.div,{layoutId:"nav-bg",className:"absolute inset-0 w-full h-full shadow-2xl drop-shadow-xl rounded-lg overflow-hidden -z-10 bg-black/10",children:[(0,t.jsx)(i.default,{src:"/teal-leather.webp",alt:"Leather Background",fill:!0,className:"object-cover scale-[1.3]",priority:!0}),(0,t.jsx)("div",{className:f("absolute inset-0 transition-all duration-700 ease-in-out pointer-events-none",e?"bg-black/40":"bg-black/10")}),(0,t.jsx)("div",{className:"absolute inset-0 bg-black/20 pointer-events-none"}),(0,t.jsx)("div",{className:"absolute inset-1.5 border-2 border-dashed border-amber-100/30 rounded-md pointer-events-none"}),(0,t.jsx)("div",{className:"absolute inset-0.5 border border-white/10 rounded-lg pointer-events-none"})]}),(0,t.jsxs)("div",{className:"relative flex items-center justify-between px-6 py-3 md:px-8 lg:px-12 xl:px-20 md:py-3 xl:py-4",children:[(0,t.jsxs)(o.default,{href:"/",className:"group relative shrink-0 transition-transform hover:scale-105 active:scale-95",onClick:()=>x(!1),children:[(0,t.jsx)("div",{className:"absolute inset-0 -z-10 flex items-center justify-center overflow",children:(0,t.jsx)("div",{className:f("w-16 h-16 md:w-16 md:h-16 xl:w-20 xl:h-5 rounded-full blur-3xl opacity-100 transition-colors duration-700",e?"bg-linear-to-r from-cyan-400 via-blue-300 to-cyan-500":"bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500")})}),(0,t.jsx)("div",{className:"relative w-12 h-12 md:w-12 md:h-12 xl:w-14 xl:h-14",children:(0,t.jsx)(i.default,{src:"/logos/logowithglow.webp",alt:"Hackfest Logo",fill:!0,className:"object-contain drop-shadow-[0_0_12px_rgba(255,191,0,0.7)]"})})]}),(0,t.jsx)("div",{className:"hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8",children:h.map(r=>{let s=d===r.href;return(0,t.jsxs)(o.default,{href:r.href,className:f("relative font-pirate text-lg xl:text-xl font-bold tracking-wide transition-colors duration-500",s?e?"text-cyan-400 shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]":"text-amber-400 shadow-amber-500/50 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]":e?"text-cyan-100/70 hover:text-white":"text-amber-100/80 hover:text-white"),children:[r.name,(0,t.jsx)("span",{className:f("absolute -bottom-1 left-0 h-0.5 w-full transition-transform duration-300 origin-left scale-x-0 rounded-full opacity-100",e?"bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]":"bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",s&&"scale-x-100","group-hover:scale-x-100")})]},r.name)})}),(0,t.jsx)("div",{className:"hidden md:flex items-center gap-4",children:(0,t.jsx)(p,{session:r,authType:a,isUnderwater:e})}),(0,t.jsx)("button",{type:"button",onClick:()=>x(!v),className:"md:hidden relative z-20 p-2 focus:outline-none",children:(0,t.jsxs)("div",{className:"flex flex-col gap-1.5 justify-center items-center w-8",children:[(0,t.jsx)("span",{className:f("block h-0.5 w-full rounded-full transition-all duration-300",e?"bg-cyan-400":"bg-amber-400",v?"rotate-45 translate-y-2":"")}),(0,t.jsx)("span",{className:f("block h-0.5 w-full rounded-full transition-all duration-300",e?"bg-cyan-400":"bg-amber-400",v?"opacity-0":"")}),(0,t.jsx)("span",{className:f("block h-0.5 w-full rounded-full transition-all duration-300",e?"bg-cyan-400":"bg-amber-400",v?"-rotate-45 -translate-y-2":"")})]})})]}),(0,t.jsx)(s.AnimatePresence,{children:v&&(0,t.jsx)(n.motion.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},transition:{duration:.3,ease:"easeInOut"},className:"md:hidden overflow-hidden border-t border-white/10",children:(0,t.jsxs)("div",{className:"flex flex-col items-center gap-6 pb-8 pt-4",children:[h.map(r=>{let s=d===r.href;return(0,t.jsx)(o.default,{href:r.href,onClick:()=>x(!1),className:f("text-xl lg:text-2xl font-pirate font-bold tracking-widest uppercase transition-colors",s?e?"text-cyan-400":"text-amber-400":e?"text-cyan-100/70":"text-amber-100/80"),children:r.name},r.name)}),(0,t.jsx)("div",{className:"mt-2 flex flex-col items-center gap-4",children:(0,t.jsx)(p,{session:r,authType:a,isUnderwater:e,onNavigate:()=>x(!1)})})]})})})]})}function p({session:r,authType:s,isUnderwater:n,onNavigate:i}){let c=(0,l.usePathname)(),d="event"===s,h=!!r?.user,m="/",p="";d?(m=h?"/events":"/events/login",p=h?r?.user?.name?.split(" ")[0]||"Profile":"Event Login"):(m=h&&r?.user?.isRegistrationComplete?"/teams":"/register",p=h&&r?.user?.isRegistrationComplete?"Your Team":"Register Now");let v=f("group relative px-4 py-1.5 xl:px-6 xl:py-2 font-pirate text-base xl:text-lg font-bold transition-all duration-500 cursor-pointer",n?"text-cyan-100 hover:text-white":"text-amber-100 hover:text-white"),x=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:f("absolute inset-0 border rounded-md transition-all duration-500",n?"border-cyan-400/40 bg-cyan-900/20 group-hover:bg-cyan-900/40":"border-amber-200/40 bg-white/5 group-hover:bg-white/10")}),(0,t.jsx)("div",{className:f("absolute inset-0.75 border rounded-sm opacity-50 transition-colors duration-500",n?"border-cyan-200/20":"border-amber-200/20")})]});return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.default,{href:m,onClick:i,children:(0,t.jsxs)("button",{type:"button",className:v,children:[x,(0,t.jsx)("span",{className:"relative z-10 drop-shadow-sm",children:p})]})}),h&&(0,t.jsx)("button",{type:"button",onClick:async()=>{if(d){let{signOutOfGoogle:t}=await e.A(441341);t(c)}else(0,u.signOutOfGitHub)(c)},className:f("p-2 rounded-md transition-colors duration-300",n?"text-cyan-400 hover:text-cyan-100 hover:bg-cyan-900/20":"text-amber-400 hover:text-amber-100 hover:bg-amber-900/20"),title:"Logout",children:(0,t.jsx)(a.LogOut,{className:"w-5 h-5"})})]})}e.s(["Navbar",()=>m])},150366,e=>{"use strict";var t=e.i(670931),r=e.i(750755),s=e.i(310305),n=e.i(847435),a=e.i(608827),i=e.i(358968),o=e.i(912840),l=e.i(718439),c=e.i(809858),d=e.i(470655),u=e.i(602627);function f({isNight:e}){let{viewport:r}=(0,o.useThree)(),n=(0,l.useRef)(null),a=(0,l.useRef)(null),[d,u,f]=(0,s.useTexture)(["/images/morningnew3.webp","/images/night.webp","/images/underwater.webp"]);return(0,i.useFrame)(t=>{let s=t.clock.elapsedTime;if(a.current){a.current.uTime=.6*s,a.current.uTransitionProgress=1,a.current.uHoverProgress=.5*t.pointer.x+.5;let n=e?u.image:d.image,i=f.image;n&&i&&(a.current.uPlaneRes.set(1.1*r.width,1.1*r.height),a.current.uMediaRes1.set(n.width,n.height),a.current.uMediaRes2.set(i.width,i.height)),a.current.uIsNight=c.MathUtils.lerp(a.current.uIsNight,+!!e,.05)}}),(0,t.jsxs)("mesh",{ref:n,scale:[1.1*r.width,1.1*r.height,1],children:[(0,t.jsx)("planeGeometry",{args:[1,1]}),(0,t.jsx)("transitionMaterial",{ref:a,tMap1:e?u:d,tMap2:f,transparent:!0,opacity:1})]})}function h(){let{isNight:e}=(0,u.useDayNight)();return(0,t.jsxs)("div",{className:"jsx-86fb4b05e544c1ed fixed inset-0 w-full h-full -z-10 bg-black/80",children:[(0,t.jsx)(n.Canvas,{className:"canvas-about",gl:{antialias:!0,alpha:!1},dpr:[1,1.25],children:(0,t.jsx)(l.Suspense,{fallback:null,children:(0,t.jsx)(f,{isNight:e})})}),(0,t.jsx)(r.default,{id:"86fb4b05e544c1ed",children:".canvas-about{top:0;left:0;width:100vw!important;height:100vh!important;position:fixed!important}"})]})}(0,a.extend)({TransitionMaterial:d.TransitionMaterial}),e.s(["default",()=>h])},840897,e=>{"use strict";var t=e.i(670931),r=e.i(267366),s=e.i(491385),n=e.i(173615);function a(){return(0,t.jsx)("div",{className:"w-full max-w-7xl mx-auto p-4 md:p-8",children:(0,t.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min md:auto-rows-[180px]",children:[(0,t.jsx)("div",{className:"md:col-span-12 md:row-span-2",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full flex items-center justify-center text-center",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center items-center",children:(0,t.jsxs)("div",{className:"flex flex-col items-center",children:[(0,t.jsxs)("div",{className:"relative w-20 h-20 md:w-24 md:h-24 mb-4",children:[(0,t.jsx)("div",{className:"absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"}),(0,t.jsx)(n.default,{src:"/logos/logowithglow.webp",fill:!0,alt:"HF Logo",className:"object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"})]}),(0,t.jsxs)("h1",{className:"text-4xl md:text-6xl font-pirate text-cyan-100 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] leading-tight",children:["CodeQuest ",(0,t.jsx)("br",{}),(0,t.jsx)("span",{className:"text-transparent bg-clip-text bg-linear-to-b from-cyan-300 to-blue-500",children:"The Grand Voyage"})]}),(0,t.jsx)("p",{className:"mt-4 text-cyan-200/60 font-pirate tracking-widest uppercase text-xs md:text-sm border-t border-cyan-500/30 pt-4 w-full max-w-md mx-auto",children:"3 Day Long Sea Voyage"})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-1",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center h-full",children:[(0,t.jsx)("span",{className:"text-cyan-500/50 font-pirate text-xl mb-1",children:"April"}),(0,t.jsxs)("div",{className:"flex items-baseline gap-2",children:[(0,t.jsx)("span",{className:"text-3xl font-black text-stone-400",children:"17"}),(0,t.jsx)("span",{className:"text-5xl font-black text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]",children:"18"}),(0,t.jsx)("span",{className:"text-3xl font-black text-stone-400",children:"19"})]}),(0,t.jsx)("span",{className:"text-stone-500 font-crimson text-xs tracking-[0.3em] mt-1",children:"2026"})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-2",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full justify-start! text-justify md:text-left",children:[(0,t.jsxs)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:[(0,t.jsx)("h3",{className:"text-xl font-pirate text-cyan-200 mb-4 border-b border-cyan-500/30 pb-2 inline-block w-fit pr-12",children:"What is Hackfest?"}),(0,t.jsx)("p",{className:"text-stone-300 text-justify font-crimson text-lg leading-relaxed",children:"NMAM Institute of Technology presents a national-level tech fest. A 36-hour hackathon where 60 teams from across the seas gather to foster innovation and showcase their skills in a 50-hour marathon of code and creativity."})]}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-2",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full justify-start! text-justify md:text-left",children:[(0,t.jsxs)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:[(0,t.jsx)("h3",{className:"text-xl font-pirate text-cyan-200 mb-4 border-b border-cyan-500/30 pb-2 inline-block w-fit pr-12",children:"About NMAMIT"}),(0,t.jsx)("p",{className:"text-stone-300 text-justify font-crimson text-lg leading-relaxed",children:"NMAM Institute of Technology (1986) is an AICTE-approved constituent of Nitte (Deemed to be University), ranked 151–200 in National Institutional Ranking Framework 2025, with AICTE-CII ‘Platinum’ industry linkage status and global collaborations."})]}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-1",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:(0,t.jsxs)("div",{className:"flex flex-col items-center",children:[(0,t.jsx)("span",{className:"text-5xl font-pirate text-cyan-300",children:"50Hrs"}),(0,t.jsx)("span",{className:"text-xs uppercase tracking-widest text-cyan-500/70 mt-1",children:"On-Site Event"})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-1",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:(0,t.jsxs)("div",{className:"flex flex-col items-center",children:[(0,t.jsx)("span",{className:"text-5xl font-pirate text-cyan-100",children:"36Hrs"}),(0,t.jsx)("span",{className:"text-xs uppercase tracking-widest text-stone-500 mt-1",children:"Non-Stop Coding"})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-1",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:(0,t.jsxs)("div",{className:"flex flex-col items-center",children:[(0,t.jsx)("span",{className:"text-5xl font-pirate text-amber-200",children:"5 Tracks"}),(0,t.jsx)("span",{className:"text-xs uppercase tracking-widest text-amber-500/50 mt-1",children:"Diverse Themes"})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-4 md:row-span-1",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm bg-black/40 border border-cyan-500/30 rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full opacity-80",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:(0,t.jsxs)("div",{className:"flex items-center gap-4 h-full",children:[(0,t.jsx)(s.MapPin,{className:"w-8 h-8 text-cyan-500/50 shrink-0"}),(0,t.jsxs)("div",{className:"flex flex-col text-left",children:[(0,t.jsx)("span",{className:"text-stone-300 font-bold text-sm",children:"NMAM Institute of Technology"}),(0,t.jsxs)("span",{className:"text-stone-500 text-xs mt-1",children:["Nitte, Karkala, Udupi District",(0,t.jsx)("br",{}),"Karnataka, India"]})]}),(0,t.jsx)("div",{className:"relative w-12 h-12 ml-auto opacity-70 hover:opacity-100 transition-opacity hidden md:block",children:(0,t.jsx)(n.default,{src:"/logos/flc_logo_crop.png",alt:"FLC Logo",fill:!0,className:"object-contain"})})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})}),(0,t.jsx)("div",{className:"md:col-span-12 md:row-span-1",children:(0,t.jsxs)("div",{className:"relative group backdrop-blur-sm rounded-xl overflow-hidden hover:border-cyan-400/60 transition-colors h-full bg-cyan-950/30 border border-amber-500/20",children:[(0,t.jsx)("div",{className:"h-full w-full p-6 relative z-10 flex flex-col justify-center",children:(0,t.jsxs)("div",{className:"flex flex-col md:flex-row items-center justify-center gap-10 px-4 md:justify-around text-center",children:[(0,t.jsxs)("div",{className:"text-center md:text-left",children:[(0,t.jsx)("span",{className:"block text-stone-400 font-crimson text-sm uppercase tracking-widest mb-1",children:"Total Prizes Worth"}),(0,t.jsx)("span",{className:"text-5xl font-pirate text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]",children:"₹4,00,000+"})]}),(0,t.jsxs)("a",{href:"/images/brochure/Hackfest26Brochure.pdf",download:!0,className:"group flex items-center gap-3 px-8 py-4 rounded-lg bg-cyan-900/40 border border-cyan-500/30 hover:bg-cyan-800/40 hover:border-cyan-400/50 transition-all shrink-0",children:[(0,t.jsx)("span",{className:"font-pirate text-cyan-100 text-lg group-hover:text-cyan-300",children:"Download Brochure"}),(0,t.jsx)(r.Download,{className:"w-5 h-5 text-cyan-400 group-hover:text-cyan-200 transition-colors"})]})]})}),(0,t.jsx)("div",{className:"absolute inset-0 bg-linear-to-b from-cyan-500/5 to-transparent pointer-events-none"}),(0,t.jsx)("div",{className:"absolute -inset-px border border-cyan-500/20 rounded-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"})]})})]})})}e.s(["default",()=>a])},441341,e=>{e.v(t=>Promise.all(["static/chunks/e8dcc2108b5baefa.js"].map(t=>e.l(t))).then(()=>t(444153)))}]);