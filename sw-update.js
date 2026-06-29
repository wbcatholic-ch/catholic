(function(){
  'use strict';
  if(window.__APP_CACHE_LIFECYCLE_GUARD__) return;
  window.__APP_CACHE_LIFECYCLE_GUARD__ = true;

  var APP_VERSION = 'V8-1-14-305';
  var SW_BUILD_VERSION = 'V8-1-14-305';
  window.APP_VERSION = APP_VERSION;

  /* V8-1-14-305:
     오래 미사용 후 복귀는 app.js의 공통 복귀 지휘자만 담당한다.
     예전 sw-update의 background 자동 reload / cover reset 함수들은
     인트로와 로딩 보호창을 다시 시작시켜 복귀 품질을 낮췄으므로 제거했다.
     앱 파일 갱신은 service worker update 확인과 사용자의 새로고침 흐름에서 처리한다. */
  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  var hiddenAt = 0;
  document.addEventListener('visibilitychange', function(){
    try{
      if(document.visibilityState === 'hidden'){
        hiddenAt = now();
        sessionStorage.setItem('oai_hidden_at', String(hiddenAt));
        return;
      }
      if(document.visibilityState === 'visible'){
        hiddenAt = 0;
        sessionStorage.removeItem('oai_hidden_at');
        sessionStorage.removeItem('oai_stable_auto_reload_reason');
        sessionStorage.removeItem('oai_background_cover_reset_requested');
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }, true);

  function registerServiceWorker(){
    if(!('serviceWorker' in navigator)) return;
    try{
      navigator.serviceWorker.register('./sw.js?v=' + encodeURIComponent(SW_BUILD_VERSION || APP_VERSION), { updateViaCache: 'none' })
        .then(function(reg){ try{ reg.update(); }catch(e){ console.warn('[가톨릭길동무]', e); } })
        .catch(function(){});
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', registerServiceWorker, {once:true});
  else registerServiceWorker();
})();
