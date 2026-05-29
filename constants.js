/* 가톨릭길동무 공통 상수
   sessionStorage / localStorage 키 이름을 한 곳에서 관리합니다.
   키 이름 오타로 인한 버그를 방지하고, 전체 키 목록을 한눈에 파악합니다.

   사용 예시:
     sessionStorage.setItem(SS.COVER_EXIT_ARMED_UNTIL, String(until));
     sessionStorage.getItem(SS.PRAYER_QUICK_RETURN);
*/

'use strict';

/* ── sessionStorage 키 ─────────────────────────────────── */
window.SS = {
  // 커버 뒤로가기 / 종료
  COVER_EXIT_ARMED_UNTIL:       'oai_cover_exit_armed_until',
  HIDDEN_AT:                    'oai_hidden_at',

  // 새로고침 베일
  REFRESH_VEIL_UNTIL:           'oai_refresh_veil_until',
  REFRESH_VEIL_HOLD_MS:         'oai_refresh_veil_hold_ms',
  REFRESH_VEIL_REASON:          'oai_refresh_veil_reason',
  REFRESH_VEIL_VISIBLE_UNTIL:   'oai_refresh_veil_visible_until',

  // 히스토리 압축 (새로고침 복귀)
  REFRESH_HISTORY_COMPACT_UNTIL:  'oai_refresh_history_compact_until',
  REFRESH_HISTORY_COMPACT_REASON: 'oai_refresh_history_compact_reason',

  // 외부 사이트 복귀
  EXTERNAL_NAV_PENDING:         'oai_external_nav_pending',
  EXTERNAL_NAV_STARTED_AT:      'oai_external_nav_started_at',
  EXTERNAL_NAV_PAGEHIDE:        'oai_external_nav_pagehide',
  EXTERNAL_NAV_KIND:            'oai_external_nav_kind',
  EXTERNAL_NAV_HOLD_UNTIL:      'oai_external_nav_hold_until',
  EXTERNAL_NAV_FORCE_RELEASE_AT:'oai_external_nav_force_release_at',
  EXTERNAL_RETURN_STABILIZE:    'oai_external_return_stabilize',

  // 기도문 복귀
  PRAYER_QUICK_RETURN:          'oai_prayer_quick_return',
  PRAYER_QUICK_RETURN_TS:       'oai_prayer_quick_return_ts',
  PRAYER_FROM_QUICK_LOCK:       'oai_prayer_from_quick_lock',
  PRAYER_COVER_NEEDS_FIRST_TOAST:'oai_prayer_cover_needs_first_toast',

  // 빠른 미사 메뉴
  MASS_QUICK_RETURN:            'oai_mass_quick_return',
  MASS_QUICK_RETURN_TS:         'oai_mass_quick_return_ts',
  MASS_QUICK_POPUP_FROM_PRAYER: 'oai_mass_quick_popup_from_prayer',

  // 기타 복귀 키 (구버전 호환)
  CATHOLIC_CORE_RETURN:         'catholic_core_return_v1',
  CATHOLIC_INTEGRATED_RETURN:   'catholic_integrated_return_v2',

  // 안정 자동 새로고침
  STABLE_AUTO_RELOAD_REASON:    'oai_stable_auto_reload_reason',
  SOFT_REFRESH_REQUESTED:       'oai_soft_refresh_requested',
  BACKGROUND_COVER_RESET:       'oai_background_cover_reset_requested',
};

/* ── localStorage 키 ──────────────────────────────────── */
window.LS = {
  COVER_VH_PX:      'oai_cover_vh_px_v48',
  COVER_WIDTH_PX:   'oai_cover_width_px_v48',
  PRAYER_FONT_SIZE: 'prayer_font_size',
};
