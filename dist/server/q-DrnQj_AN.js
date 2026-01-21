import{D as K,E as m,G as ae,H as ce,F as V,I as le}from"./q-Ces0aPyk.js";const z={manifestHash:"z8m5ph",core:"q-BedHIPOG.js",preloader:"q-DoNi8vyY.js",qwikLoader:"q-naDMFAHy.js",bundleGraphAsset:"assets/CovML5Jb-bundle-graph.json",injections:[{tag:"style",location:"head",attributes:{"data-src":"/assets/CKkmF1yW-style.css",dangerouslySetInnerHTML:`*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;line-height:1.6;color:#333}
`}}],mapping:{s_tUmacdcPjy0:"q-Dje1XItA.js"}};/**
 * @license
 * @builder.io/qwik/server 1.18.0
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/QwikDev/qwik/blob/main/LICENSE
 */var ue=(t=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(t,{get:(e,n)=>(typeof require<"u"?require:e)[n]}):t)(function(t){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+t+'" is not supported')}),fe="<sync>";function Y(t,e){const n=e==null?void 0:e.mapper,r=t.symbolMapper?t.symbolMapper:(o,s,a)=>{var l;if(n){const u=N(o),c=n[u];if(!c){if(u===fe)return[u,""];if((l=globalThis.__qwik_reg_symbols)==null?void 0:l.has(u))return[o,"_"];if(a)return[o,`${a}?qrl=${o}`];console.error("Cannot resolve symbol",o,"in",n,a)}return c}};return{isServer:!0,async importSymbol(o,s,a){var y;const l=N(a),u=(y=globalThis.__qwik_reg_symbols)==null?void 0:y.get(l);if(u)return u;let c=String(s);c.endsWith(".js")||(c+=".js");const p=ue(c);if(!(a in p))throw new Error(`Q-ERROR: missing symbol '${a}' in module '${c}'.`);return p[a]},raf:()=>(console.error("server can not rerender"),Promise.resolve()),nextTick:o=>new Promise(s=>{setTimeout(()=>{s(o())})}),chunkForSymbol(o,s,a){return r(o,n,a)}}}async function de(t,e){const n=Y(t,e);K(n)}var N=t=>{const e=t.lastIndexOf("_");return e>-1?t.slice(e+1):t},me="q:instance",O={$DEBUG$:!1,$invPreloadProbability$:.65},pe=Date.now(),be=/\.[mc]?js$/,X=0,he=1,ye=2,ve=3,T,B,ge=(t,e)=>({$name$:t,$state$:be.test(t)?X:ve,$deps$:M?e==null?void 0:e.map(n=>({...n,$factor$:1})):e,$inverseProbability$:1,$createdTs$:Date.now(),$waitedMs$:0,$loadedMs$:0}),we=t=>{const e=new Map;let n=0;for(;n<t.length;){const r=t[n++],i=[];let o,s=1;for(;o=t[n],typeof o=="number";)o<0?s=-o/10:i.push({$name$:t[o],$importProbability$:s,$factor$:1}),n++;e.set(r,i)}return e},Z=t=>{let e=D.get(t);if(!e){let n;if(B){if(n=B.get(t),!n)return;n.length||(n=void 0)}e=ge(t,n),D.set(t,e)}return e},$e=(t,e)=>{e&&("debug"in e&&(O.$DEBUG$=!!e.debug),typeof e.preloadProbability=="number"&&(O.$invPreloadProbability$=1-e.preloadProbability)),!(T!=null||!t)&&(T="",B=we(t))},D=new Map,M,x,ee=0,E=[],qe=(...t)=>{console.log(`Preloader ${Date.now()-pe}ms ${ee}/${E.length} queued>`,...t)},_e=()=>{D.clear(),x=!1,M=!0,ee=0,E.length=0},Pe=()=>{x&&(E.sort((t,e)=>t.$inverseProbability$-e.$inverseProbability$),x=!1)},Ee=()=>{Pe();let t=.4;const e=[];for(const n of E){const r=Math.round((1-n.$inverseProbability$)*10);r!==t&&(t=r,e.push(t)),e.push(n.$name$)}return e},te=(t,e,n)=>{if(n!=null&&n.has(t))return;const r=t.$inverseProbability$;if(t.$inverseProbability$=e,!(r-t.$inverseProbability$<.01)&&(T!=null&&t.$state$<ye&&(t.$state$===X&&(t.$state$=he,E.push(t),O.$DEBUG$&&qe(`queued ${Math.round((1-t.$inverseProbability$)*100)}%`,t.$name$)),x=!0),t.$deps$)){n||(n=new Set),n.add(t);const i=1-t.$inverseProbability$;for(const o of t.$deps$){const s=Z(o.$name$);if(s.$inverseProbability$===0)continue;let a;if(i===1||i>=.99&&j<100)j++,a=Math.min(.01,1-o.$importProbability$);else{const l=1-o.$importProbability$*i,u=o.$factor$,c=l/u;a=Math.max(.02,s.$inverseProbability$*c),o.$factor$=c}te(s,a,n)}}},W=(t,e)=>{const n=Z(t);n&&n.$inverseProbability$>e&&te(n,e)},j,Se=(t,e)=>{if(!(t!=null&&t.length))return;j=0;let n=e?1-e:.4;if(Array.isArray(t))for(let r=t.length-1;r>=0;r--){const i=t[r];typeof i=="number"?n=1-i/10:W(i,n)}else W(t,n)};function ke(t){const e=[],n=r=>{if(r)for(const i of r)e.includes(i.url)||(e.push(i.url),i.imports&&n(i.imports))};return n(t),e}var Ae=t=>{var n;const e=le();return(n=t==null?void 0:t.qrls)==null?void 0:n.map(r=>{var a;const i=r.$refSymbol$||r.$symbol$,o=r.$chunk$,s=e.chunkForSymbol(i,o,(a=r.dev)==null?void 0:a.file);return s?s[1]:o}).filter(Boolean)};function Ne(t,e,n){const r=e.prefetchStrategy;if(r===null)return[];if(!(n!=null&&n.manifest.bundleGraph))return Ae(t);if(typeof(r==null?void 0:r.symbolsToPrefetch)=="function")try{const o=r.symbolsToPrefetch({manifest:n.manifest});return ke(o)}catch(o){console.error("getPrefetchUrls, symbolsToPrefetch()",o)}const i=new Set;for(const o of(t==null?void 0:t.qrls)||[]){const s=N(o.$refSymbol$||o.$symbol$);s&&s.length>=10&&i.add(s)}return[...i]}var xe=(t,e)=>{if(!(e!=null&&e.manifest.bundleGraph))return[...new Set(t)];_e();let n=.99;for(const r of t.slice(0,15))Se(r,n),n*=.85;return Ee()},R=(t,e)=>{if(e==null)return null;const n=`${t}${e}`.split("/"),r=[];for(const i of n)i===".."&&r.length>0?r.pop():r.push(i);return r.join("/")},Ce=(t,e,n,r,i)=>{var l;const o=R(t,(l=e==null?void 0:e.manifest)==null?void 0:l.preloader),s="/"+(e==null?void 0:e.manifest.bundleGraphAsset);if(o&&s&&n!==!1){const u=typeof n=="object"?{debug:n.debug,preloadProbability:n.ssrPreloadProbability}:void 0;$e(e==null?void 0:e.manifest.bundleGraph,u);const c=[];n!=null&&n.debug&&c.push("d:1"),n!=null&&n.maxIdlePreloads&&c.push(`P:${n.maxIdlePreloads}`),n!=null&&n.preloadProbability&&c.push(`Q:${n.preloadProbability}`);const p=c.length?`,{${c.join(",")}}`:"",y=`let b=fetch("${s}");import("${o}").then(({l})=>l(${JSON.stringify(t)},b${p}));`;r.push(m("link",{rel:"modulepreload",href:o,nonce:i,crossorigin:"anonymous"}),m("link",{rel:"preload",href:s,as:"fetch",crossorigin:"anonymous",nonce:i}),m("script",{type:"module",async:!0,dangerouslySetInnerHTML:y,nonce:i}))}const a=R(t,e==null?void 0:e.manifest.core);a&&r.push(m("link",{rel:"modulepreload",href:a,nonce:i}))},Ie=(t,e,n,r,i)=>{if(r.length===0||n===!1)return null;const{ssrPreloads:o,ssrPreloadProbability:s}=Oe(typeof n=="boolean"?void 0:n);let a=o;const l=[],u=[],c=e==null?void 0:e.manifest.manifestHash;if(a){const g=e==null?void 0:e.manifest.preloader,f=e==null?void 0:e.manifest.core,h=xe(r,e);let _=4;const S=s*10;for(const v of h)if(typeof v=="string"){if(_<S)break;if(v===g||v===f)continue;if(u.push(v),--a===0)break}else _=v}const p=R(t,c&&(e==null?void 0:e.manifest.preloader));let q=u.length?`${JSON.stringify(u)}.map((l,e)=>{e=document.createElement('link');e.rel='modulepreload';e.href=${JSON.stringify(t)}+l;document.head.appendChild(e)});`:"";return p&&(q+=`window.addEventListener('load',f=>{f=_=>import("${p}").then(({p})=>p(${JSON.stringify(r)}));try{requestIdleCallback(f,{timeout:2000})}catch(e){setTimeout(f,200)}})`),q&&l.push(m("script",{type:"module","q:type":"preload",async:!0,dangerouslySetInnerHTML:q,nonce:i})),l.length>0?m(V,{children:l}):null},Le=(t,e,n,r,i)=>{var o;if(n.preloader!==!1){const s=Ne(e,n,r);if(s.length>0){const a=Ie(t,r,n.preloader,s,(o=n.serverData)==null?void 0:o.nonce);a&&i.push(a)}}};function Oe(t){return{...Te,...t}}var Te={ssrPreloads:7,ssrPreloadProbability:.5,debug:!1,maxIdlePreloads:25,preloadProbability:.35},Be='const t=document,e=window,n=new Set,o=new Set([t]);let r;const s=(t,e)=>Array.from(t.querySelectorAll(e)),a=t=>{const e=[];return o.forEach(n=>e.push(...s(n,t))),e},i=t=>{w(t),s(t,"[q\\\\:shadowroot]").forEach(t=>{const e=t.shadowRoot;e&&i(e)})},c=t=>t&&"function"==typeof t.then,l=(t,e,n=e.type)=>{a("[on"+t+"\\\\:"+n+"]").forEach(o=>{b(o,t,e,n)})},f=e=>{if(void 0===e._qwikjson_){let n=(e===t.documentElement?t.body:e).lastElementChild;for(;n;){if("SCRIPT"===n.tagName&&"qwik/json"===n.getAttribute("type")){e._qwikjson_=JSON.parse(n.textContent.replace(/\\\\x3C(\\/?script)/gi,"<$1"));break}n=n.previousElementSibling}}},p=(t,e)=>new CustomEvent(t,{detail:e}),b=async(e,n,o,r=o.type)=>{const s="on"+n+":"+r;e.hasAttribute("preventdefault:"+r)&&o.preventDefault(),e.hasAttribute("stoppropagation:"+r)&&o.stopPropagation();const a=e._qc_,i=a&&a.li.filter(t=>t[0]===s);if(i&&i.length>0){for(const t of i){const n=t[1].getFn([e,o],()=>e.isConnected)(o,e),r=o.cancelBubble;c(n)&&await n,r&&o.stopPropagation()}return}const l=e.getAttribute(s);if(l){const n=e.closest("[q\\\\:container]"),r=n.getAttribute("q:base"),s=n.getAttribute("q:version")||"unknown",a=n.getAttribute("q:manifest-hash")||"dev",i=new URL(r,t.baseURI);for(const p of l.split("\\n")){const l=new URL(p,i),b=l.href,h=l.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",q=performance.now();let _,d,y;const w=p.startsWith("#"),g={qBase:r,qManifest:a,qVersion:s,href:b,symbol:h,element:e,reqTime:q};if(w){const e=n.getAttribute("q:instance");_=(t["qFuncs_"+e]||[])[Number.parseInt(h)],_||(d="sync",y=Error("sym:"+h))}else{u("qsymbol",g);const t=l.href.split("#")[0];try{const e=import(t);f(n),_=(await e)[h],_||(d="no-symbol",y=Error(`${h} not in ${t}`))}catch(t){d||(d="async"),y=t}}if(!_){u("qerror",{importError:d,error:y,...g}),console.error(y);break}const m=t.__q_context__;if(e.isConnected)try{t.__q_context__=[e,o,l];const n=_(o,e);c(n)&&await n}catch(t){u("qerror",{error:t,...g})}finally{t.__q_context__=m}}}},u=(e,n)=>{t.dispatchEvent(p(e,n))},h=t=>t.replace(/([A-Z])/g,t=>"-"+t.toLowerCase()),q=async t=>{let e=h(t.type),n=t.target;for(l("-document",t,e);n&&n.getAttribute;){const o=b(n,"",t,e);let r=t.cancelBubble;c(o)&&await o,r||(r=r||t.cancelBubble||n.hasAttribute("stoppropagation:"+t.type)),n=t.bubbles&&!0!==r?n.parentElement:null}},_=t=>{l("-window",t,h(t.type))},d=()=>{const s=t.readyState;if(!r&&("interactive"==s||"complete"==s)&&(o.forEach(i),r=1,u("qinit"),(e.requestIdleCallback??e.setTimeout).bind(e)(()=>u("qidle")),n.has("qvisible"))){const t=a("[on\\\\:qvisible]"),e=new IntersectionObserver(t=>{for(const n of t)n.isIntersecting&&(e.unobserve(n.target),b(n.target,"",p("qvisible",n)))});t.forEach(t=>e.observe(t))}},y=(t,e,n,o=!1)=>{t.addEventListener(e,n,{capture:o,passive:!1})},w=(...t)=>{for(const r of t)"string"==typeof r?n.has(r)||(o.forEach(t=>y(t,r,q,!0)),y(e,r,_,!0),n.add(r)):o.has(r)||(n.forEach(t=>y(r,t,q,!0)),o.add(r))};if(!("__q_context__"in t)){t.__q_context__=0;const r=e.qwikevents;r&&(Array.isArray(r)?w(...r):w("click","input")),e.qwikevents={events:n,roots:o,push:w},y(t,"readystatechange",d),d()}',De=`const doc = document;
const win = window;
const events = /* @__PURE__ */ new Set();
const roots = /* @__PURE__ */ new Set([doc]);
let hasInitialized;
const nativeQuerySelectorAll = (root, selector) => Array.from(root.querySelectorAll(selector));
const querySelectorAll = (query) => {
  const elements = [];
  roots.forEach((root) => elements.push(...nativeQuerySelectorAll(root, query)));
  return elements;
};
const findShadowRoots = (fragment) => {
  processEventOrNode(fragment);
  nativeQuerySelectorAll(fragment, "[q\\\\:shadowroot]").forEach((parent) => {
    const shadowRoot = parent.shadowRoot;
    shadowRoot && findShadowRoots(shadowRoot);
  });
};
const isPromise = (promise) => promise && typeof promise.then === "function";
const broadcast = (infix, ev, type = ev.type) => {
  querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((el) => {
    dispatch(el, infix, ev, type);
  });
};
const resolveContainer = (containerEl) => {
  if (containerEl._qwikjson_ === void 0) {
    const parentJSON = containerEl === doc.documentElement ? doc.body : containerEl;
    let script = parentJSON.lastElementChild;
    while (script) {
      if (script.tagName === "SCRIPT" && script.getAttribute("type") === "qwik/json") {
        containerEl._qwikjson_ = JSON.parse(
          script.textContent.replace(/\\\\x3C(\\/?script)/gi, "<$1")
        );
        break;
      }
      script = script.previousElementSibling;
    }
  }
};
const createEvent = (eventName, detail) => new CustomEvent(eventName, {
  detail
});
const dispatch = async (element, onPrefix, ev, eventName = ev.type) => {
  const attrName = "on" + onPrefix + ":" + eventName;
  if (element.hasAttribute("preventdefault:" + eventName)) {
    ev.preventDefault();
  }
  if (element.hasAttribute("stoppropagation:" + eventName)) {
    ev.stopPropagation();
  }
  const ctx = element._qc_;
  const relevantListeners = ctx && ctx.li.filter((li) => li[0] === attrName);
  if (relevantListeners && relevantListeners.length > 0) {
    for (const listener of relevantListeners) {
      const results = listener[1].getFn([element, ev], () => element.isConnected)(ev, element);
      const cancelBubble = ev.cancelBubble;
      if (isPromise(results)) {
        await results;
      }
      if (cancelBubble) {
        ev.stopPropagation();
      }
    }
    return;
  }
  const attrValue = element.getAttribute(attrName);
  if (attrValue) {
    const container = element.closest("[q\\\\:container]");
    const qBase = container.getAttribute("q:base");
    const qVersion = container.getAttribute("q:version") || "unknown";
    const qManifest = container.getAttribute("q:manifest-hash") || "dev";
    const base = new URL(qBase, doc.baseURI);
    for (const qrl of attrValue.split("\\n")) {
      const url = new URL(qrl, base);
      const href = url.href;
      const symbol = url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";
      const reqTime = performance.now();
      let handler;
      let importError;
      let error;
      const isSync = qrl.startsWith("#");
      const eventData = {
        qBase,
        qManifest,
        qVersion,
        href,
        symbol,
        element,
        reqTime
      };
      if (isSync) {
        const hash = container.getAttribute("q:instance");
        handler = (doc["qFuncs_" + hash] || [])[Number.parseInt(symbol)];
        if (!handler) {
          importError = "sync";
          error = new Error("sym:" + symbol);
        }
      } else {
        emitEvent("qsymbol", eventData);
        const uri = url.href.split("#")[0];
        try {
          const module = import(
                        uri
          );
          resolveContainer(container);
          handler = (await module)[symbol];
          if (!handler) {
            importError = "no-symbol";
            error = new Error(\`\${symbol} not in \${uri}\`);
          }
        } catch (err) {
          importError || (importError = "async");
          error = err;
        }
      }
      if (!handler) {
        emitEvent("qerror", {
          importError,
          error,
          ...eventData
        });
        console.error(error);
        break;
      }
      const previousCtx = doc.__q_context__;
      if (element.isConnected) {
        try {
          doc.__q_context__ = [element, ev, url];
          const results = handler(ev, element);
          if (isPromise(results)) {
            await results;
          }
        } catch (error2) {
          emitEvent("qerror", { error: error2, ...eventData });
        } finally {
          doc.__q_context__ = previousCtx;
        }
      }
    }
  }
};
const emitEvent = (eventName, detail) => {
  doc.dispatchEvent(createEvent(eventName, detail));
};
const camelToKebab = (str) => str.replace(/([A-Z])/g, (a) => "-" + a.toLowerCase());
const processDocumentEvent = async (ev) => {
  let type = camelToKebab(ev.type);
  let element = ev.target;
  broadcast("-document", ev, type);
  while (element && element.getAttribute) {
    const results = dispatch(element, "", ev, type);
    let cancelBubble = ev.cancelBubble;
    if (isPromise(results)) {
      await results;
    }
    cancelBubble || (cancelBubble = cancelBubble || ev.cancelBubble || element.hasAttribute("stoppropagation:" + ev.type));
    element = ev.bubbles && cancelBubble !== true ? element.parentElement : null;
  }
};
const processWindowEvent = (ev) => {
  broadcast("-window", ev, camelToKebab(ev.type));
};
const processReadyStateChange = () => {
  const readyState = doc.readyState;
  if (!hasInitialized && (readyState == "interactive" || readyState == "complete")) {
    roots.forEach(findShadowRoots);
    hasInitialized = 1;
    emitEvent("qinit");
    const riC = win.requestIdleCallback ?? win.setTimeout;
    riC.bind(win)(() => emitEvent("qidle"));
    if (events.has("qvisible")) {
      const results = querySelectorAll("[on\\\\:qvisible]");
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            dispatch(entry.target, "", createEvent("qvisible", entry));
          }
        }
      });
      results.forEach((el) => observer.observe(el));
    }
  }
};
const addEventListener = (el, eventName, handler, capture = false) => {
  el.addEventListener(eventName, handler, { capture, passive: false });
};
const processEventOrNode = (...eventNames) => {
  for (const eventNameOrNode of eventNames) {
    if (typeof eventNameOrNode === "string") {
      if (!events.has(eventNameOrNode)) {
        roots.forEach(
          (root) => addEventListener(root, eventNameOrNode, processDocumentEvent, true)
        );
        addEventListener(win, eventNameOrNode, processWindowEvent, true);
        events.add(eventNameOrNode);
      }
    } else {
      if (!roots.has(eventNameOrNode)) {
        events.forEach(
          (eventName) => addEventListener(eventNameOrNode, eventName, processDocumentEvent, true)
        );
        roots.add(eventNameOrNode);
      }
    }
  }
};
if (!("__q_context__" in doc)) {
  doc.__q_context__ = 0;
  const qwikevents = win.qwikevents;
  if (qwikevents) {
    if (Array.isArray(qwikevents)) {
      processEventOrNode(...qwikevents);
    } else {
      processEventOrNode("click", "input");
    }
  }
  win.qwikevents = {
    events,
    roots,
    push: processEventOrNode
  };
  addEventListener(doc, "readystatechange", processReadyStateChange);
  processReadyStateChange();
}`;function je(t={}){return t.debug?De:Be}function L(){if(typeof performance>"u")return()=>0;const t=performance.now();return()=>(performance.now()-t)/1e6}function Re(t){let e=t.base;return typeof t.base=="function"&&(e=t.base(t)),typeof e=="string"?(e.endsWith("/")||(e+="/"),e):"/build/"}var Fe="<!DOCTYPE html>";async function Ke(t,e){var U,Q;let n=e.stream,r=0,i=0,o=0,s=0,a="",l;const u=((U=e.streaming)==null?void 0:U.inOrder)??{strategy:"auto",maximunInitialChunk:5e4,maximunChunk:3e4},c=e.containerTagName??"html",p=e.containerAttributes??{},y=n,q=L(),g=Re(e),f=ne(e.manifest),h=(Q=e.serverData)==null?void 0:Q.nonce;function _(){a&&(y.write(a),a="",r=0,o++,o===1&&(s=q()))}function S(d){const b=d.length;r+=b,i+=b,a+=d}switch(u.strategy){case"disabled":n={write:S};break;case"direct":n=y;break;case"auto":let d=0,b=!1;const G=u.maximunChunk??0,I=u.maximunInitialChunk??0;n={write(w){w==="<!--qkssr-f-->"?b||(b=!0):w==="<!--qkssr-pu-->"?d++:w==="<!--qkssr-po-->"?d--:S(w),d===0&&(b||r>=(o===0?I:G))&&(b=!1,_())}};break}c==="html"?n.write(Fe):n.write("<!--cq-->"),f||console.warn("Missing client manifest, loading symbols in the client might 404. Please ensure the client build has run and generated the manifest for the server build."),await de(e,f);const v=f==null?void 0:f.manifest.injections,k=v?v.map(d=>m(d.tag,d.attributes??{})):[];let A=e.qwikLoader?typeof e.qwikLoader=="object"?e.qwikLoader.include==="never"?2:0:e.qwikLoader==="inline"?1:e.qwikLoader==="never"?2:0:0;const C=f==null?void 0:f.manifest.qwikLoader;if(A===0&&!C&&(A=1),A===0)k.unshift(m("link",{rel:"modulepreload",href:`${g}${C}`,nonce:h}),m("script",{type:"module",async:!0,src:`${g}${C}`,nonce:h}));else if(A===1){const d=je({debug:e.debug});k.unshift(m("script",{id:"qwikloader",type:"module",async:!0,nonce:h,dangerouslySetInnerHTML:d}))}Ce(g,f,e.preloader,k,h);const re=L(),oe=[];let F=0,H=0;await ae(t,{stream:n,containerTagName:c,containerAttributes:p,serverData:e.serverData,base:g,beforeContent:k,beforeClose:async(d,b,G,I)=>{F=re();const w=L();l=await ce(d,b,void 0,I);const $=[];Le(g,l,e,f,$);const se=JSON.stringify(l.state,void 0,void 0);if($.push(m("script",{type:"qwik/json",dangerouslySetInnerHTML:Ue(se),nonce:h})),l.funcs.length>0){const P=p[me];$.push(m("script",{"q:func":"qwik/json",dangerouslySetInnerHTML:Je(P,l.funcs),nonce:h}))}const J=Array.from(b.$events$,P=>JSON.stringify(P));if(J.length>0){const P=`(window.qwikevents||(window.qwikevents=[])).push(${J.join(",")})`;$.push(m("script",{dangerouslySetInnerHTML:P,nonce:h}))}return Qe(oe,d),H=w(),m(V,{children:$})},manifestHash:(f==null?void 0:f.manifest.manifestHash)||"dev"+He()}),c!=="html"&&n.write("<!--/cq-->"),_();const ie=l.resources.some(d=>d._cache!==1/0);return{prefetchResources:void 0,snapshotResult:l,flushes:o,manifest:f==null?void 0:f.manifest,size:i,isStatic:!ie,timing:{render:F,snapshot:H,firstFlush:s}}}function He(){return Math.random().toString(36).slice(2)}function ne(t){const e=t?{...z,...t}:z;if(!e||"mapper"in e)return e;if(e.mapping){const n={};return Object.entries(e.mapping).forEach(([r,i])=>{n[N(r)]=[r,i]}),{mapper:n,manifest:e,injections:e.injections||[]}}}var Ue=t=>t.replace(/<(\/?script)/gi,"\\x3C$1");function Qe(t,e){var n;for(const r of e){const i=(n=r.$componentQrl$)==null?void 0:n.getSymbol();i&&!t.includes(i)&&t.push(i)}}var Ge='document["qFuncs_HASH"]=';function Je(t,e){return Ge.replace("HASH",t)+`[${e.join(`,
`)}]`}async function Ve(t){const e=Y({},ne(t));K(e)}export{z as m,Ke as r,Ve as s};
