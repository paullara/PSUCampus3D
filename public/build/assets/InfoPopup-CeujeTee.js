import{r as a,j as e}from"./app-C6JDbxEX.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const j=o=>o.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),k=o=>o.replace(/^([A-Z])|[\s-_]+(\w)/g,(n,t,i)=>i?i.toUpperCase():t.toLowerCase()),u=o=>{const n=k(o);return n.charAt(0).toUpperCase()+n.slice(1)},f=(...o)=>o.filter((n,t,i)=>!!n&&n.trim()!==""&&i.indexOf(n)===t).join(" ").trim(),C=o=>{for(const n in o)if(n.startsWith("aria-")||n==="role"||n==="title")return!0};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=a.forwardRef(({color:o="currentColor",size:n=24,strokeWidth:t=2,absoluteStrokeWidth:i,className:s="",children:c,iconNode:g,...h},v)=>a.createElement("svg",{ref:v,...w,width:n,height:n,stroke:o,strokeWidth:i?Number(t)*24/Number(n):t,className:f("lucide",s),...!c&&!C(h)&&{"aria-hidden":"true"},...h},[...g.map(([y,b])=>a.createElement(y,b)),...Array.isArray(c)?c:[c]]));/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=(o,n)=>{const t=a.forwardRef(({className:i,...s},c)=>a.createElement(_,{ref:c,iconNode:n,className:f(`lucide-${j(u(o))}`,`lucide-${o}`,i),...s}));return t.displayName=u(o),t};/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $=[["path",{d:"m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",key:"1yiouv"}],["circle",{cx:"12",cy:"8",r:"6",key:"1vp47v"}]],A=p("award",$);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],B=p("bell",S);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=[["path",{d:"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",key:"jecpp"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]],E=p("briefcase",z);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M12 6v6l4 2",key:"mmk7yg"}],["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}]],P=p("clock",L);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],I=p("map-pin",R),r="#003366",d="#FFB81C",M="#E8F0F7";function N({popupInfo:o,onClose:n}){if(!o)return null;const t=o,[i,s]=a.useState("events");return e.jsxs("div",{style:{display:"flex",flexDirection:"column",height:"100%"},children:[e.jsxs("div",{style:{background:`linear-gradient(135deg, ${r} 0%, ${r}dd 100%)`,padding:"12px",borderRadius:"8px 8px 0 0",borderBottom:`3px solid ${d}`,display:"flex",alignItems:"center",gap:12},children:[e.jsx(I,{size:24,color:d}),e.jsx("h3",{style:{fontWeight:700,color:d,fontSize:18,margin:0},children:t.name})]}),t.description&&e.jsx("div",{style:{padding:"10px 12px",background:M,color:"#333",borderLeft:`4px solid ${d}`,fontSize:14,lineHeight:1.5},children:t.description}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(110px, 1fr))",gap:10,padding:"10px 6px"},children:[e.jsx(x,{label:"Events",icon:e.jsx(P,{size:16}),active:i==="events",onClick:()=>s("events")}),e.jsx(x,{label:"Achievements",icon:e.jsx(A,{size:16}),active:i==="achievements",onClick:()=>s("achievements")}),e.jsx(x,{label:"Services",icon:e.jsx(E,{size:16}),active:i==="services",onClick:()=>s("services")}),e.jsx(x,{label:"Announcements",icon:e.jsx(B,{size:16}),active:i==="announcements",onClick:()=>s("announcements")})]}),e.jsxs("div",{style:{flex:1,overflowY:"auto",padding:"0 6px"},children:[i==="events"&&e.jsxs(e.Fragment,{children:[t.happenings&&e.jsx(l,{title:"Happenings",children:t.happenings}),t.picture&&e.jsx(m,{src:t.picture,alt:"Event"}),t.video&&e.jsx(l,{title:"Video",children:e.jsx("video",{src:t.video,controls:!0,style:{width:"100%",borderRadius:8,border:`2px solid ${r}`}})})]}),i==="achievements"&&e.jsxs(e.Fragment,{children:[t.achievements&&e.jsx(l,{title:"Achievements",children:t.achievements}),t.achievement_pic&&e.jsx(m,{src:t.achievement_pic,alt:"Achievement"})]}),i==="services"&&e.jsx(l,{title:"Services",children:t.services||"No services available."}),i==="announcements"&&e.jsx(l,{title:"Announcements",children:t.announcements||"No announcements yet."})]}),e.jsx("button",{onClick:n,style:{marginTop:12,width:"100%",background:"#fff",color:r,border:`2px solid ${r}`,padding:"12px 16px",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600},children:"Close"})]})}function x({label:o,icon:n,active:t,onClick:i}){return e.jsxs("button",{onClick:i,style:{padding:"14px 10px",borderRadius:10,border:"none",fontWeight:600,cursor:"pointer",background:t?r:"#ffffff",color:t?"#fff":r,display:"flex",flexDirection:"column",alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.15)",fontSize:13},children:[n,e.jsx("span",{style:{marginTop:4},children:o})]})}function l({title:o,children:n}){return e.jsxs("div",{style:{marginBottom:16},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,color:r,textTransform:"uppercase",marginBottom:6},children:o}),e.jsx("div",{style:{padding:12,borderRadius:6,background:"#fff",border:`1.5px solid ${d}`,color:"#333"},children:n})]})}function m({src:o,alt:n}){return e.jsx("div",{style:{width:"100%",height:200,borderRadius:8,overflow:"hidden",marginBottom:16,border:`2px solid ${r}`},children:e.jsx("img",{src:o,alt:n,style:{width:"100%",height:"100%",objectFit:"cover"}})})}const F=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"}));export{N as I,I as M,F as a};
