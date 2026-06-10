/* prayer-ui.js — 기도문 UI 보조 모듈
   기도문 목록/탭 표시 보조만 담당합니다. */

(function(){
  'use strict';
  if(window.__APP_PRAYER_VIEW_HELPER__) return;
  window.__APP_PRAYER_VIEW_HELPER__ = true;

  function el(id){ return document.getElementById(id); }
  function blurActive(){ try{ var a=document.activeElement; if(a && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) a.blur(); }catch(_){ console.warn("[가톨릭길동무] silent catch"); } }

  /* 통합 뒤로가기 컨트롤러가 기도문을 처리하므로, 여기서는 목록 초기화만 담당한다.
     기도문 전용 history.pushState / 별도 popstate / 별도 backbutton은 사용하지 않는다. */
  function showPrayerListOnly(){
    blurActive();
    var d=el('prayer-detail');
    if(d) d.classList.remove('show');
    if(typeof window.prRestoreListPosition === 'function'){
      try{ window.prRestoreListPosition(); }catch(_){ console.warn("[가톨릭길동무] silent catch"); }
    }
  }
  try{ window.showPrayerListOnly = showPrayerListOnly; }catch(_){ console.warn("[가톨릭길동무] silent catch"); }
})();




(function(){
  if(window.__APP_PRAYER_SYNC_GUARD__) return;
  window.__APP_PRAYER_SYNC_GUARD__ = true;
  function syncPrayerTabOn(){
    var wrap = document.getElementById('prayer-tabs');
    if(!wrap) return;
    var tabs = wrap.querySelectorAll('.pr-tab');
    if(!tabs || !tabs.length) return;
    var active = null;
    for(var i=0;i<tabs.length;i++){
      var c = tabs[i].style && tabs[i].style.color ? String(tabs[i].style.color).toLowerCase() : '';
      if(c === '#fff' || c === 'white' || c.indexOf('255, 255, 255') > -1){ active = tabs[i]; break; }
    }
    if(!active) active = wrap.querySelector('.pr-tab.on') || tabs[0];
    for(var j=0;j<tabs.length;j++) tabs[j].classList.toggle('on', tabs[j] === active);
  }
  document.addEventListener('click', function(e){
    var t = e.target && e.target.closest ? e.target.closest('#prayer-tabs .pr-tab') : null;
    if(t){
      setTimeout(function(){
        var tabs = document.querySelectorAll('#prayer-tabs .pr-tab');
        for(var i=0;i<tabs.length;i++) tabs[i].classList.remove('on');
        t.classList.add('on');
      }, 0);
      setTimeout(syncPrayerTabOn, 80);
    }
  }, true);
  document.addEventListener('DOMContentLoaded', function(){ setTimeout(syncPrayerTabOn, 300); });
  window.addEventListener('load', function(){ setTimeout(syncPrayerTabOn, 300); });
  // setInterval → MutationObserver: prayer-view의 class 변화(open/close)시에만 실행
  // 기존 500ms 폴링은 앱 수명 동안 영구 실행되어 불필요한 CPU 낭비였음
  (function(){
    var pv = document.getElementById('prayer-view');
    if(!pv){
      // DOM 준비 전이면 DOMContentLoaded 후 재시도
      document.addEventListener('DOMContentLoaded', function(){
        var el = document.getElementById('prayer-view');
        if(el) new MutationObserver(function(){
          if(el.classList.contains('open')) syncPrayerTabOn();
        }).observe(el, {attributes:true, attributeFilter:['class']});
      }, {once:true});
      return;
    }
    new MutationObserver(function(){
      if(pv.classList.contains('open')) syncPrayerTabOn();
    }).observe(pv, {attributes:true, attributeFilter:['class']});
  })();
})();
