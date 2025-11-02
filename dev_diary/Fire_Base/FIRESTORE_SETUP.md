# Firestore 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력
4. Google Analytics 설정 (선택사항)

## 2. Firestore 데이터베이스 생성

1. Firebase Console에서 "Firestore Database" 메뉴 클릭
2. "데이터베이스 만들기" 클릭
3. **프로덕션 모드** 또는 **테스트 모드** 선택
   - 테스트 모드: 30일 동안 모든 읽기/쓰기 허용 (개발용)
   - 프로덕션 모드: 보안 규칙 필요
4. 위치 선택 (asia-northeast3 - 서울 권장)

## 3. 웹 앱 등록

1. Firebase Console에서 프로젝트 설정 > 일반 탭
2. "앱 추가" > "웹" 선택
3. 앱 이름 입력
4. 생성된 Firebase 설정 복사

## 4. firebase-config.js 설정

`firebase-config.js` 파일을 열고 Firebase Console에서 복사한 설정값을 입력:

```javascript
const firebaseConfig = {
    apiKey: "여기에_API_KEY_입력",
    authDomain: "여기에_PROJECT_ID.firebaseapp.com",
    projectId: "여기에_PROJECT_ID_입력",
    storageBucket: "여기에_PROJECT_ID.appspot.com",
    messagingSenderId: "여기에_MESSAGING_SENDER_ID_입력",
    appId: "여기에_APP_ID_입력"
};
```

## 5. Firestore 보안 규칙 설정

### 방법 1: Firebase Console에서 설정

1. Firestore Database > 규칙 탭 이동
2. `firestore.rules` 파일의 내용을 복사해서 붙여넣기
3. "게시" 클릭

### 방법 2: Firebase CLI 사용

```bash
firebase deploy --only firestore:rules
```

## 6. 보안 규칙 설명

### 기본 규칙 (인증 필요)

```javascript
match /todos/{todoId} {
  allow read: if request.auth != null;  // 인증된 사용자만 읽기
  allow write: if request.auth != null; // 인증된 사용자만 쓰기
}
```

### 개발용 규칙 (인증 없이 허용)

```javascript
match /todos/{todoId} {
  allow read, write: if true; // 모든 사용자 허용 (위험! 개발용만)
}
```

### 상세 규칙 (데이터 검증 포함)

- `text` 필드는 문자열이고 1~500자 사이
- `completed` 필드는 불린 타입
- `createdAt` 필드는 타임스탬프 문자열

## 7. HTML 파일 수정

### index.html

1. Firebase SDK 주석 해제:
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="firebase-config.js"></script>
```

2. 스크립트 변경:
```html
<!-- localStorage 버전 -->
<script src="script.js"></script>

<!-- Firestore 버전 -->
<script src="script-firestore.js"></script>
```

## 8. 인증 설정 (선택사항)

### 익명 인증

Firebase Console > Authentication > Sign-in method > 익명 > 사용 설정

### 이메일/비밀번호 인증

Firebase Console > Authentication > Sign-in method > 이메일/비밀번호 > 사용 설정

## 9. 데이터 구조

### todos 컬렉션

```
todos/
  {todoId}/
    text: string
    completed: boolean
    createdAt: timestamp
    description: string (선택사항)
    updatedAt: timestamp (선택사항)
```

## 10. 주요 차이점

### localStorage 버전
- 클라이언트에만 저장
- 다른 기기에서 접근 불가
- 브라우저 데이터 삭제 시 손실

### Firestore 버전
- 클라우드에 저장
- 여러 기기에서 동기화
- 실시간 업데이트
- 인증 및 보안 규칙 지원

## 11. 문제 해결

### CORS 오류
- Firebase Console > Authentication > 승인된 도메인에 도메인 추가

### 권한 거부 오류
- Firestore 규칙 확인
- 인증 상태 확인

### 데이터가 표시되지 않음
- 브라우저 콘솔에서 오류 확인
- Firestore Console에서 데이터 확인
- 네트워크 탭에서 요청 확인

## 12. 배포

Firebase Hosting 사용 시:

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

