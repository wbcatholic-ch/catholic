# 가톨릭길동무 문의·건의 관리자 푸시 알림

이 폴더는 Firebase Cloud Functions용 예시 코드입니다. GitHub Pages에 올리는 웹앱 파일만으로는 푸시 알림이 자동 작동하지 않습니다.

## 흐름
사용자 문의·건의 작성 → Firestore `qa_posts` 문서 생성 → Cloud Functions 실행 → 관리자 FCM 토큰으로 푸시 발송

## 필요한 설정
1. Firebase Console에서 Cloud Messaging 웹 푸시 인증서 키를 생성합니다.
2. `admin-notify.html`의 `VAPID_PUBLIC_KEY`에 위 키를 넣고 관리자 기기에서 토큰을 만듭니다.
3. Cloud Functions 환경변수 `ADMIN_FCM_TOKENS`에 관리자 토큰을 쉼표로 구분해 넣습니다.
4. 이 폴더를 Firebase Functions 프로젝트에 배포합니다.

관리자 토큰은 공개 저장소, GitHub, 채팅에 올리지 마세요.
