/* 가톨릭길동무 PWA - cover-common.js
   커버 글자 크기, 문의·건의, PWA 설치 버튼 보조 로직을 담당합니다.
   기능 변경 없이 기존 window 공개 이름을 유지합니다.
*/
'use strict';

(function(){
  if(window.__APP_FONT_SCALE_GUARD__) return;
  window.__APP_FONT_SCALE_GUARD__=true;
  // 커버 글자 크기 조절은 prayer.js에 의존하지 않는 공통 함수가 담당한다.
  // prayer.js는 기도문 화면이 열렸을 때 같은 localStorage 값을 읽어 자체 UI를 맞춘다.
  var QA_URL="qa-firebase.html?v=V4-103";
  var FONT_KEY='prayer_font_size';
  var BASE=16;
  var FONT_SIZES=[13,14,15,16,17,18,19,20,21,22,24,26,28,30];
  function el(id){return document.getElementById(id)}
  function clampPx(px){
    px=parseInt(px,10);
    if(FONT_SIZES.indexOf(px)>=0) return px;
    return BASE;
  }
  function getPx(){ return clampPx(localStorage.getItem(FONT_KEY)||BASE); }
  function setPx(px){
    px=clampPx(px);
    try{ localStorage.setItem(FONT_KEY,String(px)); }catch(e){ console.warn("[가톨릭길동무]", e); }
    applyScale();
    return px;
  }
  function adjustSharedFont(delta){
    delta=parseInt(delta,10)||0;
    var cur=getPx();
    var idx=FONT_SIZES.indexOf(cur);
    if(idx<0) idx=FONT_SIZES.indexOf(BASE);
    var next=idx+delta;
    if(next<0) next=0;
    if(next>=FONT_SIZES.length) next=FONT_SIZES.length-1;
    return setPx(FONT_SIZES[next]);
  }
  function applyScale(){
    var px=getPx();
    var scale=px/BASE;
    document.documentElement.classList.add('oai-font-global');
    document.documentElement.style.setProperty('--app-font-scale',String(scale));
    var pv=el('prayer-view');
    if(pv){
      pv.style.setProperty('--pr-item-fs',px+'px');
      pv.style.setProperty('--pr-body-fs',px+'px');
      pv.style.setProperty('--pr-detail-fs',(px+1)+'px');
      pv.style.setProperty('--pr-icon-sz',Math.max(34,Math.round(px*2.2))+'px');
      pv.style.setProperty('--pr-icon-fs',Math.max(17,Math.round(px*1.2))+'px');
    }
    try{
      var df=el('diocese-frame');
      if(df && df.contentWindow && typeof df.contentWindow.dioApplySharedFont==='function') df.contentWindow.dioApplySharedFont();
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }
  window.__APP_getSharedFontPx=getPx;
  window.__APP_setSharedFontPx=setPx;
  window.__APP_adjustSharedFont=adjustSharedFont;
  window.__APP_applyGlobalFont=applyScale;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyScale, {once:true});
  else applyScale();
  window.addEventListener('load', applyScale, {once:true});
  function ensureCoverControls(){
    var cover=el('cover');
    if(!cover) return;
    var box=el('cover-font-controls');
    if(!box){
      box=document.createElement('div');
      box.id='cover-font-controls';
      cover.appendChild(box);
    }
    box.className='pr-font-ctrl';
    box.setAttribute('aria-label','글자 크기 조절');
    box.innerHTML='<button id="cover-sm-btn" class="pr-font-btn pr-sm" type="button" aria-label="글자 작게">가</button><div class="pr-font-divider"></div><button id="cover-lg-btn" class="pr-font-btn pr-lg" type="button" aria-label="글자 크게">가</button>';
    var sm=box.querySelector('.pr-sm'),lg=box.querySelector('.pr-lg');
    if(sm)sm.onclick=function(e){e.preventDefault();e.stopPropagation();adjustSharedFont(-1)};
    if(lg)lg.onclick=function(e){e.preventDefault();e.stopPropagation();adjustSharedFont(1)};
  }
  function setEmojiIcons(){var icons={'cc-1':'✝️','cc-2':'⛪','cc-3':'🙏','cc-4':'🌿','cc-5':'🥾','cc-6':'🌐','cc-7':'🧭'};Object.keys(icons).forEach(function(id){var btn=el(id);if(!btn)return;var wrap=btn.querySelector('.cover-icon-wrap');if(wrap)wrap.innerHTML='<span class="cover-emoji" aria-hidden="true">'+icons[id]+'</span>';});}
  function configureQna(){
    // 문의·건의 버튼은 중간 안내 카드를 만들지 않고 실제 문의 페이지로 바로 이동한다.
    window.QNA_FORM_URL=QA_URL;
    var q=el('qna-list');
    if(q) q.innerHTML='';
  }
  window.qnaOpenFormUrl=function(){ if(typeof window.goQaFirebase==='function') window.goQaFirebase(); else location.href=QA_URL; };
  function wireQnaButton(){var btn=el('qna-cover-btn');if(btn)btn.onclick=function(ev){if(ev)ev.preventDefault();window.openQnaView();};}
  function goQnaWithLoading(){
    try{ configureQna(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    try{
      document.activeElement && document.activeElement.blur && document.activeElement.blur();
      if(typeof window.oaiHoldStabilityVeil === 'function') window.oaiHoldStabilityVeil('qna-open', 1400);
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    setTimeout(function(){ location.href=QA_URL; }, 70);
  }
  window.openQnaView=function(){ goQnaWithLoading(); };
  window.goQaFirebase=function(){ goQnaWithLoading(); };
  window.qnaShowTab=function(){ configureQna(); };
  function boot(){ensureCoverControls();setEmojiIcons();configureQna();wireQnaButton();applyScale();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.addEventListener('load',function(){boot();setTimeout(boot,250);setTimeout(boot,900);},{once:true});window.addEventListener('pageshow',boot);
})();

// user-cache mode: keep app cache stable; refresh changed files through versioned URLs.

// ── PWA 설치 버튼 로직 ──
(function(){
  /* PWA 설치 버튼 통합 컨트롤러
     ① standalone(설치된 앱) 상태이면 버튼 즉시 숨기고 종료
     ② 아닌 경우: beforeinstallprompt 감지 → 버튼 표시
        app-active 클래스·matchMedia 변화 → 즉시 재평가 */
  if(window.__APP_PWA_INSTALL_GUARD__) return;
  window.__APP_PWA_INSTALL_GUARD__ = true;

  var prompt = null;

  function isStandaloneNow(){
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.documentElement.classList.contains('app-active');
  }

  function getBtn(){ return document.getElementById('pwa-install-btn'); }

  function hideInstallBtn(){
    var btn = getBtn();
    if(btn) btn.style.setProperty('display','none','important');
  }

  function applyVisibility(){
    if(isStandaloneNow()) hideInstallBtn();
  }

  if(isStandaloneNow()){ hideInstallBtn(); return; }

  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    prompt = e;
    if(!isStandaloneNow()){
      var btn = getBtn();
      if(btn) btn.style.display = 'flex';
    }
  });

  window.addEventListener('appinstalled', function(){
    hideInstallBtn();
    prompt = null;
  });

  window.triggerPwaInstall = function(){
    if(!prompt) return;
    prompt.prompt();
    prompt.userChoice.then(function(r){
      if(r.outcome === 'accepted') hideInstallBtn();
      prompt = null;
    });
  };

  new MutationObserver(applyVisibility)
    .observe(document.documentElement, {attributes:true, attributeFilter:['class']});

  try{
    window.matchMedia('(display-mode: standalone)').addEventListener('change', applyVisibility);
  }catch(e){ console.warn("[가톨릭길동무]", e); }

  window.addEventListener('load', applyVisibility);
  window.addEventListener('pageshow', applyVisibility);
})();
