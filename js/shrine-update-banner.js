/* V8-1-14-62: 성지순례 업데이트 안내 배너
   공식 Google Play 배포 전 제거 방법:
   1) index.html의 SHRINE_UPDATE_BANNER_START~END 블록 삭제
   2) css/shrine-update-banner.css 삭제
   3) js/shrine-update-banner.js 삭제 */
(function(){
  'use strict';
  var ENABLED = window.OAI_SHRINE_UPDATE_BANNER_ENABLED !== false;
  var NEVER_KEY = 'oai_shrine_update_banner_v4_never';
  var DAY_HIDE_UNTIL_KEY = 'oai_shrine_update_banner_v4_day_hide_until';
  var DAY_USED_KEY = 'oai_shrine_update_banner_v4_day_hide_used';
  var SESSION_KEY = 'oai_shrine_update_banner_v4_session_shown';

  function isInstalledRun(){
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
  function now(){ return Date.now ? Date.now() : new Date().getTime(); }
  function nextLocalDayStart(){
    var d = new Date();
    d.setHours(24,0,0,0);
    return d.getTime();
  }
  function isHidden(){
    try{
      if(localStorage.getItem(NEVER_KEY)==='1') return true;
      var until = parseInt(localStorage.getItem(DAY_HIDE_UNTIL_KEY) || '0', 10) || 0;
      if(until && now() < until) return true;
      if(until && now() >= until) localStorage.removeItem(DAY_HIDE_UNTIL_KEY);
    }catch(_e){}
    return false;
  }
  function hideForToday(){
    try{
      localStorage.setItem(DAY_USED_KEY,'1');
      localStorage.setItem(DAY_HIDE_UNTIL_KEY, String(nextLocalDayStart()));
    }catch(_e){}
    hide();
  }
  function hideForever(){
    try{ localStorage.setItem(NEVER_KEY,'1'); }catch(_e){}
    hide();
  }
  function markSession(){ try{ sessionStorage.setItem(SESSION_KEY,'1'); }catch(_e){} }
  function shownThisSession(){ try{ return sessionStorage.getItem(SESSION_KEY)==='1'; }catch(_e){ return false; } }
  function hasUsedDayHide(){ try{ return localStorage.getItem(DAY_USED_KEY)==='1'; }catch(_e){ return false; } }
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
    var secondDay = hasUsedDayHide();
    var actions = secondDay
      ? '<button type="button" class="shrine-update-day" data-shrine-update-day>하루 동안 안 보기</button>'+ '<button type="button" class="shrine-update-never" data-shrine-update-never>다시 보지 않기</button>'
      : '<button type="button" class="shrine-update-day" data-shrine-update-day>하루 동안 안 보기</button>'+ '<button type="button" class="shrine-update-close" data-shrine-update-close>닫기</button>';
    el=document.createElement('section');
    el.id='shrine-update-banner';
    el.setAttribute('aria-label','성지순례 업데이트 안내');
    el.innerHTML=''+
      '<div class="shrine-update-card" role="dialog" aria-modal="false">'+
        '<div class="shrine-update-head">'+
          '<div class="shrine-update-icon" aria-hidden="true">🙏</div>'+
          '<div class="shrine-update-title">성지순례 업데이트 안내</div>'+
        '</div>'+
        '<div class="shrine-update-body">'+
          '<b>전국 성지 정보가 167곳에서 188곳으로 업데이트되었습니다.</b>'+
          '<div class="shrine-update-list">'+
            '<div>• 성지찾기 카드 및 정보카드에서 순례등록 버튼으로 <b>수동 순례등록</b></div>'+ 
            '<div>• 성지 근처에서는 <b>GPS 자동 감지</b>로 오늘 순례등록</div>'+ 
            '<div>• 스탬프북에서 순례한 성지, 미방문 성지, 신규 성지 확인</div>'+ 
            '<div>• 경로검색에서 경유지를 최대 3곳까지 추가</div>'+ 
          '</div>'+ 
        '</div>'+ 
        '<div class="shrine-update-actions">'+ actions + '</div>'+ 
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click',function(e){
      var t=e.target;
      if(!t || !t.closest) return;
      if(t.closest('[data-shrine-update-day]')){ e.preventDefault(); hideForToday(); return; }
      if(t.closest('[data-shrine-update-never]')){ e.preventDefault(); hideForever(); return; }
      if(t.closest('[data-shrine-update-close]')){ e.preventDefault(); markSession(); hide(); return; }
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
    [700,1500,3000,6000].forEach(function(ms){ setTimeout(show,ms); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
  window.addEventListener('pageshow', function(){ setTimeout(show,900); });
  window.addEventListener('focus', function(){ setTimeout(show,900); });
})();
