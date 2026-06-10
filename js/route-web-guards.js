/* route-web-guards.js — 웹사이트 스와이프 / 경로 마커 복원 보조 모듈
   지도/길찾기 핵심 로직은 변경하지 않고 기존 보조 흐름만 유지합니다. */
(function(){
  'use strict';
  if(window.__APP_BACK_ROUTE_GUARD__) return;
  window.__APP_BACK_ROUTE_GUARD__ = true;

  function $(id){return document.getElementById(id);}
  function flash(el, dir){
    if(!el) return;
    el.classList.remove('oai-swipe-left','oai-swipe-right');
    void el.offsetWidth;
    el.classList.add(dir==='right'?'oai-swipe-right':'oai-swipe-left');
    setTimeout(function(){try{el.classList.remove('oai-swipe-left','oai-swipe-right');}catch(e){ console.warn("[가톨릭길동무]", e); }},240);
  }
  /* 가로 스와이프 보호는 각 기능의 실제 스와이프 리스너가 담당한다.
     부모 뷰에서 touchmove를 가로채면 기도문/웹사이트 탭의 손가락 스크롤까지 막힐 수 있으므로
     전역 preventDefault 가드는 사용하지 않는다. */

  /* 웹사이트 좌우 스와이프 탭 이동 — 기도문과 동일 감도 */
  function bindWebSwipe(){
    var el=$('web-list');
    if(!el || el.__oaiFinalWebSwipe) return;
    el.__oaiFinalWebSwipe = true;
    var sx=0, sy=0;
    var THRESHOLD = 32;
    var HORIZONTAL_RATIO = 1.03;
    function isHorizontalSwipe(dx, dy){
      return Math.abs(dx) >= THRESHOLD && Math.abs(dx) >= Math.abs(dy) * HORIZONTAL_RATIO;
    }
    el.addEventListener('touchstart', function(e){
      if(!e.touches || !e.touches[0]) return;
      sx=e.touches[0].clientX; sy=e.touches[0].clientY;
    }, {passive:true});
    /* 세로 스크롤을 막지 않기 위해 touchmove에서는 preventDefault를 하지 않는다.
       좌우 탭 전환은 touchend에서만 거리와 비율을 판단한다. */
    el.addEventListener('touchend', function(e){
      if(!e.changedTouches || !e.changedTouches[0]) return;
      var dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
      if(!isHorizontalSwipe(dx, dy)) return;
      var tabs=Array.prototype.slice.call(document.querySelectorAll('#web-cats .web-cat-btn'));
      if(!tabs.length) return;
      var cur=tabs.findIndex(function(b){return b.classList.contains('on');});
      if(cur<0) cur=0;
      var next = dx<0 ? (cur+1)%tabs.length : (cur-1+tabs.length)%tabs.length;
      var nextCat = tabs[next].dataset.webCat || tabs[next].id.replace('web-cat_','');
      if(typeof window.setWebCat==='function') window.setWebCat(nextCat);
      else tabs[next].click();
      /* 기도문과 동일하게 overlay 방식 시각 피드백 사용 */
      if(typeof window.oaiSwipeAction==='function') window.oaiSwipeAction($('web-list'), dx<0?'left':'right');
      else flash($('web-list'), dx<0?'left':'right');
    }, {passive:true});
  }

  /* 뒤로가기/경로삭제 뒤 노란 마커 복귀 보강 */
  function restoreYellowMarkerFromRoute(dest){
    if(!dest || !dest.lat) return;
    setTimeout(function(){
      try{
        var items = (typeof _getCurrentItems==='function') ? _getCurrentItems() : [];
        var idx = (typeof dest.idx==='number' && dest.idx>=0) ? dest.idx : items.findIndex(function(p){return Number(p.lat)===Number(dest.lat)&&Number(p.lng)===Number(dest.lng);});
        var item = idx>=0 ? items[idx] : (dest.item || null);
        if(typeof _mode!=='undefined'){
          if(_mode==='shrine' && idx>=0 && typeof _selectShrineMarker==='function') _selectShrineMarker(idx);
          else if(_mode==='parish' && item && typeof _selectParishMarker==='function') _selectParishMarker(item);
          else if(_mode==='retreat' && item && typeof _selectRetreatMarker==='function') _selectRetreatMarker(item);
        }
        if(item && typeof _showInfoCard==='function') _showInfoCard(item, idx);
        if(item && typeof _focusMarkerAboveInfoCard==='function') _focusMarkerAboveInfoCard(item);
      }catch(e){ console.warn("[가톨릭길동무]", e); }
    },90);
  }

  function wrapRouteReset(){
    if(typeof resetRoute!=='function' || resetRoute.__oaiFinalWrapped) return;
    var old = resetRoute;
    resetRoute = function(){
      var dest=null;
      try{
        if(typeof _rE!=='undefined' && _rE && _rE.lat) dest={lat:_rE.lat,lng:_rE.lng,idx:_rE.idx,name:_rE.name};
        else if(typeof _curInfoItem!=='undefined' && _curInfoItem && _curInfoItem.item) dest={lat:_curInfoItem.item.lat,lng:_curInfoItem.item.lng,idx:_curInfoItem.idx,item:_curInfoItem.item,name:_curInfoItem.item.name};
      }catch(e){ console.warn("[가톨릭길동무]", e); }
      var isReselect=false;
      try{ isReselect=!!(arguments[0] && arguments[0].fromButton); }catch(e){ console.warn("[가톨릭길동무]", e); }
      var r = old.apply(this, arguments);
      if(!isReselect) restoreYellowMarkerFromRoute(dest);
      return r;
    };
    resetRoute.__oaiFinalWrapped = true;
    try{ window.resetRoute = resetRoute; }catch(e){ console.warn("[가톨릭길동무]", e); }
  }

  /* 경로 시트 뒤로 닫힘도 경로삭제와 동일하게 노란 마커 복귀 */
  function watchRouteSheet(){
    var rs=$('sheet-route');
    if(!rs || rs.__oaiFinalRouteWatch) return;
    rs.__oaiFinalRouteWatch=true;
    var wasOpen=rs.classList.contains('open');
    new MutationObserver(function(){
      var open=rs.classList.contains('open');
      if(wasOpen && !open){
        var dest=null;
        try{
          if(typeof _rE!=='undefined' && _rE && _rE.lat) dest={lat:_rE.lat,lng:_rE.lng,idx:_rE.idx,name:_rE.name};
          else if(typeof _curInfoItem!=='undefined' && _curInfoItem && _curInfoItem.item) dest={lat:_curInfoItem.item.lat,lng:_curInfoItem.item.lng,idx:_curInfoItem.idx,item:_curInfoItem.item,name:_curInfoItem.item.name};
        }catch(e){ console.warn("[가톨릭길동무]", e); }
        restoreYellowMarkerFromRoute(dest);
      }
      wasOpen=open;
    }).observe(rs,{attributes:true,attributeFilter:['class']});
  }

  function init(){
    // 웹사이트는 세로 스크롤을 CSS flex 컨테이너로 보장하고, 탭 전환은 touchend에서만 처리한다.
    bindWebSwipe();
    wrapRouteReset();
    watchRouteSheet();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.addEventListener('load', init);
  window.addEventListener('pageshow', init);
})();
(function(){
  'use strict';
  if(window.__APP_PRECISE_GUARD__) return;
  window.__APP_PRECISE_GUARD__ = true;
  function byId(id){ return document.getElementById(id); }
  function openNewTab(url){ if(!url) return; try{ var w=window.open(url,'_blank','noopener'); if(w) return; }catch(e){ console.warn("[가톨릭길동무]", e); } try{ var a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); setTimeout(function(){try{a.remove();}catch(e){ console.warn("[가톨릭길동무]", e); }},300); }catch(e){ alert('새창 열기가 차단되었습니다. 브라우저의 팝업 허용을 확인해 주세요.'); } }
  /* openDioceseExternal 중복 덮어쓰기 제거: 위쪽의 상태보존/복귀안정화 버전을 그대로 사용 */
  function rememberRouteDest(){ try{ if(_rE&&_rE.lat) return {lat:_rE.lat,lng:_rE.lng,idx:_rE.idx,name:_rE.name}; if(_curInfoItem&&_curInfoItem.item) return {lat:_curInfoItem.item.lat,lng:_curInfoItem.item.lng,idx:_curInfoItem.idx,item:_curInfoItem.item,name:_curInfoItem.item.name}; }catch(e){ console.warn("[가톨릭길동무]", e); } return null; }
  function restoreDest(dest){ if(!dest||!dest.lat) return; setTimeout(function(){ try{ var items=(typeof _getCurrentItems==='function')?_getCurrentItems():[]; var idx=(typeof dest.idx==='number'&&dest.idx>=0)?dest.idx:items.findIndex(function(p){return Number(p.lat)===Number(dest.lat)&&Number(p.lng)===Number(dest.lng);}); var item=idx>=0?items[idx]:dest.item; if(item&&typeof _showInfoCard==='function') _showInfoCard(item,idx); if(item&&typeof _focusMarkerAboveInfoCard==='function') _focusMarkerAboveInfoCard(item); }catch(e){ console.warn("[가톨릭길동무]", e); } },80); }
  window.oaiResetRouteThenClose=function(){ var dest=rememberRouteDest(); try{ if(typeof window.resetRoute==='function') window.resetRoute(); }catch(e){ console.warn("[가톨릭길동무]", e); } try{_routeMode=false;}catch(e){ console.warn("[가톨릭길동무]", e); } var rs=byId('sheet-route'); if(rs) rs.classList.remove('open'); restoreDest(dest); };
  /* 기존에는 여기서 prayer/web 부모 영역에 가로 preventDefault를 다시 붙였지만,
     탭바의 자연스러운 손가락 스크롤을 막는 원인이 될 수 있어 제거한다. */
})();
