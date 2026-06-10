/* back-controller.js — 공통 뒤로가기/종료 컨트롤러
   커버, 기도문, 지도/경로, 관구·교구 복귀 흐름을 담당합니다. */


/*
 * ═══════════════════════════════════════════════════════════
 *  뒤로가기 원칙
 *  [대전제] 커버에서만 앱 탈출.
 *
 *  핵심 설계:
 *  - go(1) 방식: [루트(0), 트랩(1)] 유지 → back → go(1) → UI처리
 *  - 외부뷰(미사/기도/교구지도)/모듈뷰(웹/순례길) 닫힐 때 → goToCover()
 *  - 카테고리 레이어(시트/카드/모달) → 하나씩 닫기
 *  - 아무것도 없고 앱 활성 → goToCover()
 *  - 커버 상태 → 토스트 → 두 번째 → 앱 종료
 *
 *  Step 9-1~9-5 기준:
 *  - 이 파일의 popstate 순서가 현재 정상 흐름의 기준입니다.
 *  - goToCover/startApp/history 통합은 아직 하지 않습니다.
 *  - Step 9-2에서는 커버/앱 활성 판별만 실제 DOM 표시 상태 기준으로 보강합니다.
 *  - Step 9-5에서는 기도문 본문→목록 복귀를 기존 prayer.js 담당 함수로 정리합니다.
 *  - Step 9-6에서는 매일미사·성가 빠른메뉴 팝업 닫힘 흐름을 기존 정상 구조로 유지합니다.
 * ═══════════════════════════════════════════════════════════
 */
(function(){
  'use strict';
  if(window.__BACK_CTRL__) return;
  window.__BACK_CTRL__ = true;
  window.__OAI_FULL_BACK_CTRL_ACTIVE__ = true;

  var _href = location.href.split('#')[0];

  function armCoverBackTrap(reason, opts){
    /* 커버 뒤로가기 trap은 이 모듈에서 root/trap 한 쌍으로 관리한다.
       index.html의 조기 guard는 이 모듈 로드 전 첫 화면 안전망으로만 사용한다. */
    try{
      opts = opts || {};
      var href = location.href.split('#')[0];
      _href = href;
      var st = history.state;
      // 이미 커버 trap이 살아 있으면 force 호출이어도 중복으로 쌓지 않는다.
      if(st && st._p === 1 && st.oai_cover_trap) return;
      history.replaceState({_p:0, oai_cover_root:reason||'cover-root'}, '', href);
      history.pushState({_p:1, oai_cover_trap:reason||'cover-trap'}, '', href);
    }catch(e){
      console.warn("[가톨릭길동무]", e);
    }
  }
  try{ window._oaiArmCoverBackTrap = armCoverBackTrap; }catch(_e){}

  /* history 초기화
     hash/query trap을 쓰지 않고, 최종 뒤로가기 판단은 이 popstate 컨트롤러로 단일화한다. */
  try{
    var refreshReason = '';
    try{
      var compactUntil = Number(sessionStorage.getItem('oai_refresh_history_compact_until') || 0);
      if(compactUntil && Date.now && Date.now() < compactUntil){
        refreshReason = sessionStorage.getItem('oai_refresh_history_compact_reason') || 'refresh';
      }
      sessionStorage.removeItem('oai_refresh_history_compact_until');
      sessionStorage.removeItem('oai_refresh_history_compact_reason');
    }catch(_e){}
    if(refreshReason){
      history.replaceState({_p:1, oai_cover_trap: refreshReason}, '', _href);
    }else{
      armCoverBackTrap('init', {force:true});
    }
  }catch(e){ console.warn("[가톨릭길동무]", e); }

  function $b(id){ return document.getElementById(id); }
  function coverVisible(){
    try{
      if(typeof window._isCoverScreenVisible === 'function') return window._isCoverScreenVisible();
      var cover = $b('cover');
      if(!cover) return !document.documentElement.classList.contains('app-active');
      if(cover.classList.contains('hidden')) return false;
      var st = window.getComputedStyle ? window.getComputedStyle(cover) : null;
      if(st && (st.display === 'none' || st.visibility === 'hidden')) return false;
      return true;
    }catch(e){ return false; }
  }
  function hasOpenAppSurface(){
    try{
      var ids = ['diocese-view','missa-view','prayer-view','qna-view'];
      for(var i=0;i<ids.length;i++){
        var el = $b(ids[i]);
        if(el && el.classList && el.classList.contains('open')) return true;
      }
      if(document.querySelector('.module-view.open')) return true;
      var app = $b('app');
      if(app && document.documentElement.classList.contains('app-active') && !coverVisible()) return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }

  function appActive(){
    /* 관구·교구/웹사이트/문의 같은 모듈은 커버 위에 덮이는 구조라
       cover DOM이 뒤에 보이는 상태로 남을 수 있다. 이때도 현재 사용자는
       앱 내부 화면에 있는 것이므로 커버 종료 흐름보다 모듈 닫기 흐름이 먼저다. */
    try{ if(hasOpenAppSurface()) return true; }catch(e){}
    try{ if(typeof window._isAppScreenActive === 'function') return window._isAppScreenActive(); }catch(e){}
    return document.documentElement.classList.contains('app-active') && !coverVisible();
  }

  function isRefreshDialogOpen(){
    try{ return !!document.getElementById('oai-refresh-content-dialog'); }catch(e){ return false; }
  }
  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function suppressNextCoverBackToast(ms, reason){
    try{
      window.__OAI_SUPPRESS_COVER_BACK_TOAST_UNTIL__ = now() + (ms || 600);
      window.__OAI_SUPPRESS_COVER_BACK_TOAST_REASON__ = reason || 'cover-state-reset';
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }
  function consumeSuppressedCoverBackToast(){
    try{
      var until = Number(window.__OAI_SUPPRESS_COVER_BACK_TOAST_UNTIL__ || 0);
      if(until && now() < until){
        window.__OAI_SUPPRESS_COVER_BACK_TOAST_UNTIL__ = 0;
        window.__OAI_SUPPRESS_COVER_BACK_TOAST_REASON__ = '';
        if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
        if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
        armCoverBackTrap('suppressed-cover-popstate');
        return true;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }
    return false;
  }
  try{ window._oaiSuppressNextCoverBackToast = suppressNextCoverBackToast; }catch(_e){}
  function closeRefreshDialog(){
    try{
      var el = document.getElementById('oai-refresh-content-dialog');
      if(!el) return false;
      if(el.parentNode) el.parentNode.removeChild(el);
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }
  function isGuideModalOpen(){
    try{ return !!document.querySelector('.guide-modal.show') || !!document.querySelector('.cover-menu-modal.show') || !!document.querySelector('.my-diocese-modal.show') || isRefreshDialogOpen(); }catch(e){ return false; }
  }
  function closeGuideModals(){
    try{
      var rd = $b('oai-refresh-content-dialog');
      if(rd && rd.parentNode){ rd.parentNode.removeChild(rd); return; }
      if(typeof window.closeMyFaithLifeModal === 'function' && typeof window.isMyFaithLifeModalOpen === 'function' && window.isMyFaithLifeModalOpen()){
        window.closeMyFaithLifeModal();
        return;
      }
      if(typeof window.closeCoverMenuPopup === 'function' && typeof window.isCoverMenuPopupOpen === 'function' && window.isCoverMenuPopupOpen()){
        window.closeCoverMenuPopup();
        return;
      }
      var mq = $b('mass-quick-modal');
      if(mq && mq.classList.contains('show') && typeof window.closeMassQuickMenu === 'function'){
        var fromPrayer = false;
        try{ fromPrayer = !!(mq.dataset && mq.dataset.returnSource === 'prayer'); }catch(e){}
        try{ if(typeof window._isPrayerPopupReturnSource === 'function' && window._isPrayerPopupReturnSource()) fromPrayer = true; }catch(e){}
        // closeMassQuickMenu() 안에서 기도문 복귀 팝업 여부를 직접 판정해 커버를 확정한다.
        // 여기서 한 번 더 _forceCoverAfterPrayerQuickPopup()를 호출하면 커버/히스토리 재설정이 중복되어
        // 팝업 복귀 또는 팝업 닫힘 순간 화면이 흔들릴 수 있다.
        window.closeMassQuickMenu();
      } else {
        document.querySelectorAll('.guide-modal.show').forEach(function(el){
          el.classList.remove('show');
          el.setAttribute('aria-hidden','true');
        });
      }
      if(typeof window.resetGuideManualScroll === 'function') window.resetGuideManualScroll();
      if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
    }catch(e){ console.warn('[가톨릭길동무]', e); }
  }

  function callGTC(){
    if(typeof window.goToCover === 'function') window.goToCover();
    else {
      document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
      var cv = $b('cover'); if(cv) cv.style.display = '';
    }
  }

  /* ── 일반 모듈 뷰 닫기: Step 9-3 범위
     웹사이트·순례길·문의·관구교구 기본 화면은 모두 커버로 복귀한다.
     기도문/매일미사/성가는 각각 전용 흐름이 있으므로 여기서 처리하지 않는다. */
  function closeGeneralModuleToCover(reason){
    var diocese = $b('diocese-view');
    if(diocese && diocese.classList.contains('open')){
      if(typeof window.closeDioceseView === 'function') window.closeDioceseView();
      else {
        diocese.classList.remove('open');
        callGTC();
      }
      return true;
    }

    var mods = document.querySelectorAll('.module-view.open');
    if(mods.length){
      mods[mods.length-1].classList.remove('open');
      callGTC();
      return true;
    }
    return false;
  }

  try{ window._oaiCloseGeneralModuleToCover = closeGeneralModuleToCover; }catch(_e){}

  /* ── 외부·모듈 뷰 닫기 */
  /* ── 모듈 내부 레이어 닫기: Step 9-4 범위
     순례길 상세 시트가 열려 있으면 모듈 전체를 닫기 전에 상세 시트만 먼저 닫는다. */
  function closeModuleInnerLayer(){
    var trailSheet = null;
    try{ trailSheet = document.querySelector('.trail-sheet.open'); }catch(_e){}
    if(trailSheet){
      try{
        if(typeof window.trailCloseSheet === 'function') window.trailCloseSheet();
        else trailSheet.classList.remove('open');
      }catch(e){
        try{ trailSheet.classList.remove('open'); }catch(_e){}
        console.warn('[가톨릭길동무]', e);
      }
      return true;
    }
    return false;
  }

  function isDioceseViewOpen(){
    try{ var el=$b('diocese-view'); return !!(el && el.classList && el.classList.contains('open')); }catch(e){ return false; }
  }
  function closeDioceseViewToCoverDirect(reason){
    try{
      if(typeof window.closeDioceseView === 'function') window.closeDioceseView();
      else { var el=$b('diocese-view'); if(el) el.classList.remove('open'); callGTC(); }
      return true;
    }catch(e){ console.warn('[가톨릭길동무]', e); return false; }
  }

  function closeExtOrModule(){
    /* 매일미사 */
    var missa = $b('missa-view');
    if(missa && missa.classList.contains('open')){
      if(typeof window.closeMissa === 'function') window.closeMissa();
      else missa.classList.remove('open');
      return true;
    }
    /* 기도문은 전용 컨트롤러 한 곳에서만 처리한다. */
    var prayer = $b('prayer-view');
    if(prayer && prayer.classList.contains('open')){
      if(typeof window._oaiPrayerBackHandle === 'function') return window._oaiPrayerBackHandle('closeExtOrModule-prayer');
      if(typeof window.closePrayerView === 'function') window.closePrayerView();
      else prayer.classList.remove('open');
      callGTC();
      return true;
    }
    return closeGeneralModuleToCover('back-general-module');
  }

  /* ── 카테고리 레이어 닫기 (하나씩) ── */
  function closeLayer(){
    var el;
    el = $b('exit-dlg');
    if(el && el.classList.contains('open')){ el.classList.remove('open'); return true; }

    el = $b('route-choice-modal');
    if(el && el.classList.contains('open')){
      if(typeof window._closeInfoRouteChoice==='function') window._closeInfoRouteChoice();
      else el.classList.remove('open');
      return true;
    }

    el = $b('srch-modal');
    if(el && el.classList.contains('open')){
      if(typeof window.closeSearchModal==='function') window.closeSearchModal();
      else el.classList.remove('open');
      return true;
    }

    // 길찾기 시트가 열려 있거나 경로 상태가 남아 있으면 인포카드보다 먼저 정리한다.
    // 순서: 경로삭제 → 출발/도착 초기화 → 도착 노랑마커 + 인포카드 복귀.
    el = $b('sheet-route');
    try{
      if((el && el.classList.contains('open')) || _routeMode || _rS || _rE){
        var dest = (_rE && _rE.lat) ? Object.assign({}, _rE) : null;
        try{ if(typeof window.resetRoute==='function') window.resetRoute(); }catch(e){ console.warn("[가톨릭길동무]", e); }
        try{ _routeMode = false; }catch(e){ console.warn("[가톨릭길동무]", e); }
        if(el) el.classList.remove('open');
        try{ if(_activeTab==='route') _activeTab=null; if(typeof _updateTabBtns==='function') _updateTabBtns(null); }catch(e){ console.warn("[가톨릭길동무]", e); }
        if(dest){
          setTimeout(function(){
            try{
              var items = (typeof _getCurrentItems==='function') ? _getCurrentItems() : [];
              var idx = (typeof dest.idx==='number' && dest.idx>=0) ? dest.idx : items.findIndex(function(p){return Number(p.lat)===Number(dest.lat)&&Number(p.lng)===Number(dest.lng);});
              var item = idx>=0 ? items[idx] : null;
              if(item){
                if(_mode==='shrine' && typeof _selectShrineMarker==='function') _selectShrineMarker(idx);
                else if(_mode==='parish' && typeof _selectParishMarker==='function') _selectParishMarker(item);
                else if(typeof _selectRetreatMarker==='function') _selectRetreatMarker(item);
                if(typeof _showInfoCard==='function') _showInfoCard(item, idx);
                if(typeof _focusMarkerAboveInfoCard==='function') _focusMarkerAboveInfoCard(item);
              }
            }catch(e){ console.warn("[가톨릭길동무]", e); }
          }, 90);
        }
        return true;
      }
    }catch(e){ console.warn("[가톨릭길동무]", e); }

    el = $b('info-card');
    if(el && el.classList.contains('open')){
      if(typeof window.closeInfoCard==='function') window.closeInfoCard();
      else{ el.classList.remove('open'); el.style.display='none'; }
      return true;
    }

    try{ if(_activeTab && typeof closeTab==='function'){ closeTab(_activeTab); return true; } }catch(e){ console.warn("[가톨릭길동무]", e); }

    var tsh = document.querySelector('.trail-sheet.open');
    if(tsh){ tsh.classList.remove('open'); return true; }

    var sheets = document.querySelectorAll('.sheet.open');
    if(sheets.length){ sheets[sheets.length-1].classList.remove('open'); return true; }

    return false;
  }

  /* ── popstate 핸들러 ── */
  var _restoring = false;


  /* 기도문 뒤로가기/history/빠른메뉴 복귀 컨트롤러는 js/prayer-back.js가 담당한다. */

  window.addEventListener('popstate', function(){
    if(window._appExiting) return;

    /* history.go(1)로 공통 trap을 복원하면서 발생한 popstate는
       어떤 화면 처리도 하지 않고 여기서 끝낸다. 이 순서가 중요하다. */
    if(_restoring){
      _restoring = false;
      if(typeof window._oaiPrayerRunPendingCoverReset === 'function' && window._oaiPrayerRunPendingCoverReset()) return;
      if(typeof window._oaiPrayerRunPendingQuickPopup === 'function') window._oaiPrayerRunPendingQuickPopup();
      /* 관구·교구 등 일반 모듈을 닫은 직후 history 복원 popstate가
         뒤늦게 들어오면 커버 첫 Back이 여기서 소비되어 종료 안내가 생략될 수 있다.
         커버가 이미 보이는 상태라면 화면 처리는 하지 않고 커버 trap만 다시 세운다. */
      try{
        if(coverVisible() && !appActive()){
          if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
          if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
          armCoverBackTrap('restore-cover-after-module');
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      return;
    }

    /* 빠른메뉴에서 주요기도문으로 진입하기 위해 팝업용 mq history state를
       직접 pop하는 중이면, 이것은 사용자의 뒤로가기 명령이 아니다. */
    try{
      var mqPopUntil = Number(window.__OAI_MQ_STATE_POPPING__ || 0);
      if(mqPopUntil && Date.now() < mqPopUntil){
        window.__OAI_MQ_STATE_POPPING__ = 0;
        var cb = window.__OAI_AFTER_MQ_STATE_POP__;
        window.__OAI_AFTER_MQ_STATE_POP__ = null;
        if(typeof cb === 'function') setTimeout(cb, 0);
        return;
      }
    }catch(e){ console.warn('[가톨릭길동무]', e); }

    /* 커버 위에 떠 있는 기도문 복귀 팝업은 일반 종료 흐름보다 먼저 닫고 커버를 확정한다.
       단, 먼저 history.go(1)로 방금 소비된 공통 trap을 복원한 뒤 닫아야
       커버 첫 Back이 앱 종료로 빠지지 않는다. */
    if(typeof window._oaiPrayerIsReturnPopupOpen === 'function' && window._oaiPrayerIsReturnPopupOpen()){
      var coverCb = function(){ if(typeof window._oaiPrayerResetToCover === 'function') window._oaiPrayerResetToCover('prayer-popup-cover-after-restore'); };
      try{
        window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = coverCb;
        window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = Date.now() + 1800;
        _restoring = true;
        history.go(1);
        setTimeout(function(){
          try{
            if(window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ === coverCb){
              _restoring = false;
              window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET__ = null;
              window.__OAI_AFTER_RESTORE_PRAYER_COVER_RESET_UNTIL__ = 0;
              coverCb();
            }
          }catch(e){ console.warn('[가톨릭길동무]', e); }
        }, 160);
      }catch(e){
        _restoring = false;
        console.warn('[가톨릭길동무]', e);
        coverCb();
      }
      return;
    }

    /* 새로고침 확인창이 열려 있으면 종료 안내로 넘기지 말고 확인창만 닫는다. */
    if(closeRefreshDialog()){
      try{ armCoverBackTrap('refresh-dialog-close', {force:true}); }catch(e){ console.warn('[가톨릭길동무]', e); }
      return;
    }

    /* 빠른메뉴/안내 팝업이 열려 있으면 먼저 닫는다. */
    if(isGuideModalOpen()){
      closeGuideModals();
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('guide-modal-close'); else armCoverBackTrap('guide-modal-close'); }catch(e){ console.warn("[가톨릭길동무]", e); }
      return;
    }

    /* 관구·교구는 커버 위에 떠 있지만, 커버 종료 흐름보다 먼저 닫아야 한다.
       여기서는 history.go(1) 복원에 의존하지 않고 즉시 닫은 뒤 커버 trap을 새로 세운다. */
    if(isDioceseViewOpen()){
      closeDioceseViewToCoverDirect('diocese-popstate-direct');
      return;
    }

    /* 커버: 토스트 → 두 번째에 종료. */
    if(!appActive()){
      if(consumeSuppressedCoverBackToast()) return;
      var exiting = false;
      if(typeof window._showBackToast==='function') exiting = window._showBackToast() === true;
      if(!exiting){ armCoverBackTrap('cover-toast'); }
      return;
    }

    /* 앱 활성 상태에서는 다른 정상 카테고리와 동일하게 먼저 trap을 복원하고,
       그 다음 DOM 상태를 직접 정리한다. 기도문도 여기서만 처리한다. */
    _restoring = true;
    try{ history.go(1); }catch(e){ _restoring = false; console.warn("[가톨릭길동무]", e); }

    if(typeof window._oaiPrayerBackHandle === 'function' && window._oaiPrayerBackHandle('prayer-popstate')) return;
    if(closeModuleInnerLayer()) return;
    if(closeExtOrModule()) return;
    if(closeLayer()) return;
    callGTC();
  }, false);


  /* Cordova 물리 백버튼 */
  document.addEventListener('backbutton', function(){
    if(typeof window._oaiPrayerBackHandle === 'function' && window._oaiPrayerBackHandle('prayer-hardware-back')) return;
    if(closeRefreshDialog()){ try{ armCoverBackTrap('refresh-dialog-hardware', {force:true}); }catch(e){} return; }
    if(isGuideModalOpen()){
      closeGuideModals();
      try{ if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady(); }catch(e){}
      try{ if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed(); }catch(e){}
      try{ if(typeof window._resetCoverBackTrap === 'function') window._resetCoverBackTrap('guide-modal-hardware'); else armCoverBackTrap('guide-modal-hardware'); }catch(e){}
      return;
    }
    if(isDioceseViewOpen()){
      closeDioceseViewToCoverDirect('diocese-hardware-direct');
      return;
    }
    if(!appActive()){
      if(consumeSuppressedCoverBackToast()) return;
      if(typeof window._showBackToast==='function') window._showBackToast();
      return;
    }
    if(closeModuleInnerLayer()) return;
    if(closeExtOrModule()) return;
    if(closeLayer()) return;
    callGTC();
  }, false);

  // 외부 사이트 방문 후 복귀 시 history 트랩 강제 재확립.
  // 트랩이 소실되면 다음 뒤로가기에서 앱이 탈출된다.
  window.addEventListener('pageshow', function(){
    try{
      var st = history.state;
      if(st && st._p === 1) return;  // 트랩 유지 중이면 스킵
      if(!appActive()) armCoverBackTrap('pageshow-cover');
      else { history.replaceState({_p:0}, '', _href); history.pushState({_p:1}, '', _href); }
    }catch(e){ console.warn("[가톨릭길동무]", e); }
  }, true);


})();

/* 캐시는 Date.now 리디렉션을 쓰지 않고 고정 버전 문자열과 서비스워커로 관리합니다.
   시작 시 강제 상태 초기화는 하지 않아 뒤로가기와 외부사이트 복귀 상태를 보존합니다.
   기도문 UI, 커버 공통 기능, 터치 UX, 경로/웹사이트 보조 로직은 각 분리 모듈이 담당합니다. */
