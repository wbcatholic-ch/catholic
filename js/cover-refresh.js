(function(){
  'use strict';
  if(window.__APP_PULL_REFRESH_DISABLED_V87__) return;
  window.__APP_PULL_REFRESH_DISABLED_V87__ = true;
  function removePullIndicator(){
    try{
      var ind = document.getElementById('cv-pull-modern');
      if(ind && ind.parentNode) ind.parentNode.removeChild(ind);
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function install(){ removePullIndicator(); }
  window.__oaiDisableCoverPullRefresh = install;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
  window.addEventListener('pageshow', install, true);
})();
