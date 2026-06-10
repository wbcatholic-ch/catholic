/* prayer-back.js — 기도문 뒤로가기/history/빠른메뉴 복귀 보조 모듈
   기도문 화면의 내부 복귀 흐름만 담당합니다. */
(function(){
  'use strict';
  if(window.__OAI_PRAYER_BACK_SPLIT__) return;
  window.__OAI_PRAYER_BACK_SPLIT__ = true;
  function $b(id){ return document.getElementById(id); }
/* ─────────────────────────────────────────────
   기도문 전용 뒤로가기 컨트롤러 — 별도 history 단계 없이 DOM 상태로 복귀 처리

   원칙:
   1) 다른 정상 카테고리처럼 실제 history는 공통 root/trap 한 쌍만 사용한다.
   2) 기도문 detail/list/popup은 별도 history state를 만들지 않고 DOM 상태로만 판단한다.
   3) popstate가 오면 먼저 history.go(1)로 공통 trap을 복원한 뒤 화면만 바꾼다.
      - 본문   → 목록
      - 목록   → 빠른메뉴 팝업 또는 커버
      - 팝업   → 커버
   4) 매일미사·성가는 외부 사이트, 기도문은 내부 카테고리이므로 복귀 플래그는 분리한다.
   ───────────────────────────────────────────── */
function prayerView(){ return $b('prayer-view'); }
function prayerDetail(){ return $b('prayer-detail'); }
function prayerPopup(){ return $b('mass-quick-modal'); }
function isPrayerOpen(){
  var pv = prayerView();
  return !!(pv && pv.classList.contains('open'));
}
function isPrayerDetailShowing(){
  var d = prayerDetail();
  return !!(isPrayerOpen() && d && d.classList.contains('show'));
}
function isPrayerQuickSource(){
  var pv = prayerView();
  var yes = false;
  try{ if(pv && pv.dataset && pv.dataset.quickSource === 'mass') yes = true; }catch(_e){}
  try{ if(window.__OAI_PRAYER_FROM_QUICK_LOCK__ === true) yes = true; }catch(_e){}
  try{ if(sessionStorage.getItem('oai_prayer_from_quick_lock') === '1') yes = true; }catch(_e){}
  try{ if(typeof window._shouldPrayerQuickReturn === 'function' && window._shouldPrayerQuickReturn()) yes = true; }catch(_e){}
  return !!yes;
}
function keepPrayerQuickSource(on){
  try{ if(typeof window._setPrayerQuickReturn === 'function') window._setPrayerQuickReturn(!!on); }catch(_e){}
  try{ window.__OAI_PRAYER_FROM_QUICK_LOCK__ = !!on; }catch(_e){}
  try{ if(on) sessionStorage.setItem('oai_prayer_from_quick_lock','1'); else sessionStorage.removeItem('oai_prayer_from_quick_lock'); }catch(_e){}
  try{
    var pv = prayerView();
    if(pv && pv.dataset){
      if(on) pv.dataset.quickSource = 'mass';
      else delete pv.dataset.quickSource;
    }
  }catch(_e){}
}
function isPrayerReturnPopupOpen(){
  var mq = prayerPopup();
  if(!(mq && mq.classList.contains('show'))) return false;
  var yes = false;
  try{ if(mq.dataset && mq.dataset.returnSource === 'prayer') yes = true; }catch(_e){}
  try{ if(typeof window._isPrayerPopupReturnSource === 'function' && window._isPrayerPopupReturnSource()) yes = true; }catch(_e){}
  return !!yes;
}
function armPrayerBackTrap(reason){
  /* 호환용 함수. 기도문 detail/list용 별도 pushState는 만들지 않고,
     공통 컨트롤러가 갖고 있는 root/trap을 유지하는 것만 필요하다. */
  try{
    if(isPrayerOpen() && typeof window._ensureAppBackTrap === 'function'){
      window._ensureAppBackTrap(reason || 'prayer-ui-state');
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function pushPrayerDetailState(reason){ armPrayerBackTrap(reason || 'prayer-detail'); }
function replacePrayerListState(reason){ armPrayerBackTrap(reason || 'prayer-list'); }
function hidePrayerOnly(){
  try{
    var d = prayerDetail();
    if(d) d.classList.remove('show');
    var pv = prayerView();
    if(pv){
      pv.classList.remove('open');
      try{ delete pv.dataset.quickSource; }catch(_e){}
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function showCoverOnlyForPrayer(){
  try{
    document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
    if(typeof window.oaiSetMainMapLayerHidden === 'function') window.oaiSetMainMapLayerHidden(false);
    var cv = $b('cover');
    if(cv){
      cv.style.display = '';
      cv.style.opacity = '';
      cv.style.pointerEvents = '';
      try{ cv.scrollTop = 0; }catch(_e){}
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function resetPrayerFlags(){
  try{ if(typeof window._setPrayerPopupReturnSource === 'function') window._setPrayerPopupReturnSource(false); }catch(_e){}
  try{ if(typeof window._clearPrayerQuickReturn === 'function') window._clearPrayerQuickReturn(); }catch(_e){}
  try{ if(typeof window._clearMassQuickReturnForReload === 'function') window._clearMassQuickReturnForReload(); }catch(_e){}
  try{ window.__OAI_PRAYER_FROM_QUICK_LOCK__ = false; }catch(_e){}
  try{ sessionStorage.removeItem('oai_prayer_from_quick_lock'); }catch(_e){}
  try{ window.__OAI_PRAYER_POPUP_COVER_GUARD_UNTIL__ = 0; }catch(_e){}
  try{ window.__OAI_PRAYER_COVER_FORCE_FIRST_TOAST_UNTIL__ = 0; }catch(_e){}
}
function ensureCoverTrapAfterPrayer(reason){
  try{
    if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap(reason || 'prayer-cover-reset');
    else if(typeof window._ensureCoverBackTrap === 'function') window._ensureCoverBackTrap(reason || 'prayer-cover-reset');
    else {
      var href = location.href.split('#')[0];
      history.replaceState({_p:0, oai_cover_root:reason||'prayer-cover-reset'}, '', href);
      history.pushState({_p:1, oai_cover_trap:reason||'prayer-cover-reset'}, '', href);
    }
  }catch(e){ console.warn('[가톨릭길동무]', e); }
}
function settleCoverTrapAfterPrayer(reason){
  // 기도문 팝업 → 커버 후에는 이미 공통 컨트롤러가 history.go(1)로 trap을 복원한 상태다.
  // 여기서 replaceState/pushState를 강제로 반복하면 Android/PWA에서 다음 Back이 앱 종료로 오판될 수 있다.
  // 따라서 현재 trap이 살아 있으면 그대로 두고, 없을 때만 최소한으로 보강한다.
  function run(tag){
    try{
      if(document.documentElement.classList.contains('app-active')) return;
      var mq = prayerPopup();
      if(mq && mq.classList.contains('show')) return;
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
      if(typeof window._ensureCoverBackTrap === 'function') window._ensureCoverBackTrap((reason||'prayer-cover') + '-' + tag);
      else {
        var st = history.state;
        if(!(st && st._p === 1)) ensureCoverTrapAfterPrayer((reason||'prayer-cover') + '-' + tag);
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  run('now');
  setTimeout(function(){ run('after-popstate'); }, 0);
  if(window.requestAnimationFrame) window.requestAnimationFrame(function(){ run('raf'); });
  setTimeout(function(){ run('settle-80'); }, 80);
}
function resetPrayerToCover(reason){
  try{
    var mq = prayerPopup();
    if(mq){
      mq.classList.remove('show');
      mq.setAttribute('aria-hidden','true');
      try{ delete mq.dataset.returnSource; }catch(_e){}
    }
    hidePrayerOnly();
    showCoverOnlyForPrayer();
    resetPrayerFlags();
    try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(_e){}
    try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(_e){}
    settleCoverTrapAfterPrayer(reason || 'prayer-cover-reset');
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
}
function prayerDetailToList(reason){
  try{
    var fromQuick = isPrayerQuickSource();
    /* Step 9-5: 본문 → 목록 복귀는 prayer.js의 기존 상세 닫기 함수를 우선 사용한다.
       history는 건드리지 않고, 목록 스크롤 복원과 탭 표시만 원래 담당 함수에 맡긴다. */
    if(typeof window.prCloseDetail === 'function') window.prCloseDetail({skipTrap:true});
    else {
      var d = prayerDetail();
      if(d) d.classList.remove('show');
    }
    if(typeof window.showPrayerListOnly === 'function') window.showPrayerListOnly();
    try{ if(typeof window.prEnsureTabsVisible === 'function') window.prEnsureTabsVisible(); }catch(_e){}
    keepPrayerQuickSource(!!fromQuick);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
}
function prayerListToPopupOrCover(reason){
  try{
    var fromQuick = isPrayerQuickSource();
    if(!fromQuick) return resetPrayerToCover(reason || 'prayer-list-cover');

    /* 기도문 목록 → 빠른메뉴 팝업 복귀는 직접 팝업을 띄우지 않는다.
       사용자의 Back으로 공통 trap이 일단 소비된 직후라, 이 자리에서 openMassQuickMenu()를
       바로 호출하면 Android/PWA에서 history.go(1) 복원 타이밍과 겹쳐 팝업 Back이 앱 종료로
       먹힐 수 있다. 기존 안정 함수 _returnToMassQuickMenu('prayer')에게 맡기면,
       공통 trap 복원이 끝난 뒤
       '기도문 닫기 → 커버 복원 → 커버 위 빠른메뉴 팝업 표시'를 한 번에 실행한다. */
    try{ keepPrayerQuickSource(true); }catch(_e){}
    try{ if(typeof window._setPrayerPopupReturnSource === 'function') window._setPrayerPopupReturnSource(true); }catch(_e){}
    try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(_e){}
    try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(_e){}
    if(typeof window._returnToMassQuickMenu === 'function'){
      window._returnToMassQuickMenu('prayer');
      return true;
    }

    /* fallback: _returnToMassQuickMenu가 없을 때만 예전 방식으로 복구 */
    hidePrayerOnly();
    showCoverOnlyForPrayer();
    var mq = prayerPopup();
    if(mq){
      try{ mq.dataset.returnSource = 'prayer'; }catch(_e){}
      mq.classList.add('show');
      mq.setAttribute('aria-hidden','false');
    }
    try{ history.pushState({_p:1, oai_mass_quick:1, oai_from_prayer:1}, '', location.href.split('#')[0]); }catch(_e){}
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return true; }
}
function handlePrayerBack(reason){
  try{
    if(isPrayerReturnPopupOpen()) return resetPrayerToCover(reason || 'prayer-popup-cover');
    if(isPrayerDetailShowing()) return prayerDetailToList(reason || 'prayer-detail-back');
    if(isPrayerOpen()) return prayerListToPopupOrCover(reason || 'prayer-list-back');
    return false;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}
try{
  window._oaiArmPrayerBackTrap = armPrayerBackTrap;
  window._oaiPrayerPushDetailState = pushPrayerDetailState;
  window._oaiPrayerReplaceListState = replacePrayerListState;
  window._oaiPrayerBackHandle = handlePrayerBack;
  window._oaiPrayerListToPopupOrCover = prayerListToPopupOrCover;
  window._oaiPrayerResetToCover = resetPrayerToCover;
}catch(_e){}

function runPendingPrayerQuickPopup(){
  try{
    var cb = window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__;
    var until = Number(window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ || 0);
    if(typeof cb !== 'function') return false;
    if(until && Date.now() > until){
      window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ = null;
      window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ = 0;
      return false;
    }
    window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP__ = null;
    window.__OAI_AFTER_RESTORE_PRAYER_QUICK_POPUP_UNTIL__ = 0;
    setTimeout(function(){
      try{ cb(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, 0);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

function runPendingPrayerCoverReset(){
  try{
    var cb = window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__;
    var until = Number(window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ || 0);
    if(typeof cb !== 'function') return false;
    if(until && Date.now() > until){
      window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = null;
      window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = 0;
      return false;
    }
    window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = null;
    window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = 0;
    setTimeout(function(){
      try{ cb(); }catch(e){ console.warn('[가톨릭길동무]', e); }
    }, 0);
    return true;
  }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
}

  try{
    window._oaiPrayerIsReturnPopupOpen = isPrayerReturnPopupOpen;
    window._oaiPrayerRunPendingQuickPopup = runPendingPrayerQuickPopup;
    window._oaiPrayerRunPendingCoverReset = runPendingPrayerCoverReset;
  }catch(_e){}
})();
