import{ad as h,ae as D,af as M}from"./vendor-Bu7n6oz_.js";/*!
 * (C) Ionic http://ionicframework.com - MIT License
 */const k=(n,m,g,p,X)=>{const c=n.ownerDocument.defaultView;let s=h(n);const w=t=>{const{startX:e}=t;return s?e>=c.innerWidth-50:e<=50},i=t=>s?-t.deltaX:t.deltaX,f=t=>s?-t.velocityX:t.velocityX;return D({el:n,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:t=>(s=h(n),w(t)&&m()),onStart:g,onMove:t=>{const e=i(t)/c.innerWidth;p(e)},onEnd:t=>{const o=i(t),e=c.innerWidth,r=o/e,a=f(t),v=e/2,l=a>=0&&(a>.2||o>v),d=(l?1-r:r)*e;let u=0;if(d>5){const y=d/Math.abs(a);u=Math.min(y,540)}X(l,r<=0?.01:M(0,r,.9999),u)}})};export{k as createSwipeBackGesture};
//# sourceMappingURL=swipe-back-BOzRl9sF.js.map
