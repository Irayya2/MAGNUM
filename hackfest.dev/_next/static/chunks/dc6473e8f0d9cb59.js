(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,7284,e=>{"use strict";function t(){for(var e,t,r=0,n="",i=arguments.length;r<i;r++)(e=arguments[r])&&(t=function e(t){var r,n,i="";if("string"==typeof t||"number"==typeof t)i+=t;else if("object"==typeof t)if(Array.isArray(t)){var a=t.length;for(r=0;r<a;r++)t[r]&&(n=e(t[r]))&&(i&&(i+=" "),i+=n)}else for(n in t)t[n]&&(i&&(i+=" "),i+=n);return i}(e))&&(n&&(n+=" "),n+=t);return n}e.s(["clsx",()=>t,"default",0,t])},975157,e=>{"use strict";var t=e.i(7284),r=e.i(923191);function n(...e){return(0,r.twMerge)((0,t.clsx)(e))}function i(e,t){return e*t}e.s(["calculateTotalAmount",()=>i,"cn",()=>n])},267366,e=>{"use strict";let t=(0,e.i(514514).default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);e.s(["Download",()=>t],267366)},352573,901131,870393,e=>{"use strict";var t=e.i(514514);let r=(0,t.default)("chevron-left",[["path",{d:"m15 18-6-6 6-6",key:"1wnfg3"}]]);e.s(["ChevronLeft",()=>r],352573);let n=(0,t.default)("chevron-right",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]]);e.s(["default",()=>n],901131),e.s(["ChevronRight",()=>n],870393)},310305,914969,470655,e=>{"use strict";var t=e.i(718439),r=e.i(809858),n=e.i(912840),i=e.i(235044),i=i;let a=e=>e===Object(e)&&!Array.isArray(e)&&"function"!=typeof e;function s(e,s){let o=(0,n.useThree)(e=>e.gl),l=(0,i.G)(r.TextureLoader,a(e)?Object.values(e):e);return(0,t.useLayoutEffect)(()=>{null==s||s(l)},[s]),(0,t.useEffect)(()=>{if("initTexture"in o){let e=[];Array.isArray(l)?e=l:l instanceof r.Texture?e=[l]:a(l)&&(e=Object.values(l)),e.forEach(e=>{e instanceof r.Texture&&o.initTexture(e)})}},[o,l]),(0,t.useMemo)(()=>{if(!a(e))return l;{let t={},r=0;for(let n in e)t[n]=l[r++];return t}},[e,l])}s.preload=e=>i.G.preload(r.TextureLoader,e),s.clear=e=>i.G.clear(r.TextureLoader,e),e.s(["useTexture",()=>s],310305);var o=r;function l(e,t,r,n){var i;return(i=class extends o.ShaderMaterial{constructor(i){for(const n in super({vertexShader:t,fragmentShader:r,...i}),e)this.uniforms[n]=new o.Uniform(e[n]),Object.defineProperty(this,n,{get(){return this.uniforms[n].value},set(e){this.uniforms[n].value=e}});this.uniforms=o.UniformsUtils.clone(this.uniforms),null==n||n(this)}}).key=o.MathUtils.generateUUID(),i}e.s(["shaderMaterial",()=>l],914969);var u=e.i(608827);let c=`
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
`,d=`
varying vec2 vUv;

void main()
{
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vUv = uv;
}
`,f=l({uTime:0,uTransitionProgress:0,uHoverProgress:0,uVar1:0,uVar2:0,uVar3:0,uPlaneRes:new r.Vector2(1,1),uMediaRes1:new r.Vector2(1,1),uMediaRes2:new r.Vector2(1,1),uCanvasRes:new r.Vector2(1,1),uMouse2D:new r.Vector2(0,0),tMap1:null,tMap2:null,tMap3:null,uNausea:0,uIsNight:0},d,c);(0,u.extend)({TransitionMaterial:f}),e.s(["TransitionMaterial",0,f],470655)},374789,(e,t,r)=>{},881927,(e,t,r)=>{var n=e.i(866541);e.r(374789);var i=e.r(718439),a=i&&"object"==typeof i&&"default"in i?i:{default:i},s=void 0!==n.default&&n.default.env&&!0,o=function(e){return"[object String]"===Object.prototype.toString.call(e)},l=function(){function e(e){var t=void 0===e?{}:e,r=t.name,n=void 0===r?"stylesheet":r,i=t.optimizeForSpeed,a=void 0===i?s:i;u(o(n),"`name` must be a string"),this._name=n,this._deletedRulePlaceholder="#"+n+"-deleted-rule____{}",u("boolean"==typeof a,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=a,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var l="undefined"!=typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=l?l.getAttribute("content"):null}var t,r=e.prototype;return r.setOptimizeForSpeed=function(e){u("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),u(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},r.isOptimizeForSpeed=function(){return this._optimizeForSpeed},r.inject=function(){var e=this;if(u(!this._injected,"sheet already injected"),this._injected=!0,"undefined"!=typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(s||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,r){return"number"==typeof r?e._serverSheet.cssRules[r]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),r},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},r.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},r.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},r.insertRule=function(e,t){if(u(o(e),"`insertRule` accepts only strings"),"undefined"==typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var r=this.getSheet();"number"!=typeof t&&(t=r.cssRules.length);try{r.insertRule(e,t)}catch(t){return s||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var n=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,n))}return this._rulesCount++},r.replaceRule=function(e,t){if(this._optimizeForSpeed||"undefined"==typeof window){var r="undefined"!=typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!r.cssRules[e])return e;r.deleteRule(e);try{r.insertRule(t,e)}catch(n){s||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),r.insertRule(this._deletedRulePlaceholder,e)}}else{var n=this._tags[e];u(n,"old rule at index `"+e+"` not found"),n.textContent=t}return e},r.deleteRule=function(e){if("undefined"==typeof window)return void this._serverSheet.deleteRule(e);if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];u(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},r.flush=function(){this._injected=!1,this._rulesCount=0,"undefined"!=typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},r.cssRules=function(){var e=this;return"undefined"==typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,r){return r?t=t.concat(Array.prototype.map.call(e.getSheetForTag(r).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},r.makeStyleTag=function(e,t,r){t&&u(o(t),"makeStyleTag accepts only strings as second parameter");var n=document.createElement("style");this._nonce&&n.setAttribute("nonce",this._nonce),n.type="text/css",n.setAttribute("data-"+e,""),t&&n.appendChild(document.createTextNode(t));var i=document.head||document.getElementsByTagName("head")[0];return r?i.insertBefore(n,r):i.appendChild(n),n},t=[{key:"length",get:function(){return this._rulesCount}}],function(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}(e.prototype,t),e}();function u(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var c=function(e){for(var t=5381,r=e.length;r;)t=33*t^e.charCodeAt(--r);return t>>>0},d={};function f(e,t){if(!t)return"jsx-"+e;var r=String(t),n=e+r;return d[n]||(d[n]="jsx-"+c(e+"-"+r)),d[n]}function h(e,t){"undefined"==typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var r=e+t;return d[r]||(d[r]=t.replace(/__jsx-style-dynamic-selector/g,e)),d[r]}var v=function(){function e(e){var t=void 0===e?{}:e,r=t.styleSheet,n=void 0===r?null:r,i=t.optimizeForSpeed,a=void 0!==i&&i;this._sheet=n||new l({name:"styled-jsx",optimizeForSpeed:a}),this._sheet.inject(),n&&"boolean"==typeof a&&(this._sheet.setOptimizeForSpeed(a),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"undefined"==typeof window||this._fromServer||(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var r=this.getIdAndRules(e),n=r.styleId,i=r.rules;if(n in this._instancesCounts){this._instancesCounts[n]+=1;return}var a=i.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[n]=a,this._instancesCounts[n]=1},t.remove=function(e){var t=this,r=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(r in this._instancesCounts,"styleId: `"+r+"` not found"),this._instancesCounts[r]-=1,this._instancesCounts[r]<1){var n=this._fromServer&&this._fromServer[r];n?(n.parentNode.removeChild(n),delete this._fromServer[r]):(this._indices[r].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[r]),delete this._instancesCounts[r]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],r=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return r[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,r;return t=this.cssRules(),void 0===(r=e)&&(r={}),t.map(function(e){var t=e[0],n=e[1];return a.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:r.nonce?r.nonce:void 0,dangerouslySetInnerHTML:{__html:n}})})},t.getIdAndRules=function(e){var t=e.children,r=e.dynamic,n=e.id;if(r){var i=f(n,r);return{styleId:i,rules:Array.isArray(t)?t.map(function(e){return h(i,e)}):[h(i,t)]}}return{styleId:f(n),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),m=i.createContext(null);function p(){return new v}function x(){return i.useContext(m)}m.displayName="StyleSheetContext";var g=a.default.useInsertionEffect||a.default.useLayoutEffect,y="undefined"!=typeof window?p():void 0;function b(e){var t=y||x();return t&&("undefined"==typeof window?t.add(e):g(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}b.dynamic=function(e){return e.map(function(e){return f(e[0],e[1])}).join(" ")},r.StyleRegistry=function(e){var t=e.registry,r=e.children,n=i.useContext(m),s=i.useState(function(){return n||t||p()})[0];return a.default.createElement(m.Provider,{value:s},r)},r.createStyleRegistry=p,r.style=b,r.useStyleRegistry=x},750755,(e,t,r)=>{t.exports=e.r(881927).style},107983,(e,t,r)=>{"use strict";var n=e.r(718439),i="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},a=n.useState,s=n.useEffect,o=n.useLayoutEffect,l=n.useDebugValue;function u(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!i(e,r)}catch(e){return!0}}var c="undefined"==typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var r=t(),n=a({inst:{value:r,getSnapshot:t}}),i=n[0].inst,c=n[1];return o(function(){i.value=r,i.getSnapshot=t,u(i)&&c({inst:i})},[e,r,t]),s(function(){return u(i)&&c({inst:i}),e(function(){u(i)&&c({inst:i})})},[e]),l(r),r};r.useSyncExternalStore=void 0!==n.useSyncExternalStore?n.useSyncExternalStore:c},33347,(e,t,r)=>{"use strict";t.exports=e.r(107983)},683842,(e,t,r)=>{"use strict";var n=e.r(718439),i=e.r(33347),a="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},s=i.useSyncExternalStore,o=n.useRef,l=n.useEffect,u=n.useMemo,c=n.useDebugValue;r.useSyncExternalStoreWithSelector=function(e,t,r,n,i){var d=o(null);if(null===d.current){var f={hasValue:!1,value:null};d.current=f}else f=d.current;var h=s(e,(d=u(function(){function e(e){if(!l){if(l=!0,s=e,e=n(e),void 0!==i&&f.hasValue){var t=f.value;if(i(t,e))return o=t}return o=e}if(t=o,a(s,e))return t;var r=n(e);return void 0!==i&&i(t,r)?(s=e,t):(s=e,o=r)}var s,o,l=!1,u=void 0===r?null:r;return[function(){return e(t())},null===u?void 0:function(){return e(u())}]},[t,r,n,i]))[0],d[1]);return l(function(){f.hasValue=!0,f.value=h},[h]),c(h),h}},551165,(e,t,r)=>{"use strict";t.exports=e.r(683842)},934082,e=>{"use strict";let t=(0,e.i(514514).default)("instagram",[["rect",{width:"20",height:"20",x:"2",y:"2",rx:"5",ry:"5",key:"2e1cvw"}],["path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z",key:"9exkf1"}],["line",{x1:"17.5",x2:"17.51",y1:"6.5",y2:"6.5",key:"r4j83e"}]]);e.s(["Instagram",()=>t],934082)},626191,e=>{"use strict";let t=(0,e.i(514514).default)("mail",[["path",{d:"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7",key:"132q7q"}],["rect",{x:"2",y:"4",width:"20",height:"16",rx:"2",key:"izxlao"}]]);e.s(["Mail",()=>t],626191)},149931,e=>{"use strict";let t=(0,e.i(514514).default)("log-out",[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]]);e.s(["LogOut",()=>t],149931)},862204,(e,t,r)=>{"use strict";Object.defineProperty(r,"__esModule",{value:!0});var n={callServer:function(){return a.callServer},createServerReference:function(){return o.createServerReference},findSourceMapURL:function(){return s.findSourceMapURL}};for(var i in n)Object.defineProperty(r,i,{enumerable:!0,get:n[i]});let a=e.r(600860),s=e.r(867320),o=e.r(293929)},685119,e=>{"use strict";var t=e.i(862204),r=(0,t.createServerReference)("40cc9ed6c280cb7b2d0422338aaff460b52167eeae",t.callServer,void 0,t.findSourceMapURL,"signOutOfGitHub");e.s(["signOutOfGitHub",()=>r])},635514,e=>{"use strict";var t=e.i(670931),r=e.i(934082),n=e.i(626191),i=e.i(173615),a=e.i(399439),s=e.i(602627);let o=[{link:"https://www.instagram.com/hackfest.dev",icon:(0,t.jsx)(r.Instagram,{className:"h-6 w-6 transition-colors"}),name:"Instagram"},{link:"mailto:admin@hackfest.dev",icon:(0,t.jsx)(n.Mail,{className:"h-6 w-6 transition-colors"}),name:"E-mail"}];e.s(["default",0,({overlayNeeded:e=!1})=>{let{isNight:r}=(0,s.useDayNight)();return(0,t.jsxs)("footer",{className:"relative z-20 w-full flex flex-col",children:[(0,t.jsx)("div",{className:"relative h-45 w-full overflow-hidden pointer-events-none",children:(0,t.jsx)("div",{className:"absolute inset-0 z-10 bg-transparent bg-[url('/images/corals_cropped.png')] bg-repeat-x bg-size-[auto_100%] bg-top-left pointer-events-none transition-all duration-1000",style:{filter:r?"brightness(0.5) saturate(0.8) sepia(0.2) hue-rotate(180deg)":"brightness(0.6) saturate(0.8) hue-rotate(-5deg) contrast(1.0)"}})}),(0,t.jsxs)("div",{className:`relative z-20 w-full flex-col overflow-hidden border-t transition-colors duration-1000 bg-linear-to-b md:backdrop-blur-md ${r?"border-sky-900/40 from-[#0f2a3f] via-[#091a2a] to-[#040e1a]":"border-sky-300/40 from-[#8e8071] via-[#6b5e50] to-[#42392f]"}`,children:[(0,t.jsx)("div",{className:`${e?"hidden md:block":"hidden"} absolute inset-0 pointer-events-none z-0 mix-blend-overlay transition-opacity duration-1000`,style:{backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")"}}),(0,t.jsxs)("div",{className:"relative z-10 flex h-full flex-col items-center justify-evenly space-y-12 p-4 py-8 lg:flex-row",children:[(0,t.jsx)("div",{className:`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-linear-to-r from-transparent to-transparent blur-sm transition-colors duration-1000 ${r?"via-sky-600/50":"via-amber-300/60"}`}),(0,t.jsxs)("div",{className:"flex flex-col items-center gap-8 z-10",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center gap-4 transition-all duration-1000",children:[(0,t.jsxs)("div",{className:"flex flex-row items-center justify-center gap-6",children:[(0,t.jsx)(a.default,{href:"/",className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(i.default,{src:"/logo.webp",priority:!0,alt:"Logo - Hackfest",width:95,height:50,className:`transition-all duration-1000 ${r?"drop-shadow-[0_0_15px_rgba(2,132,199,0.6)]":"drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]"}`})}),(0,t.jsx)(a.default,{href:"https://finiteloop.club/",target:"_blank",className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(i.default,{src:"/logos/flc_logo_crop.png",priority:!0,alt:"Logo - Finite Loop Club",width:75,height:50,className:"opacity-85 hover:opacity-100 transition-all duration-1000"})})]}),(0,t.jsx)(a.default,{href:"https://nitte.edu.in/nmamit/",target:"_blank",className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(i.default,{src:"/logos/NMAMITLogo.png",priority:!0,alt:"Logo - NMAMIT",width:180,height:100,className:"opacity-85 hover:opacity-100 transition-all duration-1000",style:{filter:r?"brightness(0) invert(1) opacity(0.8)":"brightness(0) invert(1) opacity(0.95)"}})})]}),(0,t.jsxs)("div",{className:"flex flex-col items-center gap-4 md:gap-4",children:[(0,t.jsx)("p",{className:`text-base font-medium transition-colors duration-1000 ${r?"text-stone-300":"text-amber-50"}`,children:"Connect with us:"}),(0,t.jsx)("ul",{className:"flex gap-6 md:gap-6",children:o.map(e=>(0,t.jsx)("li",{className:"relative z-50 pointer-events-auto",children:(0,t.jsx)(a.default,{href:e.link,className:`block text-2xl transition-all duration-1000 hover:scale-110 ${r?"text-sky-400 hover:text-sky-300":"text-amber-100 hover:text-white"}`,target:e.link.startsWith("mailto:")?void 0:"_blank",children:e.icon})},e.name))})]})]}),(0,t.jsxs)("div",{className:"flex flex-col items-center gap-8 z-10",children:[(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center gap-10 md:flex-row",children:[(0,t.jsx)("div",{"data-lenis-prevent":!0,className:`overflow-hidden rounded-lg border transition-colors duration-1000 relative z-30 ${r?"border-sky-800/40 shadow-[0_0_15px_rgba(2,132,199,0.15)]":"border-amber-600/30 shadow-[0_0_20px_rgba(251,191,36,0.15)]"}`,style:{touchAction:"auto",overscrollBehavior:"contain"},onWheel:e=>e.stopPropagation(),onTouchStart:e=>e.stopPropagation(),onTouchMove:e=>e.stopPropagation(),onPointerDown:e=>e.stopPropagation(),children:(0,t.jsx)("iframe",{title:"Maps",src:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15538.662520521424!2d74.93399100000002!3d13.18347!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbb56415ad85e5b%3A0x10b77ac6f6afc7fa!2sNitte%20Mahalinga%20Adyantaya%20Memorial%20Institute%20of%20Technology%20-%20NMAMIT!5e0!3m2!1sen!2sin!4v1771872967031!5m2!1sen!2sin",width:"250",height:"180",style:{border:0,touchAction:"auto",pointerEvents:"auto"},className:`relative z-30 filter transition-all duration-1000 ${r?"sepia-0 grayscale opacity-80 hover:opacity-100 hover:grayscale-50":"sepia-[0.3] hue-rotate-15 saturate-[0.9] hover:sepia-0 hover:saturate-100"}`,"aria-hidden":"false",loading:"lazy",allowFullScreen:!0})}),(0,t.jsxs)("div",{className:"flex flex-col gap-2 text-center",children:[(0,t.jsx)("p",{className:`text-lg font-bold transition-colors duration-1000 ${r?"text-sky-300":"text-amber-100"}`,children:"NMAM Institute of Technology, Nitte"}),(0,t.jsx)("p",{className:`text-sm font-medium transition-colors duration-1000 ${r?"text-stone-400":"text-amber-50/80"}`,children:"Karkala, Udupi District, Karnataka"})]})]}),(0,t.jsxs)("p",{className:`text-center text-base font-medium transition-colors duration-1000 ${r?"text-stone-300":"text-amber-50/90"}`,children:["Interested to sponsor? Let us know"," ",(0,t.jsx)(a.default,{href:"mailto:sponsor@hackfest.dev",className:`relative z-50 pointer-events-auto underline font-bold transition-all duration-1000 hover:scale-105 inline-block ${r?"text-sky-400 hover:text-sky-300":"text-amber-100 hover:text-white"}`,children:"sponsor@hackfest.dev"})]})]})]}),(0,t.jsx)("div",{className:`w-full border-t py-4 text-center font-medium text-sm transition-colors duration-1000 ${r?"border-sky-900/40 text-stone-500":"border-amber-900/40 text-amber-50/60"}`,children:(0,t.jsx)("p",{children:"2026 © Hackfest | All rights reserved"})})]})]})}])},37319,e=>{"use strict";var t=e.i(670931),r=e.i(7284),n=e.i(291872),i=e.i(227171),a=e.i(149931),s=e.i(173615),o=e.i(399439),l=e.i(389351),u=e.i(718439),c=e.i(923191),d=e.i(685119);function f(...e){return(0,c.twMerge)((0,r.clsx)(e))}let h=[{name:"Home",href:"/"},{name:"About",href:"/about"},{name:"Events",href:"/events"},{name:"Timeline",href:"/timeline"},{name:"Contact",href:"/contact"}];function v({isUnderwater:e,session:r,authType:a="hackathon"}){let c=(0,l.usePathname)(),[d,v]=(0,u.useState)(!1),[p,x]=(0,u.useState)(!1),g=(0,u.useRef)(null);return(0,u.useEffect)(()=>{let e=()=>v(window.scrollY>20);return window.addEventListener("scroll",e),()=>window.removeEventListener("scroll",e)},[]),(0,u.useEffect)(()=>{let e=e=>{g.current&&!g.current.contains(e.target)&&x(!1)};return document.addEventListener("mousedown",e),()=>document.removeEventListener("mousedown",e)},[]),(0,u.useEffect)(()=>{x(!1)},[]),(0,t.jsxs)(i.motion.nav,{ref:g,layout:!0,className:f("fixed left-1/2 -translate-x-1/2 z-100 w-[85%] md:w-[75%] lg:w-[85%] max-w-5xl pointer-events-auto","transition-all duration-500 ease-out",d&&!p?"top-2 scale-[0.98]":"top-6"),children:[(0,t.jsxs)(i.motion.div,{layoutId:"nav-bg",className:"absolute inset-0 w-full h-full shadow-2xl drop-shadow-xl rounded-lg overflow-hidden -z-10 bg-black/10",children:[(0,t.jsx)(s.default,{src:"/teal-leather.webp",alt:"Leather Background",fill:!0,className:"object-cover scale-[1.3]",priority:!0}),(0,t.jsx)("div",{className:f("absolute inset-0 transition-all duration-700 ease-in-out pointer-events-none",e?"bg-black/40":"bg-black/10")}),(0,t.jsx)("div",{className:"absolute inset-0 bg-black/20 pointer-events-none"}),(0,t.jsx)("div",{className:"absolute inset-1.5 border-2 border-dashed border-amber-100/30 rounded-md pointer-events-none"}),(0,t.jsx)("div",{className:"absolute inset-0.5 border border-white/10 rounded-lg pointer-events-none"})]}),(0,t.jsxs)("div",{className:"relative flex items-center justify-between px-6 py-3 md:px-8 lg:px-12 xl:px-20 md:py-3 xl:py-4",children:[(0,t.jsxs)(o.default,{href:"/",className:"group relative shrink-0 transition-transform hover:scale-105 active:scale-95",onClick:()=>x(!1),children:[(0,t.jsx)("div",{className:"absolute inset-0 -z-10 flex items-center justify-center overflow",children:(0,t.jsx)("div",{className:f("w-16 h-16 md:w-16 md:h-16 xl:w-20 xl:h-5 rounded-full blur-3xl opacity-100 transition-colors duration-700",e?"bg-linear-to-r from-cyan-400 via-blue-300 to-cyan-500":"bg-linear-to-r from-amber-400 via-yellow-300 to-amber-500")})}),(0,t.jsx)("div",{className:"relative w-12 h-12 md:w-12 md:h-12 xl:w-14 xl:h-14",children:(0,t.jsx)(s.default,{src:"/logos/logowithglow.webp",alt:"Hackfest Logo",fill:!0,className:"object-contain drop-shadow-[0_0_12px_rgba(255,191,0,0.7)]"})})]}),(0,t.jsx)("div",{className:"hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8",children:h.map(r=>{let n=c===r.href;return(0,t.jsxs)(o.default,{href:r.href,className:f("relative font-pirate text-lg xl:text-xl font-bold tracking-wide transition-colors duration-500",n?e?"text-cyan-400 shadow-cyan-500/50 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]":"text-amber-400 shadow-amber-500/50 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]":e?"text-cyan-100/70 hover:text-white":"text-amber-100/80 hover:text-white"),children:[r.name,(0,t.jsx)("span",{className:f("absolute -bottom-1 left-0 h-0.5 w-full transition-transform duration-300 origin-left scale-x-0 rounded-full opacity-100",e?"bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]":"bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]",n&&"scale-x-100","group-hover:scale-x-100")})]},r.name)})}),(0,t.jsx)("div",{className:"hidden md:flex items-center gap-4",children:(0,t.jsx)(m,{session:r,authType:a,isUnderwater:e})}),(0,t.jsx)("button",{type:"button",onClick:()=>x(!p),className:"md:hidden relative z-20 p-2 focus:outline-none",children:(0,t.jsxs)("div",{className:"flex flex-col gap-1.5 justify-center items-center w-8",children:[(0,t.jsx)("span",{className:f("block h-0.5 w-full rounded-full transition-all duration-300",e?"bg-cyan-400":"bg-amber-400",p?"rotate-45 translate-y-2":"")}),(0,t.jsx)("span",{className:f("block h-0.5 w-full rounded-full transition-all duration-300",e?"bg-cyan-400":"bg-amber-400",p?"opacity-0":"")}),(0,t.jsx)("span",{className:f("block h-0.5 w-full rounded-full transition-all duration-300",e?"bg-cyan-400":"bg-amber-400",p?"-rotate-45 -translate-y-2":"")})]})})]}),(0,t.jsx)(n.AnimatePresence,{children:p&&(0,t.jsx)(i.motion.div,{initial:{height:0,opacity:0},animate:{height:"auto",opacity:1},exit:{height:0,opacity:0},transition:{duration:.3,ease:"easeInOut"},className:"md:hidden overflow-hidden border-t border-white/10",children:(0,t.jsxs)("div",{className:"flex flex-col items-center gap-6 pb-8 pt-4",children:[h.map(r=>{let n=c===r.href;return(0,t.jsx)(o.default,{href:r.href,onClick:()=>x(!1),className:f("text-xl lg:text-2xl font-pirate font-bold tracking-widest uppercase transition-colors",n?e?"text-cyan-400":"text-amber-400":e?"text-cyan-100/70":"text-amber-100/80"),children:r.name},r.name)}),(0,t.jsx)("div",{className:"mt-2 flex flex-col items-center gap-4",children:(0,t.jsx)(m,{session:r,authType:a,isUnderwater:e,onNavigate:()=>x(!1)})})]})})})]})}function m({session:r,authType:n,isUnderwater:i,onNavigate:s}){let u=(0,l.usePathname)(),c="event"===n,h=!!r?.user,v="/",m="";c?(v=h?"/events":"/events/login",m=h?r?.user?.name?.split(" ")[0]||"Profile":"Event Login"):(v=h&&r?.user?.isRegistrationComplete?"/teams":"/register",m=h&&r?.user?.isRegistrationComplete?"Your Team":"Register Now");let p=f("group relative px-4 py-1.5 xl:px-6 xl:py-2 font-pirate text-base xl:text-lg font-bold transition-all duration-500 cursor-pointer",i?"text-cyan-100 hover:text-white":"text-amber-100 hover:text-white"),x=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)("div",{className:f("absolute inset-0 border rounded-md transition-all duration-500",i?"border-cyan-400/40 bg-cyan-900/20 group-hover:bg-cyan-900/40":"border-amber-200/40 bg-white/5 group-hover:bg-white/10")}),(0,t.jsx)("div",{className:f("absolute inset-0.75 border rounded-sm opacity-50 transition-colors duration-500",i?"border-cyan-200/20":"border-amber-200/20")})]});return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.default,{href:v,onClick:s,children:(0,t.jsxs)("button",{type:"button",className:p,children:[x,(0,t.jsx)("span",{className:"relative z-10 drop-shadow-sm",children:m})]})}),h&&(0,t.jsx)("button",{type:"button",onClick:async()=>{if(c){let{signOutOfGoogle:t}=await e.A(441341);t(u)}else(0,d.signOutOfGitHub)(u)},className:f("p-2 rounded-md transition-colors duration-300",i?"text-cyan-400 hover:text-cyan-100 hover:bg-cyan-900/20":"text-amber-400 hover:text-amber-100 hover:bg-amber-900/20"),title:"Logout",children:(0,t.jsx)(a.LogOut,{className:"w-5 h-5"})})]})}e.s(["Navbar",()=>v])},380071,e=>{"use strict";let t=(0,e.i(514514).default)("trophy",[["path",{d:"M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",key:"1n3hpd"}],["path",{d:"M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",key:"rfe1zi"}],["path",{d:"M18 9h1.5a1 1 0 0 0 0-5H18",key:"7xy6bh"}],["path",{d:"M4 22h16",key:"57wxv0"}],["path",{d:"M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",key:"1mhfuq"}],["path",{d:"M6 9H4.5a1 1 0 0 1 0-5H6",key:"tex48p"}]]);e.s(["Trophy",()=>t],380071)},123917,e=>{"use strict";let t=(0,e.i(514514).default)("anchor",[["path",{d:"M12 6v16",key:"nqf5sj"}],["path",{d:"m19 13 2-1a9 9 0 0 1-18 0l2 1",key:"y7qv08"}],["path",{d:"M9 11h6",key:"1fldmi"}],["circle",{cx:"12",cy:"4",r:"2",key:"muu5ef"}]]);e.s(["Anchor",()=>t],123917)},887301,e=>{"use strict";let t=(0,e.i(514514).default)("ship",[["path",{d:"M12 10.189V14",key:"1p8cqu"}],["path",{d:"M12 2v3",key:"qbqxhf"}],["path",{d:"M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6",key:"qpkstq"}],["path",{d:"M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76",key:"7tigtc"}],["path",{d:"M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",key:"1924j5"}]]);e.s(["Ship",()=>t],887301)},726422,e=>{"use strict";var t=e.i(142496),r=e.i(718439),n=e.i(313999),i=e.i(757535);function a(e){let a=(0,i.useConstant)(()=>(0,t.motionValue)(e)),{isStatic:s}=(0,r.useContext)(n.MotionConfigContext);if(s){let[,t]=(0,r.useState)(e);(0,r.useEffect)(()=>a.on("change",t),[])}return a}e.s(["useMotionValue",()=>a])},84741,e=>{"use strict";e.i(142496);var t=e.i(987400),r=e.i(865722),n=e.i(468670);function i(e,s,o={}){let l,u=e.get(),c=null,d=u,f="string"==typeof u?u.replace(/[\d.-]/g,""):void 0,h=()=>{c&&(c.stop(),c=null)};if(e.attach((r,i)=>{d=r,l=e=>{var t,r;return i((t=e,(r=f)?t+r:t))},n.frame.postRender(()=>{let r,n;h(),r=a(e.get()),r!==(n=a(d))&&(c=new t.JSAnimation({keyframes:[r,n],velocity:e.getVelocity(),type:"spring",restDelta:.001,restSpeed:.01,...o,onUpdate:l})),e.events.animationStart?.notify(),c?.then(()=>{e.events.animationComplete?.notify()})})},h),(0,r.isMotionValue)(s)){let t=s.on("change",t=>{var r,n;return e.set((r=t,(n=f)?r+n:r))}),r=e.on("destroy",t);return()=>{t(),r()}}return h}function a(e){return"number"==typeof e?e:parseFloat(e)}e.s(["attachFollow",()=>i])},994585,34633,e=>{"use strict";var t=e.i(84741),r=e.i(865722),n=e.i(718439),i=e.i(313999),a=e.i(726422),s=e.i(280189),o=e.i(757535),l=e.i(468670),u=e.i(381993);function c(e,t){let r=(0,a.useMotionValue)(t()),n=()=>r.set(t());return n(),(0,u.useIsomorphicLayoutEffect)(()=>{let t=()=>l.frame.preRender(n,!1,!0),r=e.map(e=>e.on("change",t));return()=>{r.forEach(e=>e()),(0,l.cancelFrame)(n)}}),r}var d=e.i(142496);function f(e,t,r,n){if("function"==typeof e){let t;return d.collectMotionValues.current=[],e(),t=c(d.collectMotionValues.current,e),d.collectMotionValues.current=void 0,t}if(void 0!==r&&!Array.isArray(r)&&"function"!=typeof t){var i=e,a=t,l=r,u=n;let s=(0,o.useConstant)(()=>Object.keys(l)),c=(0,o.useConstant)(()=>({}));for(let e of s)c[e]=f(i,a,l[e],u);return c}let v="function"==typeof t?t:function(...e){let t=!Array.isArray(e[0]),r=t?0:-1,n=e[0+r],i=e[1+r],a=e[2+r],o=e[3+r],l=(0,s.interpolate)(i,a,o);return t?l(n):l}(t,r,n);return Array.isArray(e)?h(e,v):h([e],([e])=>v(e))}function h(e,t){let r=(0,o.useConstant)(()=>[]);return c(e,()=>{r.length=0;let n=e.length;for(let t=0;t<n;t++)r[t]=e[t].get();return t(r)})}function v(e,s={}){return function(e,s={}){let{isStatic:o}=(0,n.useContext)(i.MotionConfigContext),l=()=>(0,r.isMotionValue)(e)?e.get():e;if(o)return f(l);let u=(0,a.useMotionValue)(l());return(0,n.useInsertionEffect)(()=>(0,t.attachFollow)(u,e,s),[u,JSON.stringify(s)]),u}(e,{type:"spring",...s})}e.s(["useTransform",()=>f],34633),e.s(["useSpring",()=>v],994585)},441341,e=>{e.v(t=>Promise.all(["static/chunks/e8dcc2108b5baefa.js"].map(t=>e.l(t))).then(()=>t(444153)))}]);