'use strict';

(function(){
  window.bindMyFaithLifePanel = function(on){
    var DIO_KEY = 'oai_my_diocese_name';
    var PARISH_KEY = 'oai_my_parish_data';
    var NO_PARISH_NAME = '본당 선택 안함';
    var dioceses = [
      '서울대교구','대구대교구','광주대교구','수원교구','인천교구',
      '의정부교구','춘천교구','원주교구','대전교구','청주교구',
      '부산교구','마산교구','안동교구','전주교구','제주교구'
    ];
    var DIO_INFO = {
      '서울대교구': {home:'https://aos.catholic.or.kr/index', priest:'https://aos.catholic.or.kr/pro10315'},
      '대구대교구': {home:'https://www.daegu-archdiocese.or.kr/', priest:'https://www.daegu-archdiocese.or.kr/page/priest.html?srl=priest'},
      '광주대교구': {home:'https://www.gjcatholic.or.kr/', priest:'https://www.gjcatholic.or.kr/priest/priests'},
      '수원교구': {home:'https://www.casuwon.or.kr/', priest:'https://www.casuwon.or.kr/priest/priest'},
      '인천교구': {home:'http://www.caincheon.or.kr/', priest:'http://www.caincheon.or.kr/father/father_list.do'},
      '의정부교구': {home:'http://ucatholic.or.kr/', priest:'http://ucatholic.or.kr/bbs/board.php?bo_table=priest'},
      '춘천교구': {home:'https://www.cccatholic.or.kr/', priest:'https://www.cccatholic.or.kr/diocese/priest/priest'},
      '원주교구': {home:'http://www.wjcatholic.or.kr/', priest:'http://www.wjcatholic.or.kr/company/sajedan'},
      '대전교구': {home:'https://www.djcatholic.or.kr/home/', priest:'https://www.djcatholic.or.kr/home/pages/priest_list.php'},
      '청주교구': {home:'https://www.cdcj.or.kr/', priest:'https://www.cdcj.or.kr/diocese/priest/priest'},
      '부산교구': {home:'https://www.catholicbusan.or.kr/', priest:'https://www.catholicbusan.or.kr/clergy/priest'},
      '마산교구': {home:'https://cathms.kr/', priest:'https://cathms.kr/saje'},
      '안동교구': {home:'https://www.acatholic.or.kr/', priest:'https://www.acatholic.or.kr/sub2/sub1.asp'},
      '전주교구': {home:'https://jcatholic.or.kr/index.php', priest:'https://www.jcatholic.or.kr/theme/main/pages/priest.php?st=diocese'},
      '제주교구': {home:'https://www.diocesejeju.or.kr/', priest:'https://www.diocesejeju.or.kr/diocese_father'}
    };
    var btn = document.getElementById('cover-diocese-btn');
    var menuBtn = document.getElementById('cover-menu-myfaith-btn');
    var setupBanner = document.getElementById('my-diocese-setup-banner');
    var modal = document.getElementById('my-diocese-modal');
    var body = document.getElementById('my-diocese-list');
    var title = document.getElementById('my-diocese-title');
    var subtitle = modal ? modal.querySelector('.my-diocese-subtitle') : null;
    if(!btn || !modal || !body) return;
    var myFaithStableHeight = 0;
    var myFaithPendingActive = false;
    var myFaithPendingName = '';
    var myFaithPendingParish = null;
    var myFaithRenderSettingsEdit = null;
    var myFaithExpandedSection = '';
    function selectedName(){ try{ return (localStorage.getItem(DIO_KEY) || '').trim(); }catch(e){ return ''; } }
    function setSelectedName(name){ try{ localStorage.setItem(DIO_KEY, String(name || '').trim()); }catch(e){ console.warn('[가톨릭길동무]', e); } }
    function noParishItem(dioceseName){ return {name:NO_PARISH_NAME,diocese:String(dioceseName||''),addr:'',hp:'',url:'',none:true}; }
    function isNoParishItem(item){ return !!(item && (item.none === true || String(item.name||'') === NO_PARISH_NAME)); }
    function selectedParish(){
      try{ var raw = localStorage.getItem(PARISH_KEY) || ''; if(!raw) return null; var item = JSON.parse(raw); return item && item.name ? item : null; }
      catch(e){ return null; }
    }
    function setSelectedParish(item){
      try{
        if(!item || !item.name){ localStorage.removeItem(PARISH_KEY); return; }
        localStorage.setItem(PARISH_KEY, JSON.stringify({name:String(item.name||''),diocese:String(item.diocese||''),addr:String(item.addr||''),hp:String(item.hp||''),url:String(item.url||''),none:isNoParishItem(item)}));
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function cloneMyFaithParish(item){
      if(!item || !item.name) return null;
      return {name:String(item.name||''),diocese:String(item.diocese||''),addr:String(item.addr||''),hp:String(item.hp||''),url:String(item.url||''),none:isNoParishItem(item)};
    }
    function beginMyFaithPendingEdit(){
      myFaithPendingActive = true;
      myFaithPendingName = selectedName();
      myFaithPendingParish = cloneMyFaithParish(selectedParish());
      myFaithExpandedSection = 'diocese';
    }
    function beginMyFaithBlankEdit(){
      myFaithPendingActive = true;
      myFaithPendingName = '';
      myFaithPendingParish = null;
      myFaithExpandedSection = 'diocese';
    }
    function cancelMyFaithPendingEdit(){
      myFaithPendingActive = false;
      myFaithPendingName = '';
      myFaithPendingParish = null;
      myFaithExpandedSection = '';
    }
    function getMyFaithEditName(){ if(!myFaithPendingActive) beginMyFaithPendingEdit(); return String(myFaithPendingName || '').trim(); }
    function getMyFaithEditParish(){ if(!myFaithPendingActive) beginMyFaithPendingEdit(); return myFaithPendingParish; }
    function setMyFaithEditName(name){
      if(!myFaithPendingActive) beginMyFaithPendingEdit();
      name = String(name || '').trim();
      if(String(myFaithPendingName || '').trim() !== name) myFaithPendingParish = null;
      myFaithPendingName = name;
      myFaithExpandedSection = name ? 'parish' : 'diocese';
    }
    function setMyFaithEditParish(item){ if(!myFaithPendingActive) beginMyFaithPendingEdit(); myFaithPendingParish = cloneMyFaithParish(item); myFaithExpandedSection = ''; }
    function commitMyFaithPendingEdit(){
      if(!myFaithPendingActive) return true;
      var name = String(myFaithPendingName || '').trim();
      var parish = cloneMyFaithParish(myFaithPendingParish);
      if(!name){
        try{ alert('교구를 선택해 주세요.'); }catch(_e){}
        return false;
      }
      if(!parish || !parish.name) parish = noParishItem(name);
      if(isNoParishItem(parish)) parish.diocese = name;
      setSelectedName(name);
      setSelectedParish(parish);
      cancelMyFaithPendingEdit();
      updateButton();
      refreshDependentViews();
      return true;
    }
    function cancelMyFaithSettingsAndReturn(){
      var hadSavedSetting = !!selectedName();
      cancelMyFaithPendingEdit();
      if(hadSavedSetting) renderHome();
      else closeModal();
    }
    function returnToMyFaithSettingsEdit(){
      if(typeof myFaithRenderSettingsEdit === 'function') myFaithRenderSettingsEdit();
      else renderHome();
    }
    function safeText(x){ return String(x || '').replace(/[&<>"']/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c); }); }
    var DATA_BACKUP_TYPE = 'catholic-gildongmu-user-data-backup';
    var DATA_BACKUP_BUILD = 'V8-1-14-305';
    var DATA_BACKUP_LAST_TIME_KEY = 'oai_data_backup_last_exported_at_v1';
    var myFaithInfoManagementOpen = false;
    var myFaithInfoManagementLayer = null;
    var myFaithInfoActionTimer = null;
    var DATA_BACKUP_KEYS = [
      {key:'oai_my_diocese_name', label:'나의 교구'},
      {key:'oai_my_parish_data', label:'나의 본당'},
      {key:'oai_shrine_visits_v1', label:'순례현황'},
      {key:'pr_favorites', label:'기도문 즐겨찾기'},
      {key:'web_favorites_v1', label:'가톨릭 정보 즐겨찾기'},
      {key:'prayer_font_size', label:'글자 크기'},
      {key:'oai_shrine_update_banner_v91_hidden_forever', label:'성지 업데이트 다시 보지 않기'},
      {key:'oai_shrine_update_banner_v91_hide_until', label:'성지 업데이트 하루 동안 안 보기'},
      {key:'oai_shrine_update_banner_v91_first_date', label:'성지 업데이트 첫 표시일'},
      {key:'oai_shrine_auto_visit_prompt_v1', label:'자동 순례등록 안내 상태'}
    ];
    function dataBackupTodayName(){
      var d=new Date();
      function pad(n){ return String(n).padStart(2,'0'); }
      return d.getFullYear()+pad(d.getMonth()+1)+pad(d.getDate())+'-'+pad(d.getHours())+pad(d.getMinutes());
    }
    function collectUserDataBackup(){
      var items={};
      DATA_BACKUP_KEYS.forEach(function(entry){
        try{
          var value=localStorage.getItem(entry.key);
          if(value !== null) items[entry.key]=value;
        }catch(_e){}
      });
      return {
        type: DATA_BACKUP_TYPE,
        app: '가톨릭길동무',
        build: DATA_BACKUP_BUILD,
        version: 1,
        exportedAt: new Date().toISOString(),
        items: items
      };
    }
    function summarizeBackupPayload(payload){
      var items = payload && payload.items && typeof payload.items === 'object' ? payload.items : {};
      var summary=[];
      try{
        if(items.oai_my_diocese_name) summary.push('나의 교구');
        if(items.oai_my_parish_data) summary.push('나의 본당');
        var visits=items.oai_shrine_visits_v1 ? JSON.parse(items.oai_shrine_visits_v1) : null;
        var shrineCount=0, visitCount=0;
        if(visits && typeof visits === 'object'){
          Object.keys(visits).forEach(function(k){
            var rec=visits[k];
            var arr=rec && Array.isArray(rec.visits) ? rec.visits : [];
            if(arr.length){ shrineCount++; visitCount += arr.length; }
          });
        }
        if(shrineCount) summary.push('순례현황 '+shrineCount+'곳/'+visitCount+'회');
      }catch(_e){}
      try{
        var pr=items.pr_favorites ? JSON.parse(items.pr_favorites) : [];
        if(Array.isArray(pr) && pr.length) summary.push('기도문 즐겨찾기 '+pr.length+'개');
      }catch(_e){}
      try{
        var web=items.web_favorites_v1 ? JSON.parse(items.web_favorites_v1) : [];
        if(Array.isArray(web) && web.length) summary.push('가톨릭 정보 즐겨찾기 '+web.length+'개');
      }catch(_e){}
      return summary.length ? summary.join('\n') : '저장된 사용자 정보가 거의 없습니다.';
    }
    function dataBackupFileName(){ return 'catholic-gildongmu-backup-'+dataBackupTodayName()+'.json'; }
    function buildUserDataBackupFile(){
      var payload=collectUserDataBackup();
      var text=JSON.stringify(payload,null,2);
      var name=dataBackupFileName();
      var blob=new Blob([text], {type:'application/json;charset=utf-8'});
      return {payload:payload, text:text, name:name, blob:blob};
    }
    function encodeTextBase64Url(text){
      var bin='';
      text=String(text || '');
      try{
        if(typeof TextEncoder !== 'undefined'){
          var bytes=new TextEncoder().encode(text);
          for(var i=0;i<bytes.length;i+=0x8000){
            var chunk=bytes.subarray(i, i+0x8000);
            bin += String.fromCharCode.apply(null, Array.prototype.slice.call(chunk));
          }
        }else{
          bin=unescape(encodeURIComponent(text));
        }
      }catch(_e){
        bin=unescape(encodeURIComponent(text));
      }
      return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    }
    function decodeTextBase64Url(code){
      code=String(code || '').trim().replace(/-/g,'+').replace(/_/g,'/');
      while(code.length % 4) code += '=';
      var bin=atob(code);
      try{
        if(typeof TextDecoder !== 'undefined'){
          var bytes=new Uint8Array(bin.length);
          for(var i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
          return new TextDecoder('utf-8').decode(bytes);
        }
      }catch(_e){}
      return decodeURIComponent(escape(bin));
    }
    function buildUserDataBackupCode(){
      var payload=collectUserDataBackup();
      var compact=JSON.stringify(payload);
      var code='CGM-BACKUP-V1:'+encodeTextBase64Url(compact);
      var text=code;
      return {payload:payload, code:code, text:text};
    }
    function extractUserDataBackupCode(text){
      text=String(text || '').trim();
      var m=text.match(/CGM-BACKUP-V1:([A-Za-z0-9_-]+)/);
      if(m && m[1]) return m[1];
      var compact=text.replace(/\s+/g,'');
      if(compact.indexOf('CGM-BACKUP-V1:') === 0) return compact.slice('CGM-BACKUP-V1:'.length);
      if(/^[A-Za-z0-9_-]+$/.test(compact)) return compact;
      return '';
    }
    function parseUserDataBackupCode(text){
      var code=extractUserDataBackupCode(text);
      if(!code) return null;
      var json=decodeTextBase64Url(code);
      return normalizeRestorePayload(JSON.parse(json));
    }
    function copyTextToClipboard(text){
      text=String(text || '');
      function fallback(){
        return new Promise(function(resolve,reject){
          try{
            var ta=document.createElement('textarea');
            ta.value=text;
            ta.setAttribute('readonly','readonly');
            ta.style.position='fixed';
            ta.style.left='-9999px';
            ta.style.top='0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            var ok=false;
            try{ ok=document.execCommand && document.execCommand('copy'); }catch(_e){ ok=false; }
            setTimeout(function(){ try{ ta.remove(); }catch(_e){} }, 80);
            if(ok) resolve();
            else reject(new Error('copy-failed'));
          }catch(e){ reject(e); }
        });
      }
      try{
        if(navigator && navigator.clipboard && navigator.clipboard.writeText){
          return navigator.clipboard.writeText(text).catch(function(){ return fallback(); });
        }
      }catch(_e){}
      return fallback();
    }
    function recordUserDataBackupTime(){
      try{ localStorage.setItem(DATA_BACKUP_LAST_TIME_KEY, new Date().toISOString()); }catch(_e){}
    }
    function formatDataBackupTime(iso){
      try{
        if(!iso) return '';
        var d=new Date(iso);
        if(!isFinite(d.getTime())) return '';
        function pad(n){ return String(n).padStart(2,'0'); }
        return d.getFullYear()+'.'+pad(d.getMonth()+1)+'.'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
      }catch(_e){ return ''; }
    }
    function getLastDataBackupTimeText(){
      try{ return formatDataBackupTime(localStorage.getItem(DATA_BACKUP_LAST_TIME_KEY)); }catch(_e){ return ''; }
    }
    function setMyInfoActionStatus(message, kind, busy){
      try{
        var el=document.getElementById('my-faith-info-action-status');
        if(!el) return;
        var text=String(message || '').trim();
        if(!text){
          el.hidden=true;
          el.textContent='';
          el.className='my-faith-info-action-status';
          return;
        }
        if(myFaithInfoActionTimer){ try{ clearTimeout(myFaithInfoActionTimer); }catch(_e){} myFaithInfoActionTimer=null; }
        el.hidden=false;
        el.textContent=text;
        el.className='my-faith-info-action-status '+(busy?'is-busy ':'')+(kind?('is-'+kind):'');
      }catch(_e){}
    }
    function setMyInfoActionStatusLater(message, kind, busy, delay){
      try{
        if(myFaithInfoActionTimer){ try{ clearTimeout(myFaithInfoActionTimer); }catch(_e){} myFaithInfoActionTimer=null; }
        myFaithInfoActionTimer=setTimeout(function(){
          myFaithInfoActionTimer=null;
          setMyInfoActionStatus(message, kind, busy);
        }, Math.max(0, Number(delay)||0));
      }catch(_e){}
    }
    function setMyInfoActionButtonsDisabled(disabled){
      try{
        var layer=document.getElementById('my-faith-info-management-layer');
        if(!layer) return;
        Array.prototype.forEach.call(layer.querySelectorAll('.my-faith-data-btn, .my-faith-code-btn'), function(btn){
          try{ btn.disabled=!!disabled; }catch(_e){}
          try{ btn.classList.toggle('is-disabled', !!disabled); }catch(_e){}
          try{ btn.setAttribute('aria-disabled', disabled ? 'true' : 'false'); }catch(_e){}
        });
      }catch(_e){}
    }
    function refreshMyFaithDataPanelAfterBackup(){
      try{
        if(!myFaithInfoManagementOpen) return;
        setTimeout(function(){
          try{ updateMyInfoManagementLastBackupText(); }catch(_e){}
        }, 120);
      }catch(_e){}
    }
    function saveBlobAsDownload(fileInfo, silent){
      var url=URL.createObjectURL(fileInfo.blob);
      var a=document.createElement('a');
      a.href=url;
      a.download=fileInfo.name;
      a.style.display='none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){ try{ URL.revokeObjectURL(url); a.remove(); }catch(_e){} }, 1200);
      recordUserDataBackupTime();
      refreshMyFaithDataPanelAfterBackup();
      if(!silent){
        try{ alert('백업이 완료되었습니다.\n\n'+summarizeBackupPayload(fileInfo.payload)); }catch(_e){}
      }
    }
    function downloadUserDataBackup(){
      try{
        setMyInfoActionButtonsDisabled(true);
        setMyInfoActionStatus('내 정보 백업 파일을 만드는 중입니다...', 'busy', true);
        setTimeout(function(){
          try{
            var fileInfo=buildUserDataBackupFile();
            saveBlobAsDownload(fileInfo, false);
            setMyInfoActionStatus('백업이 완료되었습니다.', 'ok', false);
          }catch(e){
            console.warn('[가톨릭길동무]', e);
            setMyInfoActionStatus('백업 파일을 만들지 못했습니다. 저장 권한을 확인해 주세요.', 'error', false);
            try{ alert('백업 파일을 만들지 못했습니다. 브라우저 저장 권한을 확인해 주세요.'); }catch(_e){}
          }finally{
            setMyInfoActionButtonsDisabled(false);
          }
        }, 80);
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionButtonsDisabled(false);
        setMyInfoActionStatus('백업 파일을 만들지 못했습니다. 저장 권한을 확인해 주세요.', 'error', false);
        try{ alert('백업 파일을 만들지 못했습니다. 브라우저 저장 권한을 확인해 주세요.'); }catch(_e){}
      }
    }
    function shareUserDataBackup(){
      try{
        setMyInfoActionButtonsDisabled(true);
        setMyInfoActionStatus('백업 파일 공유창을 여는 중입니다...', 'busy', true);
        setTimeout(function(){
          try{
            var fileInfo=buildUserDataBackupFile();
            var file=null;
            try{ file=new File([fileInfo.blob], fileInfo.name, {type:'application/json'}); }catch(_e){ file=null; }
            var canShareFile=!!(navigator && navigator.share && file && (!navigator.canShare || navigator.canShare({files:[file]})));
            if(canShareFile){
              navigator.share({
                title:'가톨릭길동무 백업 파일',
                text:'기기 변경 시 복원할 가톨릭길동무 백업 파일입니다.',
                files:[file]
              }).then(function(){
                recordUserDataBackupTime();
                refreshMyFaithDataPanelAfterBackup();
                setMyInfoActionStatus('공유창을 열었습니다. 카카오톡 나에게 보내기 등에 보관해 주세요.', 'ok', false);
                setMyInfoActionButtonsDisabled(false);
              }).catch(function(err){
                setMyInfoActionButtonsDisabled(false);
                if(err && (err.name === 'AbortError' || err.name === 'NotAllowedError')){
                  setMyInfoActionStatus('공유를 취소했습니다.', 'warn', false);
                  return;
                }
                console.warn('[가톨릭길동무]', err);
                setMyInfoActionStatus('공유창을 열지 못해 백업 파일을 저장했습니다. 저장된 파일을 카카오톡 등에 보관해 주세요.', 'warn', false);
                try{ alert('이 기기에서는 파일 공유가 원활하지 않아 백업 파일을 저장합니다. 저장된 파일을 카카오톡 나에게 보내기 등에 보관해 주세요.'); }catch(_e){}
                saveBlobAsDownload(fileInfo, true);
              });
              return;
            }
            setMyInfoActionStatus('이 기기에서는 공유창을 열 수 없어 백업 파일을 저장했습니다. 저장된 파일을 카카오톡 등에 보관해 주세요.', 'warn', false);
            try{ alert('이 기기에서는 백업 파일 공유하기를 사용할 수 없어 백업 파일을 저장합니다. 저장된 파일을 카카오톡 나에게 보내기, Google Drive, 이메일 등에 보관해 주세요.'); }catch(_e){}
            saveBlobAsDownload(fileInfo, true);
            setMyInfoActionButtonsDisabled(false);
          }catch(e){
            console.warn('[가톨릭길동무]', e);
            setMyInfoActionButtonsDisabled(false);
            setMyInfoActionStatus('백업 파일 공유하기를 실행하지 못했습니다. 내 정보 백업으로 파일을 저장해 주세요.', 'error', false);
            try{ alert('백업 파일 공유하기를 실행하지 못했습니다. 내 정보 백업으로 파일을 저장한 뒤 카카오톡 등에 보관해 주세요.'); }catch(_e){}
          }
        }, 80);
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionButtonsDisabled(false);
        setMyInfoActionStatus('백업 파일 공유하기를 실행하지 못했습니다.', 'error', false);
      }
    }
    function showBackupCodeManualBox(text){
      try{
        var box=document.getElementById('my-faith-info-code-copy-box');
        var ta=document.getElementById('my-faith-info-code-copy-text');
        if(!box || !ta) return;
        box.hidden=false;
        ta.value=String(text || '');
        setTimeout(function(){ try{ ta.focus(); ta.select(); ta.setSelectionRange(0, ta.value.length); }catch(_e){} }, 60);
      }catch(_e){}
    }
    function hideBackupCodeBoxes(which){
      try{
        if(!which || which === 'copy'){
          var copyBox=document.getElementById('my-faith-info-code-copy-box');
          if(copyBox) copyBox.hidden=true;
        }
        if(!which || which === 'restore'){
          var restoreBox=document.getElementById('my-faith-info-code-restore-box');
          if(restoreBox){
            restoreBox.hidden=true;
            var group=restoreBox.closest ? restoreBox.closest('.my-faith-data-action-group') : null;
            var list=group ? group.querySelector('.my-faith-data-actions') : null;
            if(list) list.hidden=false;
            if(group) group.classList.remove('is-code-restore-open');
          }
        }
      }catch(_e){}
    }
    function copyUserDataBackupCode(){
      try{
        setMyInfoActionButtonsDisabled(true);
        hideBackupCodeBoxes();
        setMyInfoActionStatus('백업 코드를 만드는 중입니다...', 'busy', true);
        setTimeout(function(){
          var codeInfo=null;
          try{
            codeInfo=buildUserDataBackupCode();
            copyTextToClipboard(codeInfo.text).then(function(){
              recordUserDataBackupTime();
              refreshMyFaithDataPanelAfterBackup();
              setMyInfoActionStatus('백업 코드를 복사했습니다. 카카오톡 나에게 보내기에 붙여넣어 보관하세요.', 'ok', false);
              try{ alert('백업 코드가 복사되었습니다.\n\n카카오톡 나에게 보내기 방에 붙여넣어 보관하세요.\n\n'+summarizeBackupPayload(codeInfo.payload)); }catch(_e){}
              setMyInfoActionButtonsDisabled(false);
            }).catch(function(err){
              console.warn('[가톨릭길동무]', err);
              showBackupCodeManualBox(codeInfo ? codeInfo.text : '');
              setMyInfoActionStatus('자동 복사가 안 되었습니다. 아래 백업 코드를 길게 눌러 복사해 주세요.', 'warn', false);
              setMyInfoActionButtonsDisabled(false);
            });
          }catch(e){
            console.warn('[가톨릭길동무]', e);
            setMyInfoActionStatus('백업 코드를 만들지 못했습니다.', 'error', false);
            try{ alert('백업 코드를 만들지 못했습니다.'); }catch(_e){}
            setMyInfoActionButtonsDisabled(false);
          }
        }, 80);
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionButtonsDisabled(false);
        setMyInfoActionStatus('백업 코드를 만들지 못했습니다.', 'error', false);
      }
    }
    function scrollUserDataRestoreBoxUp(){
      try{
        var box=document.getElementById('my-faith-info-code-restore-box');
        var content=box && box.closest ? box.closest('.my-faith-info-content') : null;
        if(!box || !content) return;
        var top=Math.max(0, box.offsetTop - 6);
        content.scrollTop=top;
      }catch(_e){}
    }
    function openUserDataCodeRestoreBox(){
      try{
        hideBackupCodeBoxes('copy');
        var box=document.getElementById('my-faith-info-code-restore-box');
        var ta=document.getElementById('my-faith-info-code-restore-text');
        var group=box && box.closest ? box.closest('.my-faith-data-action-group') : null;
        var list=group ? group.querySelector('.my-faith-data-actions') : null;
        if(!box || !ta){
          setMyInfoActionStatus('백업 코드 입력창을 열지 못했습니다.', 'error', false);
          return;
        }
        /* V8-1-14-305:
           복원 입력 영역을 위쪽에 보여 주되, 아래의 백업 코드 복사/복원 버튼 묶음은
           함께 숨겨 중복 화면처럼 보이지 않게 한다. */
        try{ if(group && list && box.previousElementSibling !== list) group.insertBefore(box, list); }catch(_e){}
        try{ if(group) group.classList.add('is-code-restore-open'); }catch(_e){}
        try{ var dialog=box.closest ? box.closest('.my-faith-info-dialog') : null; if(dialog) dialog.classList.add('is-code-restore-active'); }catch(_e){}
        try{ if(list) list.hidden=true; }catch(_e){}
        box.hidden=false;
        try{
          ta.readOnly=false;
          ta.removeAttribute('readonly');
          ta.setAttribute('inputmode','text');
          ta.blur && ta.blur();
        }catch(_e){}
        setMyInfoActionStatus('입력칸을 길게 눌러 백업 코드를 붙여넣은 뒤 복원 실행을 누르세요.', 'ok', false);
        setTimeout(scrollUserDataRestoreBoxUp, 40);
        setTimeout(scrollUserDataRestoreBoxUp, 180);
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionStatus('백업 코드 입력창을 열지 못했습니다.', 'error', false);
      }
    }
    function cancelUserDataCodeRestore(){
      try{
        setMyInfoActionButtonsDisabled(false);
        var ta=document.getElementById('my-faith-info-code-restore-text');
        try{ var dialog=ta && ta.closest ? ta.closest('.my-faith-info-dialog') : null; if(dialog) dialog.classList.remove('is-code-restore-active'); }catch(_e){}
        if(ta) ta.value='';
        hideBackupCodeBoxes('restore');
        setMyInfoActionStatus('백업 코드 복원창을 닫았습니다.', 'ok', false);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function restoreUserDataBackupFromCodeText(text){
      try{
        text=String(text || '').trim();
        if(!text){
          setMyInfoActionStatus('붙여넣은 백업 코드가 없습니다.', 'warn', false);
          return;
        }
        setMyInfoActionButtonsDisabled(true);
        setMyInfoActionStatus('백업 코드를 확인하는 중입니다...', 'busy', true);
        setTimeout(function(){
          try{
            var payload=parseUserDataBackupCode(text);
            if(!payload){
              setMyInfoActionButtonsDisabled(false);
              setMyInfoActionStatus('가톨릭길동무 백업 코드가 아닙니다.', 'error', false);
              try{ alert('가톨릭길동무 백업 코드가 아닙니다.'); }catch(_e){}
              return;
            }
            var msg='복원하면 현재 저장된 즐겨찾기, 순례현황, 나의 설정이 백업 코드 내용으로 바뀝니다.\n\n'+summarizeBackupPayload(payload)+'\n\n계속할까요?';
            if(!window.confirm(msg)){
              setMyInfoActionButtonsDisabled(false);
              setMyInfoActionStatus('복원을 취소했습니다.', 'warn', false);
              return;
            }
            setMyInfoActionStatus('내 정보를 복원하는 중입니다...', 'busy', true);
            setTimeout(function(){
              try{
                var restored=applyUserDataBackup(payload);
                setMyInfoActionStatus('복원이 완료되었습니다. 화면을 새로고침합니다...', 'ok', true);
                try{ alert('복원 완료: '+(restored.length?restored.join(', '):'복원할 항목 없음')+'\n\n화면을 새로고침합니다.'); }catch(_e){}
                setTimeout(function(){ try{ location.reload(); }catch(_e){} }, 300);
              }catch(e){
                console.warn('[가톨릭길동무]', e);
                setMyInfoActionButtonsDisabled(false);
                setMyInfoActionStatus('복원 중 오류가 발생했습니다.', 'error', false);
                try{ alert('복원 중 오류가 발생했습니다.'); }catch(_e){}
              }
            }, 120);
          }catch(e){
            console.warn('[가톨릭길동무]', e);
            setMyInfoActionButtonsDisabled(false);
            setMyInfoActionStatus('백업 코드를 읽지 못했습니다. 복사한 내용을 확인해 주세요.', 'error', false);
            try{ alert('백업 코드를 읽지 못했습니다. 카카오톡에 저장한 코드를 다시 복사해 주세요.'); }catch(_e){}
          }
        }, 90);
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionButtonsDisabled(false);
        setMyInfoActionStatus('백업 코드를 읽지 못했습니다.', 'error', false);
      }
    }
    function executeUserDataCodeRestore(e){
      try{
        if(e){
          if(e.preventDefault) e.preventDefault();
          if(e.stopPropagation) e.stopPropagation();
        }
        var ta=document.getElementById('my-faith-info-code-restore-text');
        var text=ta ? ta.value : '';
        try{ if(ta && ta.blur) ta.blur(); }catch(_e){}
        try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
        restoreUserDataBackupFromCodeText(text);
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionStatus('백업 코드 복원을 실행하지 못했습니다.', 'error', false);
      }
    }

    function normalizeRestorePayload(payload){
      if(!payload || typeof payload !== 'object') return null;
      if(payload.type !== DATA_BACKUP_TYPE) return null;
      if(!payload.items || typeof payload.items !== 'object') return null;
      return payload;
    }
    function applyUserDataBackup(payload){
      var restored=[];
      var items=payload.items || {};
      DATA_BACKUP_KEYS.forEach(function(entry){
        if(!Object.prototype.hasOwnProperty.call(items, entry.key)) return;
        var value=items[entry.key];
        try{
          if(value === null || typeof value === 'undefined') localStorage.removeItem(entry.key);
          else localStorage.setItem(entry.key, String(value));
          restored.push(entry.label);
        }catch(e){ console.warn('[가톨릭길동무]', e); }
      });
      return restored;
    }
    function restoreUserDataBackupFromFile(file){
      if(!file){ setMyInfoActionStatus('백업 파일을 선택하지 않아 복원하지 않았습니다.', 'warn', false); return; }
      if(typeof FileReader === 'undefined'){
        setMyInfoActionStatus('이 기기에서는 파일 복원을 사용할 수 없습니다.', 'error', false);
        try{ alert('이 기기에서는 파일 복원을 사용할 수 없습니다.'); }catch(_e){}
        return;
      }
      setMyInfoActionButtonsDisabled(true);
      setMyInfoActionStatus('백업 파일을 읽는 중입니다...', 'busy', true);
      var reader=new FileReader();
      reader.onload=function(){
        try{
          setMyInfoActionStatus('백업 파일을 확인하는 중입니다...', 'busy', true);
          var payload=normalizeRestorePayload(JSON.parse(String(reader.result||'')));
          if(!payload){
            setMyInfoActionButtonsDisabled(false);
            setMyInfoActionStatus('가톨릭길동무 백업 파일이 아닙니다.', 'error', false);
            try{ alert('가톨릭길동무 백업 파일이 아닙니다.'); }catch(_e){}
            return;
          }
          var msg='복원하면 현재 저장된 즐겨찾기, 순례현황, 나의 설정이 백업 파일 내용으로 바뀝니다.\n\n'+summarizeBackupPayload(payload)+'\n\n계속할까요?';
          if(!window.confirm(msg)){
            setMyInfoActionButtonsDisabled(false);
            setMyInfoActionStatus('복원을 취소했습니다.', 'warn', false);
            return;
          }
          setMyInfoActionStatus('내 정보를 복원하는 중입니다...', 'busy', true);
          setTimeout(function(){
            try{
              var restored=applyUserDataBackup(payload);
              setMyInfoActionStatus('백업 파일 복원이 완료되었습니다. 화면을 새로고침합니다...', 'ok', true);
              try{ alert('백업 파일 복원이 완료되었습니다.\n\n화면을 새로고침합니다.'); }catch(_e){}
              setTimeout(function(){ try{ location.reload(); }catch(_e){} }, 300);
            }catch(e){
              console.warn('[가톨릭길동무]', e);
              setMyInfoActionButtonsDisabled(false);
              setMyInfoActionStatus('복원 중 오류가 발생했습니다.', 'error', false);
              try{ alert('복원 중 오류가 발생했습니다.'); }catch(_e){}
            }
          }, 120);
        }catch(e){
          console.warn('[가톨릭길동무]', e);
          setMyInfoActionButtonsDisabled(false);
          setMyInfoActionStatus('백업 파일을 읽지 못했습니다. 파일 형식을 확인해 주세요.', 'error', false);
          try{ alert('백업 파일을 읽지 못했습니다. 파일이 손상되었거나 형식이 다릅니다.'); }catch(_e){}
        }
      };
      reader.onerror=function(){
        setMyInfoActionButtonsDisabled(false);
        setMyInfoActionStatus('백업 파일을 읽지 못했습니다.', 'error', false);
        try{ alert('백업 파일을 읽지 못했습니다.'); }catch(_e){}
      };
      reader.readAsText(file, 'utf-8');
    }
    function openUserDataRestorePicker(){
      try{
        /* V8-1-14-305:
           Android/WebView와 일부 모바일 브라우저는 파일 선택창(input.click)을
           사용자 터치 흐름 안에서 바로 실행해야 한다. setTimeout 뒤에 실행하면
           사용자 선택 동작으로 인정되지 않아 파일 선택이 실패하거나 취소처럼 보일 수 있다. */
        setMyInfoActionButtonsDisabled(false);
        hideBackupCodeBoxes();
        setMyInfoActionStatus('백업 파일 선택창을 엽니다. 파일을 선택하면 복원이 시작됩니다.', 'ok', false);
        var input=document.createElement('input');
        input.type='file';
        input.accept='application/json,.json';
        input.style.position='fixed';
        input.style.left='-9999px';
        input.style.top='0';
        input.style.width='1px';
        input.style.height='1px';
        input.style.opacity='0';
        input.setAttribute('aria-hidden','true');
        var cleaned=false;
        function cleanupInput(){
          if(cleaned) return;
          cleaned=true;
          setTimeout(function(){ try{ input.remove(); }catch(_e){} }, 700);
        }
        input.addEventListener('change', function(){
          var file=input.files && input.files[0];
          if(!file){
            setMyInfoActionStatus('백업 파일을 선택하지 않아 복원하지 않았습니다.', 'warn', false);
            cleanupInput();
            return;
          }
          restoreUserDataBackupFromFile(file);
          cleanupInput();
        });
        try{
          input.addEventListener('cancel', function(){
            setMyInfoActionStatus('백업 파일을 선택하지 않아 복원하지 않았습니다.', 'warn', false);
            cleanupInput();
          });
        }catch(_e){}
        document.body.appendChild(input);
        try{ input.click(); }
        catch(_e){
          cleanupInput();
          setMyInfoActionStatus('백업 파일 선택창을 열지 못했습니다. 백업 코드 복원을 사용해 주세요.', 'error', false);
        }
      }catch(e){
        console.warn('[가톨릭길동무]', e);
        setMyInfoActionButtonsDisabled(false);
        setMyInfoActionStatus('백업 파일 선택창을 열지 못했습니다. 백업 코드 복원을 사용해 주세요.', 'error', false);
        try{ alert('백업 파일 선택창을 열지 못했습니다. 백업 코드 복원을 사용해 주세요.'); }catch(_e){}
      }
    }
    function updateMyInfoManagementLastBackupText(){
      try{
        var el=document.getElementById('my-faith-info-last-backup');
        if(!el) return;
        var lastText=getLastDataBackupTimeText();
        if(lastText){
          el.hidden=false;
          el.textContent='마지막 백업: '+lastText;
        }else{
          el.hidden=true;
          el.textContent='';
        }
      }catch(_e){}
    }
    function closeMyInfoManagementModal(){
      try{
        myFaithInfoManagementOpen=false;
        if(modal && modal.classList) modal.classList.remove('my-faith-info-modal-open');
        var layer=myFaithInfoManagementLayer || document.getElementById('my-faith-info-management-layer');
        myFaithInfoManagementLayer=null;
        if(layer){
          layer.classList.remove('show');
          layer.setAttribute('aria-hidden','true');
          setTimeout(function(){ try{ if(layer && layer.parentNode) layer.parentNode.removeChild(layer); }catch(_e){} }, 90);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function buildMyInfoManagementModal(){
      var layer=document.createElement('div');
      layer.id='my-faith-info-management-layer';
      layer.className='my-faith-info-layer show';
      layer.setAttribute('aria-hidden','false');

      var backdrop=document.createElement('div');
      backdrop.className='my-faith-info-backdrop';
      backdrop.setAttribute('data-my-info-close','true');
      layer.appendChild(backdrop);

      var dialog=document.createElement('section');
      dialog.className='my-faith-info-dialog';
      dialog.setAttribute('role','dialog');
      dialog.setAttribute('aria-modal','true');
      dialog.setAttribute('aria-labelledby','my-faith-info-title');
      dialog.tabIndex=-1;

      var head=document.createElement('div');
      head.className='my-faith-info-head';
      var h=document.createElement('h3');
      h.id='my-faith-info-title';
      h.textContent='내 정보 백업·복원';
      var close=document.createElement('button');
      close.type='button';
      close.className='my-faith-info-close';
      close.setAttribute('aria-label','내 정보 백업·복원 닫기');
      close.textContent='×';
      bindMyFaithClick(close, closeMyInfoManagementModal);
      head.appendChild(h);
      head.appendChild(close);
      dialog.appendChild(head);

      var content=document.createElement('div');
      content.className='my-faith-info-content';
      var desc=document.createElement('p');
      desc.className='my-faith-data-desc';
      desc.textContent='앱을 삭제하거나 기기를 변경할 때는 백업 코드를 복사해 카카오톡 나에게 보내기에 보관하세요. 즐겨찾기·순례 스탬프·나의 신앙생활 정보가 저장됩니다.';
      content.appendChild(desc);

      function makeActionItem(btn, noteText){
        var item=document.createElement('div');
        item.className='my-faith-data-action-item';
        item.appendChild(btn);
        if(noteText){
          var note=document.createElement('p');
          note.className='my-faith-data-btn-note';
          note.textContent=noteText;
          item.appendChild(note);
        }
        return item;
      }
      function makeActionGroup(titleText, guideText, extraClass){
        var group=document.createElement('section');
        group.className='my-faith-data-action-group' + (extraClass ? (' ' + extraClass) : '');
        var title=document.createElement('h4');
        title.className='my-faith-data-group-title';
        title.textContent=titleText;
        group.appendChild(title);
        if(guideText){
          var guide=document.createElement('p');
          guide.className='my-faith-data-group-guide';
          guide.textContent=guideText;
          group.appendChild(guide);
        }
        var list=document.createElement('div');
        list.className='my-faith-data-actions';
        group.appendChild(list);
        group._myFaithActionList=list;
        return group;
      }

      var codeGroup=makeActionGroup('백업 코드 관리', '', 'is-code-backup is-code-only');

      var codeCopyBtn=document.createElement('button');
      codeCopyBtn.type='button';
      codeCopyBtn.className='my-faith-data-btn my-faith-data-code-backup-btn';
      codeCopyBtn.textContent='백업 코드 복사';
      bindMyFaithClick(codeCopyBtn, copyUserDataBackupCode);
      var codeRestoreBtn=document.createElement('button');
      codeRestoreBtn.type='button';
      codeRestoreBtn.className='my-faith-data-btn my-faith-data-code-restore-btn';
      codeRestoreBtn.textContent='백업 코드 복원';
      bindMyFaithClick(codeRestoreBtn, openUserDataCodeRestoreBox);
      codeGroup._myFaithActionList.appendChild(makeActionItem(codeCopyBtn, '코드를 복사해 카카오톡 나에게 보내기에 보관합니다.'));
      codeGroup._myFaithActionList.appendChild(makeActionItem(codeRestoreBtn, '보관한 코드를 붙여넣어 정보를 복원합니다.'));

      var copyBox=document.createElement('div');
      copyBox.id='my-faith-info-code-copy-box';
      copyBox.className='my-faith-code-box';
      copyBox.hidden=true;
      var copyNote=document.createElement('p');
      copyNote.className='my-faith-code-box-note';
      copyNote.textContent='자동 복사가 안 되면 아래 코드를 복사해 카카오톡에 보관하세요.';
      var copyText=document.createElement('textarea');
      copyText.id='my-faith-info-code-copy-text';
      copyText.className='my-faith-code-textarea';
      copyText.readOnly=true;
      copyText.setAttribute('aria-label','백업 코드');
      copyBox.appendChild(copyNote);
      copyBox.appendChild(copyText);
      codeGroup.appendChild(copyBox);

      var restoreBox=document.createElement('div');
      restoreBox.id='my-faith-info-code-restore-box';
      restoreBox.className='my-faith-code-box';
      restoreBox.hidden=true;
      var restoreCodeNote=document.createElement('p');
      restoreCodeNote.className='my-faith-code-box-note';
      restoreCodeNote.textContent='카카오톡 나에게 보내기에 보관한 백업 코드를 입력칸에 길게 눌러 붙여넣으세요.';
      var restoreText=document.createElement('textarea');
      restoreText.id='my-faith-info-code-restore-text';
      restoreText.className='my-faith-code-textarea';
      restoreText.placeholder='백업 코드를 붙여넣으세요.';
      restoreText.setAttribute('aria-label','복원할 백업 코드');
      restoreText.readOnly=false;
      restoreText.setAttribute('inputmode','text');
      try{ restoreText.addEventListener('focus', function(){ setTimeout(scrollUserDataRestoreBoxUp, 80); setTimeout(scrollUserDataRestoreBoxUp, 260); }, false); }catch(_e){}
      var restoreRow=document.createElement('div');
      restoreRow.className='my-faith-code-row';
      var restoreRun=document.createElement('button');
      restoreRun.type='button';
      restoreRun.className='my-faith-code-btn my-faith-code-run-btn';
      restoreRun.textContent='복원 실행';
      bindMyFaithImmediateClick(restoreRun, executeUserDataCodeRestore);
      var restoreCancel=document.createElement('button');
      restoreCancel.type='button';
      restoreCancel.className='my-faith-code-btn my-faith-code-cancel-btn';
      restoreCancel.textContent='취소';
      (function(){
        var lastCancelAt=0;
        function runCancel(e){
          try{
            if(e){
              if(e.preventDefault) e.preventDefault();
              if(e.stopPropagation) e.stopPropagation();
              if(e.stopImmediatePropagation) e.stopImmediatePropagation();
            }
            var now=Date.now ? Date.now() : new Date().getTime();
            if(now-lastCancelAt<260) return false;
            lastCancelAt=now;
            cancelUserDataCodeRestore();
          }catch(_e){}
          return false;
        }
        try{ restoreCancel.addEventListener('pointerdown', runCancel, true); }catch(_e){}
        try{ restoreCancel.addEventListener('touchstart', runCancel, {capture:true, passive:false}); }catch(_e){}
        try{ restoreCancel.addEventListener('click', runCancel, true); }catch(_e){}
      })();
      restoreRow.appendChild(restoreRun);
      restoreRow.appendChild(restoreCancel);
      restoreBox.appendChild(restoreCodeNote);
      restoreBox.appendChild(restoreText);
      restoreBox.appendChild(restoreRow);
      codeGroup.appendChild(restoreBox);
      content.appendChild(codeGroup);

      var last=document.createElement('p');
      last.id='my-faith-info-last-backup';
      last.className='my-faith-data-last';
      content.appendChild(last);

      var status=document.createElement('p');
      status.id='my-faith-info-action-status';
      status.className='my-faith-info-action-status';
      status.hidden=true;
      content.appendChild(status);

      dialog.appendChild(content);
      layer.appendChild(dialog);
      layer.addEventListener('click', function(e){
        try{
          if(e && e.target && e.target.getAttribute && e.target.getAttribute('data-my-info-close') === 'true') closeMyInfoManagementModal();
        }catch(_e){}
      });
      return layer;
    }
    function openMyInfoManagementModal(){
      try{
        if(myFaithInfoManagementOpen && myFaithInfoManagementLayer) return;
        myFaithInfoManagementOpen=true;
        if(modal && modal.classList) modal.classList.add('my-faith-info-modal-open');
        var old=document.getElementById('my-faith-info-management-layer');
        if(old && old.parentNode) old.parentNode.removeChild(old);
        myFaithInfoManagementLayer=buildMyInfoManagementModal();
        modal.appendChild(myFaithInfoManagementLayer);
        updateMyInfoManagementLastBackupText();
        setTimeout(function(){ try{ var d=myFaithInfoManagementLayer && myFaithInfoManagementLayer.querySelector('.my-faith-info-dialog'); if(d && d.focus) d.focus(); }catch(_e){} }, 40);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function appendDataBackupSection(rerender){
      var sec=document.createElement('section');
      sec.className='my-faith-section my-faith-data-section is-closed';
      var toggle=document.createElement('button');
      toggle.type='button';
      toggle.className='my-faith-data-toggle-btn';
      toggle.textContent='내 정보 백업·복원';
      toggle.setAttribute('aria-haspopup','dialog');
      toggle.setAttribute('aria-expanded','false');
      bindMyFaithClick(toggle, openMyInfoManagementModal);
      sec.appendChild(toggle);
      var note=document.createElement('p');
      note.className='my-faith-data-toggle-note';
      note.textContent='앱 삭제·기기 변경 시 백업 코드를 보관하세요.';
      sec.appendChild(note);
      return sec;
    }
    function setHeader(main, sub){ if(title){ title.textContent = main || '나의 신앙생활'; try{ title.setAttribute('data-myfaith-title', title.textContent); }catch(_e){} } if(subtitle) subtitle.textContent = sub || ''; }
    function setBodyMode(name){ body.className = name || 'my-faith-body'; body.innerHTML = ''; }
    function isElementVisibleForSetup(el){
      try{
        if(!el) return false;
        if(el.hidden) return false;
        if(el.getAttribute && el.getAttribute('aria-hidden') === 'true') return false;
        var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if(cs && (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0')) return false;
        return true;
      }catch(_e){ return false; }
    }
    function isInstallGuideVisible(){
      try{
        return isElementVisibleForSetup(document.getElementById('pwa-install-btn')) ||
               isElementVisibleForSetup(document.getElementById('ios-kakao-safari-banner'));
      }catch(_e){ return false; }
    }
    var setupBannerRefreshTimer = null;
    function scheduleSetupBannerUpdate(){
      try{
        if(setupBannerRefreshTimer) clearTimeout(setupBannerRefreshTimer);
        setupBannerRefreshTimer = setTimeout(function(){
          setupBannerRefreshTimer = null;
          updateSetupBanner();
        }, 40);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function bindSetupBannerVisibilityWatch(){
      try{
        ['pwa-install-btn','ios-kakao-safari-banner'].forEach(function(id){
          var el = document.getElementById(id);
          if(!el || el.__myDioceseSetupWatchBound) return;
          el.__myDioceseSetupWatchBound = true;
          new MutationObserver(scheduleSetupBannerUpdate).observe(el, {attributes:true, attributeFilter:['style','hidden','class','aria-hidden']});
        });
        if(document.documentElement && !document.documentElement.__myDioceseSetupWatchBound){
          document.documentElement.__myDioceseSetupWatchBound = true;
          new MutationObserver(scheduleSetupBannerUpdate).observe(document.documentElement, {attributes:true, attributeFilter:['class']});
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function updateSetupBanner(){
      try{
        var showBanner = !selectedName() && !isInstallGuideVisible();
        var coverEl = document.getElementById('cover');
        if(coverEl) coverEl.classList.toggle('my-diocese-setup-active', showBanner);
        if(!setupBanner) return;
        setupBanner.hidden = !showBanner;
        setupBanner.classList.toggle('show', showBanner);
        setupBanner.setAttribute('aria-hidden', showBanner ? 'false' : 'true');
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    window.refreshMyDioceseSetupBanner = scheduleSetupBannerUpdate;
    function updateButton(){
      btn.innerHTML = '<span class="cover-faith-cross" aria-hidden="true">✞</span><span class="diocese-btn-label">나의 신앙생활</span>';
      btn.setAttribute('aria-label','나의 신앙생활 열기');
      updateSetupBanner();
    }
    function refreshDependentViews(){
      try{ if(typeof _renderDioFilterBars === 'function') _renderDioFilterBars(_mode); }catch(_e){}
      try{ if(typeof window.webRenderCats === 'function') window.webRenderCats(); }catch(_e){}
      try{ if(typeof window.webRenderList === 'function') window.webRenderList(); }catch(_e){}
      try{ if(typeof window.prRefreshVisibleCats === 'function') window.prRefreshVisibleCats(); }catch(_e){}
    }
    var myFaithExternalSettleUntil = 0;
    function nowMs(){ return Date.now ? Date.now() : new Date().getTime(); }
    function markMyFaithExternalSettling(ms){
      try{
        myFaithExternalSettleUntil = nowMs() + (ms || 1800);
        if(modal && modal.classList) modal.classList.add('return-settling');
        clearTimeout(window.__oaiMyFaithExternalSettleTimer);
        window.__oaiMyFaithExternalSettleTimer = setTimeout(function(){
          try{ if(nowMs() >= myFaithExternalSettleUntil && modal && modal.classList) modal.classList.remove('return-settling'); }catch(_e){}
        }, ms || 1800);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function isMyFaithExternalSettling(){
      try{ return !!(myFaithExternalSettleUntil && nowMs() < myFaithExternalSettleUntil); }catch(_e){ return false; }
    }
    function updateMyFaithViewport(){
      try{
        var vv = window.visualViewport || null;
        var layoutH = Math.round(document.documentElement.clientHeight || window.innerHeight || 0);
        var innerH = Math.round(window.innerHeight || 0);
        var visibleH = Math.round((vv && vv.height) || innerH || layoutH || 0);
        var stableCandidateH = Math.max(layoutH || 0, innerH || 0);
        if(!stableCandidateH && visibleH) stableCandidateH = visibleH;
        if(stableCandidateH && stableCandidateH > myFaithStableHeight) myFaithStableHeight = stableCandidateH;
        if(!myFaithStableHeight) myFaithStableHeight = stableCandidateH || visibleH || 0;
        var active = document.activeElement || null;
        var focusedInput = !!(active && modal.contains(active) && /^(INPUT|TEXTAREA|SELECT)$/i.test(active.tagName || ''));
        if(isMyFaithExternalSettling() && !focusedInput){
          modal.classList.add('return-settling');
          return;
        }
        var keyboardLikely = focusedInput || !!(myFaithStableHeight && visibleH && visibleH < myFaithStableHeight - 120) || !!(vv && Math.round(vv.offsetTop || 0) > 0);
        var modalH = myFaithStableHeight || stableCandidateH || visibleH || 0;
        if(modalH > 0) modal.style.setProperty('--my-faith-vh', modalH + 'px');
        if(visibleH > 0) modal.style.setProperty('--my-faith-visible-vh', visibleH + 'px');
        modal.classList.toggle('keyboard-open', keyboardLikely);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }

    /* V8-1-14-44: 나의 신앙생활은 이제 module-view 카테고리로 동작한다.
       예전 팝업 전용 cover guard / hash trap / popstate 가드는 공통 뒤로가기와 충돌하므로 제거한다. */
    function clearLegacyMyFaithBackFlags(reason){
      try{
        window.__OAI_MYFAITH_COVER_GUARD_UNTIL__ = 0;
        window.__OAI_MYFAITH_COVER_EXIT_READY__ = false;
        window.__OAI_MYFAITH_COVER_GUARD_REASON__ = '';
        sessionStorage.removeItem('oai_myfaith_cover_guard_reason');
        sessionStorage.removeItem('oai_myfaith_return_cover_reason');
        sessionStorage.removeItem('oai_myfaith_return_cover_ts');
      }catch(_e){}
    }

    function closeModal(){
      var reason = 'my-faith-category-close';
      closeMyInfoManagementModal();
      cancelMyFaithPendingEdit();
      modal.classList.remove('show','open','keyboard-open','return-settling');
      modal.setAttribute('aria-hidden','true');
      try{ document.body.classList.remove('modal-open'); }catch(_e){}
      try{ modal.style.removeProperty('--my-faith-vh'); modal.style.removeProperty('--my-faith-visible-vh'); }catch(_e){}
      myFaithStableHeight = 0;
      try{ clearMyFaithExternalLinkFlag(); }catch(_e){}
      try{ clearLegacyMyFaithBackFlags(reason); }catch(_e){}
      try{
        if(typeof window.goToCover === 'function'){
          window.goToCover();
        }else{
          var cover = document.getElementById('cover');
          if(cover){ cover.style.display = ''; cover.style.opacity = ''; cover.style.pointerEvents = ''; }
          document.documentElement.classList.remove('app-active','parish-mode','retreat-mode');
          if(typeof window.oaiSetMainMapLayerHidden === 'function') window.oaiSetMainMapLayerHidden(false);
        }
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function openModal(opts){
      try{ clearLegacyMyFaithBackFlags('open'); }catch(_e){}
      opts = opts || {};
      if(!opts.keepContent) renderHome();
      updateMyFaithViewport();
      try{
        document.querySelectorAll('.module-view.open,#missa-view.open,#prayer-view.open,#diocese-view.open,#qna-view.open').forEach(function(v){
          if(v && v !== modal) v.classList.remove('open','show');
        });
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      try{
        var cover = document.getElementById('cover');
        if(cover){ cover.style.opacity = '0'; cover.style.display = 'none'; }
        document.documentElement.classList.add('app-active');
        document.documentElement.classList.remove('parish-mode','retreat-mode');
        if(typeof window.oaiSetMainMapLayerHidden === 'function') window.oaiSetMainMapLayerHidden(true);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      modal.classList.add('show','open');
      modal.setAttribute('aria-hidden','false');
      try{ document.body.classList.add('modal-open'); }catch(_e){}
      try{
        if(typeof window._resetCoverExitReady === 'function') window._resetCoverExitReady();
        if(typeof window._clearCoverExitArmed === 'function') window._clearCoverExitArmed();
        if(typeof window.oaiEnterView === 'function') window.oaiEnterView(modal);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
      setTimeout(updateMyFaithViewport, opts.fromExternal ? 180 : 80);
    }
    window.isMyFaithLifeModalOpen = function(){ try{ return !!(modal && modal.classList && (modal.classList.contains('show') || modal.classList.contains('open'))); }catch(_e){ return false; } };
    window.isMyFaithInfoManagementOpen = function(){ return !!myFaithInfoManagementOpen; };
    window.openMyFaithLifeModal = function(opts){ openModal(opts || {}); };
    window.openMyFaithInfoManagementModal = function(){ openModal({restore:true}); setTimeout(function(){ try{ openMyInfoManagementModal(); }catch(_e){} }, 70); };
    window.closeMyFaithLifeModal = function(){ if(myFaithInfoManagementOpen){ closeMyInfoManagementModal(); return; } closeModal(); };
    function normalizeMyFaithExternalUrl(url){
      url = String(url || '').trim();
      if(!url) return '';
      try{
        if(typeof prepareExternalUrl === 'function') url = prepareExternalUrl(url);
        else if(typeof normalizeCatholicExternalUrl === 'function') url = normalizeCatholicExternalUrl(url);
      }catch(_e){}
      return String(url || '').trim();
    }
    var MYFAITH_EXTERNAL_FLAG = 'oai_myfaith_external_link_pending';
    var MYFAITH_EXTERNAL_TS = 'oai_myfaith_external_link_ts';
    function markMyFaithExternalLink(){
      try{
        sessionStorage.setItem(MYFAITH_EXTERNAL_FLAG, '1');
        sessionStorage.setItem(MYFAITH_EXTERNAL_TS, String(Date.now ? Date.now() : new Date().getTime()));
      }catch(_e){}
      return true;
    }
    try{ window.oaiMarkMyFaithExternalLink = markMyFaithExternalLink; }catch(_e){}
    function clearMyFaithExternalLinkFlag(){
      try{ sessionStorage.removeItem(MYFAITH_EXTERNAL_FLAG); sessionStorage.removeItem(MYFAITH_EXTERNAL_TS); }catch(_e){}
    }
    function hasRecentMyFaithExternalLink(){
      try{
        if(sessionStorage.getItem(MYFAITH_EXTERNAL_FLAG) !== '1') return false;
        var ts = parseInt(sessionStorage.getItem(MYFAITH_EXTERNAL_TS) || '0', 10) || 0;
        if(ts && Date.now && Date.now() - ts > 10 * 60 * 1000){
          clearMyFaithExternalLinkFlag();
          return false;
        }
        return true;
      }catch(_e){ return false; }
    }
    function stabilizeCoverAfterMyFaithExternal(reason){
      if(!hasRecentMyFaithExternalLink()) return;
      try{
        if(window.oaiReturnConductorBusy && window.oaiReturnConductorBusy(['myfaith-return','external-return'])) return;
        if(window.oaiReturnConductorRequest && !window.oaiReturnConductorRequest('myfaith-return', {ms:1300})) return;
        openModal({keepContent:false, fromExternal:true});
        markMyFaithExternalSettling(900);
        setTimeout(function(){ try{ if(window.oaiReturnConductorFinish) window.oaiReturnConductorFinish('myfaith-return'); }catch(_e){} }, 950);
      }catch(e){ console.warn('[가톨릭길동무]', e); }
    }
    function goExternal(url){
      url = normalizeMyFaithExternalUrl(url);
      if(!url) return;
      try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
      try{
        markMyFaithExternalLink();
        markMyFaithExternalSettling(1800);
        modal.classList.add('show','open','return-settling');
        modal.setAttribute('aria-hidden','false');
        document.documentElement.classList.add('app-active');
      }catch(_e){}
      try{
        if(typeof window.oaiSmoothNavigate === 'function'){
          window.oaiSmoothNavigate(url, 'myfaith-external');
          return;
        }
      }catch(_e){}
      setTimeout(function(){ try{ location.assign(url); }catch(e){ try{ location.href = url; }catch(_e){} } }, 220);
    }
    function bindMyFaithClick(el, fn){
      if(!el || typeof fn !== 'function') return;
      el.addEventListener('click', function(e){
        if(e && e.preventDefault) e.preventDefault();
        if(e && e.stopPropagation) e.stopPropagation();
        try{ document.activeElement && document.activeElement.blur && document.activeElement.blur(); }catch(_e){}
        fn();
        return false;
      }, false);
    }
    function bindMyFaithImmediateClick(el, fn){
      if(!el || typeof fn !== 'function') return;
      var lastRunAt=0;
      function run(e){
        try{
          if(e){
            if(e.preventDefault) e.preventDefault();
            if(e.stopPropagation) e.stopPropagation();
            if(e.stopImmediatePropagation) e.stopImmediatePropagation();
          }
          if(el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
          var now=Date.now ? Date.now() : new Date().getTime();
          if(now-lastRunAt<520) return false;
          lastRunAt=now;
          fn(e);
        }catch(err){ console.warn('[가톨릭길동무]', err); }
        return false;
      }
      try{ el.addEventListener('pointerdown', run, true); }catch(_e){}
      try{ el.addEventListener('touchstart', run, {capture:true, passive:false}); }catch(_e){}
      try{ el.addEventListener('click', run, true); }catch(_e){}
    }
    function smallButton(label, fn){
      var b=document.createElement('button');
      b.type='button';
      b.className='my-faith-small-btn';
      b.textContent=label;
      bindMyFaithClick(b, function(){ fn&&fn(); });
      return b;
    }
    function appendMyFaithPrivacyNote(){ var note=document.createElement('div'); note.className='my-faith-inline-privacy-note'; note.textContent='선택한 교구와 본당 정보는 이 기기 안에만 저장되며, 외부로 수집되거나 전송되지 않습니다.'; body.appendChild(note); }
    function appendMyFaithConfirmButton(onConfirm){
      var wrap=document.createElement('div');
      wrap.className='my-faith-inline-confirm';
      var ok=document.createElement('button');
      ok.type='button';
      ok.className='my-faith-confirm-btn';
      ok.textContent='확인';
      bindMyFaithClick(ok, function(){
        var result = true;
        if(typeof onConfirm === 'function') result = onConfirm();
        if(result === false) return;
        if(result === 'stay') return;
        closeModal();
      });
      wrap.appendChild(ok);
      body.appendChild(wrap);
    }
    function settleMyFaithHomeScroll(){ try{ if(!body || !body.classList.contains('my-faith-home-list-body')) return; body.scrollTop=0; body.classList.remove('my-faith-no-scroll'); setTimeout(function(){ try{ body.classList.remove('my-faith-no-scroll'); }catch(_e){} },120); }catch(e){ console.warn('[가톨릭길동무]', e); } }

    function appendInlineDiocesePicker(sec){
      var current=getMyFaithEditName();
      var grid=document.createElement('div');
      grid.className='my-faith-inline-diocese-grid';
      dioceses.forEach(function(name){
        var item=document.createElement('button');
        item.type='button';
        item.className='my-faith-inline-diocese-option'+(current===name?' selected':'');
        item.textContent=name;
        item.setAttribute('aria-pressed', current===name?'true':'false');
        bindMyFaithClick(item, function(){
          setMyFaithEditName(name);
          myFaithExpandedSection = 'parish';
          returnToMyFaithSettingsEdit();
        });
        grid.appendChild(item);
      });
      sec.appendChild(grid);
    }
    function appendParishDisabledHint(sec){
      var wrap=document.createElement('div');
      wrap.className='my-faith-inline-parish-disabled';
      wrap.innerHTML='<div class="my-faith-inline-note">본당 선택은 교구를 먼저 선택한 뒤 가능합니다.</div><div class="my-faith-inline-disabled-input">본당명 또는 주소 검색</div><div class="my-faith-inline-empty">교구를 먼저 선택해 주세요.</div>';
      sec.appendChild(wrap);
    }
    function appendInlineParishSearch(sec){
      var wrap=document.createElement('div');
      wrap.className='my-faith-inline-parish-search';
      var input=document.createElement('input');
      input.type='search';
      input.className='my-faith-search-input my-faith-inline-search-input';
      input.placeholder='본당명 또는 주소 검색';
      var results=document.createElement('div');
      results.className='my-faith-search-results my-faith-inline-search-results';
      var tools=document.createElement('div');
      tools.className='my-faith-tools my-faith-inline-parish-tools';
      tools.appendChild(smallButton('선택 안함', function(){ setMyFaithEditParish(noParishItem(getMyFaithEditName())); myFaithExpandedSection = ''; returnToMyFaithSettingsEdit(); }));
      wrap.appendChild(input);
      wrap.appendChild(results);
      wrap.appendChild(tools);
      sec.appendChild(wrap);
      function draw(){
        var q=String(input.value||'').trim().toLowerCase();
        var items=getParishItems();
        var myDio=getMyFaithEditName();
        if(myDio) items=items.filter(function(p){ return p && p.diocese===myDio; });
        if(q) items=items.filter(function(p){ return String((p.name||'')+' '+(p.addr||'')+' '+(p.diocese||'')).toLowerCase().indexOf(q)>=0; });
        items=sortParishItems(items);
        results.innerHTML='';
        if(!items.length){ results.innerHTML='<div class="my-faith-empty">검색 결과가 없습니다.</div>'; return; }
        items.forEach(function(p){
          var card=document.createElement('button');
          card.type='button';
          card.className='my-faith-parish-result';
          card.innerHTML='<strong>'+safeText(p.name)+'</strong><span>'+safeText(p.diocese||'')+(p.addr?' · '+safeText(p.addr):'')+'</span>';
          bindMyFaithClick(card, function(){ setMyFaithEditParish(p); myFaithExpandedSection = ''; returnToMyFaithSettingsEdit(); });
          results.appendChild(card);
        });
      }
      input.addEventListener('input', draw);
      input.addEventListener('focus', function(){ try{ modal.classList.add('keyboard-open'); updateMyFaithViewport(); }catch(_e){} });
      input.addEventListener('blur', function(){ setTimeout(function(){ try{ updateMyFaithViewport(); }catch(_e){} },180); });
      var selectedDioCode=getSelectedDioceseCode();
      if(selectedDioCode && typeof _ensureParishDioceseDataLoaded === 'function'){
        results.innerHTML='<div class="my-faith-empty">'+safeText(getMyFaithEditName())+' 본당 정보를 불러오는 중입니다...</div>';
        _ensureParishDioceseDataLoaded(selectedDioCode).then(function(){ draw(); }).catch(function(){ draw(); });
      }else if(!_parishRawLoaded && typeof _ensureParishDataLoaded === 'function'){
        results.innerHTML='<div class="my-faith-empty">성당 정보를 불러오는 중입니다...</div>';
        _ensureParishDataLoaded().then(function(){ draw(); }).catch(function(){ draw(); });
      }else{ draw(); }
      setTimeout(function(){ try{ updateMyFaithViewport(); }catch(_e){} },80);
    }

    function renderHome(){
      var name = selectedName(); var info = name ? DIO_INFO[name] : null; var parish = selectedParish();
      setHeader('나의 신앙생활', '설정 상태와 바로가기를 한곳에서 확인');
      setBodyMode('my-faith-body my-faith-home-list-body');
      function rowButton(label, fn, disabled, cls){ var b=document.createElement('button'); b.type='button'; b.className='my-faith-row-btn'+(cls?(' '+cls):''); b.textContent=label; if(disabled){ b.disabled=true; } else { bindMyFaithClick(b, function(){ fn&&fn(); }); } return b; }
      function rowExternalLink(label, url, disabled, cls){
        url = normalizeMyFaithExternalUrl(url);
        if(disabled || !url) return rowButton(label, null, true, cls);
        var a=document.createElement('a');
        a.className='my-faith-row-btn'+(cls?(' '+cls):'');
        a.textContent=label || '열기';
        a.href=url;
        a.rel='external';
        a.setAttribute('aria-label','외부 사이트 열기');
        a.setAttribute('data-myfaith-external-link','1');
        a.onclick=function(e){
          if(e && e.preventDefault) e.preventDefault();
          if(e && e.stopPropagation) e.stopPropagation();
          goExternal(url);
          return false;
        };
        return a;
      }
      function listSection(t,c){ var sec=document.createElement('section'); sec.className='my-faith-section my-faith-list-section '+(c||''); var h=document.createElement('h3'); h.textContent=t; sec.appendChild(h); return sec; }
      function appendRow(sec,label,value,status,buttonLabel,fn,disabled,cls){ var row=document.createElement('div'); row.className='my-faith-list-row'+(disabled?' is-disabled':'')+(status?(' has-status-'+status):''); var main=document.createElement('div'); main.className='my-faith-row-main'; var top=document.createElement('div'); top.className='my-faith-row-top'; var strong=document.createElement('strong'); strong.textContent=label; top.appendChild(strong); if(status){ var badge=document.createElement('span'); badge.className='my-faith-row-status '+status; badge.textContent=status==='done'?'설정됨':'설정 필요'; top.appendChild(badge); } main.appendChild(top); if(value){ var sub=document.createElement('span'); sub.className='my-faith-row-sub'; sub.textContent=value; main.appendChild(sub); } row.appendChild(main); row.appendChild(rowButton(buttonLabel, fn, disabled, cls)); sec.appendChild(row); return row; }
      function appendExternalRow(sec,label,value,status,buttonLabel,url,disabled,cls){ var row=document.createElement('div'); row.className='my-faith-list-row'+(disabled?' is-disabled':'')+(status?(' has-status-'+status):''); var main=document.createElement('div'); main.className='my-faith-row-main'; var top=document.createElement('div'); top.className='my-faith-row-top'; var strong=document.createElement('strong'); strong.textContent=label; top.appendChild(strong); if(status){ var badge=document.createElement('span'); badge.className='my-faith-row-status '+status; badge.textContent=status==='done'?'설정됨':'설정 필요'; top.appendChild(badge); } main.appendChild(top); if(value){ var sub=document.createElement('span'); sub.className='my-faith-row-sub'; sub.textContent=value; main.appendChild(sub); } row.appendChild(main); row.appendChild(rowExternalLink(buttonLabel, url, disabled, cls)); sec.appendChild(row); return row; }
      function renderSettingsEdit(){
        if(!myFaithPendingActive) beginMyFaithPendingEdit();
        setHeader('나의 설정', '교구와 본당을 선택해 주세요');
        setBodyMode('my-faith-body my-faith-home-list-body my-faith-edit-accordion-body');
        var settings=listSection('나의 설정','my-faith-settings-section my-faith-setup-editor');
        var curName = getMyFaithEditName();
        var curParish = getMyFaithEditParish();

        function appendEditStatusRow(label, value, status, buttonLabel, fn){
          var row=document.createElement('div');
          row.className='my-faith-list-row my-faith-edit-status-row'+(status?(' has-status-'+status):'')+(!buttonLabel?' is-static':'');
          var main=document.createElement('div');
          main.className='my-faith-row-main';
          var top=document.createElement('div');
          top.className='my-faith-row-top';
          var strong=document.createElement('strong');
          strong.textContent=label;
          top.appendChild(strong);
          if(status){
            var badge=document.createElement('span');
            badge.className='my-faith-row-status '+status;
            badge.textContent=status==='done'?'선택됨':'선택 필요';
            top.appendChild(badge);
          }
          main.appendChild(top);
          if(value){
            var sub=document.createElement('span');
            sub.className='my-faith-row-sub';
            sub.textContent=value;
            main.appendChild(sub);
          }
          row.appendChild(main);
          if(buttonLabel){ row.appendChild(rowButton(buttonLabel, fn, false, 'my-faith-row-btn-set')); }
          settings.appendChild(row);
          return row;
        }

        var showDiocesePicker = !curName || myFaithExpandedSection === 'diocese';
        appendEditStatusRow('내 교구', curName || '교구를 먼저 선택해 주세요.', curName ? 'done' : 'needed', curName && !showDiocesePicker ? '다시 선택' : '', function(){ myFaithExpandedSection = 'diocese'; renderSettingsEdit(); });
        if(showDiocesePicker) appendInlineDiocesePicker(settings);

        if(!curName){
          appendEditStatusRow('내 본당', '교구 선택 후 본당을 선택할 수 있습니다.', 'needed', '', null);
          appendParishDisabledHint(settings);
        }else{
          var showParishPicker = !curParish || myFaithExpandedSection === 'parish';
          appendEditStatusRow('내 본당', curParish ? curParish.name : '선택하지 않아도 저장할 수 있습니다.', 'done', curParish && !showParishPicker ? '다시 선택' : '', function(){ myFaithExpandedSection = 'parish'; renderSettingsEdit(); });
          if(showParishPicker) appendInlineParishSearch(settings);
        }

        body.appendChild(settings);
        var tools=document.createElement('div');
        tools.className='my-faith-tools my-faith-change-tools';
        var backBtn=smallButton('취소', cancelMyFaithSettingsAndReturn);
        backBtn.classList.add('my-faith-back-small-btn');
        tools.appendChild(backBtn);
        body.appendChild(tools);
        appendMyFaithConfirmButton(function(){
          if(commitMyFaithPendingEdit() === false) return false;
          renderHome();
          return 'stay';
        });
        body.appendChild(appendDataBackupSection(renderSettingsEdit));
        appendMyFaithPrivacyNote();
        settleMyFaithHomeScroll();
      }
      myFaithRenderSettingsEdit = renderSettingsEdit;
      window.openMyFaithSettingsEdit = function(){ openModal({restore:true, keepContent:true}); beginMyFaithPendingEdit(); renderSettingsEdit(); };
      if(name){
        var quick=listSection('내 교구·본당 정보','my-faith-quick-section');
        appendExternalRow(quick, name+' 홈페이지','', '', '열기', info&&info.home, !(info&&info.home), 'my-faith-row-btn-open');
        appendExternalRow(quick, name+' 사제 찾기','', '', '열기', info&&info.priest, !(info&&info.priest), 'my-faith-row-btn-open');
        if(!parish || isNoParishItem(parish)){
          appendRow(quick, '내 본당', NO_PARISH_NAME, '', '변경', function(){ beginMyFaithPendingEdit(); myFaithExpandedSection = 'parish'; renderSettingsEdit(); }, false, 'my-faith-row-btn-set');
        }
        if(parish && !isNoParishItem(parish) && parish.hp){
          var parishHomeRow = appendExternalRow(quick, parish.name+' 홈페이지','', '', '열기', parish.hp, false, 'my-faith-row-btn-open');
          if(parishHomeRow) parishHomeRow.classList.add('my-faith-parish-info-row');
        }
        if(parish && !isNoParishItem(parish) && parish.url){
          var parishDetailRow = appendExternalRow(quick, parish.name+' 상세정보','', '', '열기', parish.url, false, 'my-faith-row-btn-open');
          if(parishDetailRow) parishDetailRow.classList.add('my-faith-parish-info-row');
        }
        body.appendChild(quick);
        var changeWrap=document.createElement('div');
        changeWrap.className='my-faith-change-settings-wrap';
        var changeBtn=document.createElement('button');
        changeBtn.type='button';
        changeBtn.className='my-faith-change-settings-btn';
        changeBtn.textContent='교구·본당 변경';
        bindMyFaithClick(changeBtn, function(){ beginMyFaithBlankEdit(); renderSettingsEdit(); });
        changeWrap.appendChild(changeBtn);
        body.appendChild(changeWrap);
      }else{
        beginMyFaithBlankEdit();
        renderSettingsEdit();
        return;
      }
      appendMyFaithConfirmButton(); body.appendChild(appendDataBackupSection(renderHome)); appendMyFaithPrivacyNote(); settleMyFaithHomeScroll();
    }
    function renderDioceseList(){
      var current=getMyFaithEditName(); setHeader('나의 교구 선택','확인을 눌러야 저장됩니다'); setBodyMode('my-diocese-list');
      dioceses.forEach(function(name){ var item=document.createElement('button'); item.type='button'; item.className='my-diocese-option'+(current===name?' selected':''); item.textContent=name; item.setAttribute('aria-pressed', current===name?'true':'false'); bindMyFaithClick(item, function(){ setMyFaithEditName(name); myFaithExpandedSection = 'parish'; returnToMyFaithSettingsEdit(); }); body.appendChild(item); });
      var noneItem=document.createElement('button'); noneItem.type='button'; noneItem.className='my-diocese-option my-diocese-none'+(!current?' selected':''); noneItem.textContent='선택 안함'; noneItem.setAttribute('aria-pressed', !current?'true':'false'); bindMyFaithClick(noneItem, function(){ setMyFaithEditName(''); setMyFaithEditParish(null); myFaithExpandedSection = 'diocese'; returnToMyFaithSettingsEdit(); }); body.appendChild(noneItem);
    }
    function getSelectedDioceseCode(){ var myDio=myFaithPendingActive ? getMyFaithEditName() : selectedName(); if(!myDio) return null; try{ if(typeof _PARISH_DIO_CODE_MAP !== 'undefined' && _PARISH_DIO_CODE_MAP && _PARISH_DIO_CODE_MAP[myDio]) return _PARISH_DIO_CODE_MAP[myDio]; }catch(_e){} try{ for(var code in _DIO){ if(Object.prototype.hasOwnProperty.call(_DIO,code) && _DIO[code]===myDio) return code; } }catch(_e){} return null; }
    function getParishItems(){ try{ if(Array.isArray(PARISHES) && PARISHES.length) return PARISHES; }catch(_e){} return []; }
    function sortParishItems(items){ return items.slice().sort(function(a,b){ return String(a&&a.name||'').localeCompare(String(b&&b.name||''),'ko'); }); }
    function renderParishSearch(query){
      if(!myFaithPendingActive) beginMyFaithPendingEdit();
      query=String(query||''); setHeader('나의 본당 찾기','확인을 눌러야 저장됩니다'); setBodyMode('my-faith-body my-faith-search-body');
      var wrap=document.createElement('section'); wrap.className='my-faith-section my-faith-search-section'; wrap.innerHTML='<h3>성당 검색</h3>';
      var input=document.createElement('input'); input.type='search'; input.className='my-faith-search-input'; input.placeholder='성당명 또는 주소 검색'; input.value=query;
      var results=document.createElement('div'); results.className='my-faith-search-results'; wrap.appendChild(input); wrap.appendChild(results);
      var tools=document.createElement('div'); tools.className='my-faith-tools'; tools.appendChild(smallButton('취소', returnToMyFaithSettingsEdit)); if(getMyFaithEditName()) tools.appendChild(smallButton('선택 안함', function(){ setMyFaithEditParish(noParishItem(getMyFaithEditName())); returnToMyFaithSettingsEdit(); })); wrap.appendChild(tools); body.appendChild(wrap);
      function draw(){
        var q=String(input.value||'').trim().toLowerCase(); var items=getParishItems(); var myDio=getMyFaithEditName();
        if(myDio) items=items.filter(function(p){ return p && p.diocese===myDio; });
        if(q) items=items.filter(function(p){ return String((p.name||'')+' '+(p.addr||'')+' '+(p.diocese||'')).toLowerCase().indexOf(q)>=0; });
        items=sortParishItems(items); results.innerHTML='';
        if(!items.length){ results.innerHTML='<div class="my-faith-empty">검색 결과가 없습니다.</div>'; return; }
        items.forEach(function(p){ var card=document.createElement('button'); card.type='button'; card.className='my-faith-parish-result'; card.innerHTML='<strong>'+safeText(p.name)+'</strong><span>'+safeText(p.diocese||'')+(p.addr?' · '+safeText(p.addr):'')+'</span>'; bindMyFaithClick(card, function(){ setMyFaithEditParish(p); returnToMyFaithSettingsEdit(); }); results.appendChild(card); });
      }
      input.addEventListener('input', draw); input.addEventListener('focus', function(){ try{ modal.classList.add('keyboard-open'); updateMyFaithViewport(); }catch(_e){} }); input.addEventListener('blur', function(){ setTimeout(function(){ try{ updateMyFaithViewport(); }catch(_e){} },180); });
      var selectedDioCode=getSelectedDioceseCode();
      if(selectedDioCode && typeof _ensureParishDioceseDataLoaded === 'function'){
        results.innerHTML='<div class="my-faith-empty">'+safeText(selectedName())+' 본당 정보를 불러오는 중입니다...</div>';
        _ensureParishDioceseDataLoaded(selectedDioCode).then(function(){ draw(); }).catch(function(){ draw(); });
      }else if(!_parishRawLoaded && typeof _ensureParishDataLoaded === 'function'){
        results.innerHTML='<div class="my-faith-empty">성당 정보를 불러오는 중입니다...</div>';
        _ensureParishDataLoaded().then(function(){ draw(); }).catch(function(){ draw(); });
      }else{ draw(); }
      setTimeout(updateMyFaithViewport,80);
    }
    if(window.visualViewport){ window.visualViewport.addEventListener('resize', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, {passive:true}); }
    window.addEventListener('resize', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, {passive:true});
    window.addEventListener('pageshow', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, true);
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible' && modal.classList.contains('show')) updateMyFaithViewport(); }, true);
    window.addEventListener('focus', function(){ if(modal.classList.contains('show')) updateMyFaithViewport(); }, true);

    window.addEventListener('pageshow', function(){ stabilizeCoverAfterMyFaithExternal('myfaith-external-pageshow'); }, true);
    document.addEventListener('visibilitychange', function(){ if(document.visibilityState === 'visible') stabilizeCoverAfterMyFaithExternal('myfaith-external-visible'); }, true);

    bindSetupBannerVisibilityWatch();
    updateButton();
    ['beforeinstallprompt','appinstalled','pageshow','load','resize'].forEach(function(ev){
      try{ window.addEventListener(ev, scheduleSetupBannerUpdate, {passive:true}); }catch(_e){ window.addEventListener(ev, scheduleSetupBannerUpdate); }
    });
    setTimeout(scheduleSetupBannerUpdate, 120);
    setTimeout(scheduleSetupBannerUpdate, 600);
    function openFromButton(e){
      if(e && e.preventDefault) e.preventDefault();
      if(e && e.stopPropagation) e.stopPropagation();
      try{ if(typeof window.closeCoverMenuPopup === 'function') window.closeCoverMenuPopup(); }catch(_e){}
      openModal();
    }
    on(btn, 'click', openFromButton);
    if(setupBanner) on(setupBanner, 'click', openFromButton);
    if(menuBtn) on(menuBtn, 'click', openFromButton);
    on('my-diocese-close','click', function(e){ if(e&&e.preventDefault)e.preventDefault(); closeModal(); });
    modal.addEventListener('click', function(e){ if(e && e.target && e.target.getAttribute && e.target.getAttribute('data-my-diocese-close') === 'true') closeModal(); });
    document.addEventListener('keydown', function(e){ if(e && e.key === 'Escape' && modal.classList.contains('show')){ if(myFaithInfoManagementOpen) closeMyInfoManagementModal(); else closeModal(); } });
  };
})();
