/* V8-1-14-53: 성지 기능 업데이트 안내 배너
   공식 Google Play 배포 전 제거 방법:
   1) index.html의 SHRINE_UPDATE_BANNER_START~END 블록 삭제
   2) css/shrine-update-banner.css 삭제
   3) js/shrine-update-banner.js 삭제 */
(function(){
  'use strict';
  var ENABLED = window.OAI_SHRINE_UPDATE_BANNER_ENABLED !== false;
  var HIDE_KEY = 'oai_shrine_update_banner_v3_hidden';
  var SESSION_KEY = 'oai_shrine_update_banner_v3_session_shown';
  function isInstalledRun(){
    /* V8-1-14-56: 카카오/일반 브라우저는 제외하고, 설치형 PWA/WebView 앱에서만 표시한다. */
    var ua='';
    try{ ua=String(navigator.userAgent||'').toLowerCase(); }catch(_e){}
    if(/kakaotalk|kakaostory|kakao/.test(ua)) return false;
    try{ if(window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: minimal-ui)').matches)) return true; }catch(_e){}
    try{ if(window.navigator && window.navigator.standalone) return true; }catch(_e){}
    try{ if(document.referrer && String(document.referrer).indexOf('android-app://')===0) return true; }catch(_e){}
    try{ if(/; wv\)|\bwv\b/.test(ua)) return true; }catch(_e){}
    try{ if(window.OAI_FORCE_SHRINE_UPDATE_BANNER === true) return true; }catch(_e){}
    return false;
  }
  function isHidden(){ try{ return localStorage.getItem(HIDE_KEY)==='1'; }catch(_e){ return false; } }
  function hideForever(){ try{ localStorage.setItem(HIDE_KEY,'1'); }catch(_e){} hide(); }
  function markSession(){ try{ sessionStorage.setItem(SESSION_KEY,'1'); }catch(_e){} }
  function shownThisSession(){ try{ return sessionStorage.getItem(SESSION_KEY)==='1'; }catch(_e){ return false; } }
  function coverReady(){
    var cover=document.getElementById('cover');
    if(!cover) return false;
    try{
      var st=getComputedStyle(cover);
      if(st.display==='none' || st.visibility==='hidden' || st.opacity==='0') return false;
    }catch(_e){}
    try{ if(document.documentElement.classList.contains('app-active')) return false; }catch(_e){}
    return true;
  }
  function hide(){ var el=document.getElementById('shrine-update-banner'); if(el) el.classList.remove('show'); }
  function create(){
    var el=document.getElementById('shrine-update-banner');
    if(el) return el;
    el=document.createElement('section');
    el.id='shrine-update-banner';
    el.setAttribute('aria-label','성지 기능 업데이트 안내');
    el.innerHTML=''+
      '<div class="shrine-update-card" role="dialog" aria-modal="false">'+
        '<div class="shrine-update-head">'+
          '<div class="shrine-update-icon" aria-hidden="true">🙏</div>'+
          '<div class="shrine-update-title">성지등록·스탬프북 기능 안내</div>'+
          '<button type="button" class="shrine-update-x" data-shrine-update-close aria-label="닫기">×</button>'+
        '</div>'+
        '<div class="shrine-update-body">'+
          '<b>성지순례 기록 기능이 추가되었습니다.</b>'+
          '<div class="shrine-update-list">'+
            '<div>• 성지 정보카드에서 <b>수동 순례등록</b></div>'+
            '<div>• 성지 근처에서는 <b>GPS 자동 감지 등록</b></div>'+
            '<div>• 스탬프북에서 순례 기록과 미방문 성지 확인</div>'+
          '</div>'+
        '</div>'+
        '<div class="shrine-update-actions">'+
          '<button type="button" class="shrine-update-go" data-shrine-update-go>성지순례 바로가기</button>'+
          '<button type="button" class="shrine-update-never" data-shrine-update-never>다시 보지 않기</button>'+
          '<button type="button" class="shrine-update-close" data-shrine-update-close>닫기</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click',function(e){
      var t=e.target;
      if(!t || !t.closest) return;
      if(t.closest('[data-shrine-update-never]')){ e.preventDefault(); hideForever(); return; }
      if(t.closest('[data-shrine-update-close]')){ e.preventDefault(); markSession(); hide(); return; }
      if(t.closest('[data-shrine-update-go]')){
        e.preventDefault(); markSession(); hide();
        setTimeout(function(){
          var btn=document.getElementById('cc-3');
          try{ if(btn) btn.click(); }catch(_e){}
        },30);
      }
    }, true);
    return el;
  }
  function show(){
    if(!ENABLED || isHidden() || shownThisSession() || !isInstalledRun()) return;
    if(!coverReady()){ setTimeout(show,350); return; }
    var el=create();
    markSession();
    setTimeout(function(){ el.classList.add('show'); },60);
  }
  function boot(){
    /* 앱 초기 로딩/캐시 복귀 타이밍 차이를 흡수하기 위해 여러 번 재확인한다. */
    [700,1500,3000,6000].forEach(function(ms){ setTimeout(show,ms); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
  window.addEventListener('pageshow', function(){ setTimeout(show,900); });
  window.addEventListener('focus', function(){ setTimeout(show,900); });
})();
