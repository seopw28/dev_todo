# Firebase 연동 문제 해결 가이드

## "To Do 추가 중 오류가 발생했습니다" 문제 해결

### 1. Firestore 규칙 확인 및 배포 (가장 중요!)

**문제**: Firestore 보안 규칙이 Firebase Console에 배포되지 않았을 수 있습니다.

**해결 방법**:
1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택: `vex-todo`
3. 좌측 메뉴에서 **Firestore Database** 클릭
4. **규칙** 탭 클릭
5. `firestore.rules` 파일의 내용을 복사해서 붙여넣기:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /todos/{todoId} {
         allow read, write: if true;
       }
     }
   }
   ```
6. **게시** 버튼 클릭
7. 배포 완료까지 1-2분 대기

### 2. Firestore 데이터베이스 생성 확인

**문제**: Firestore 데이터베이스가 생성되지 않았을 수 있습니다.

**해결 방법**:
1. Firebase Console > Firestore Database
2. "데이터베이스 만들기" 클릭 (아직 없다면)
3. **프로덕션 모드** 또는 **테스트 모드** 선택
   - 테스트 모드: 30일간 모든 읽기/쓰기 허용
   - 프로덕션 모드: 보안 규칙 필요 (위 1번 참조)
4. 위치 선택: **asia-northeast3** (서울) 권장

### 3. 브라우저 콘솔에서 오류 확인

**문제**: 정확한 오류 원인을 파악하기 어려움

**해결 방법**:
1. 브라우저에서 F12 또는 개발자 도구 열기
2. **Console** 탭 확인
3. "추가 오류 상세" 메시지 확인
4. 오류 코드와 메시지를 확인:
   - `permission-denied`: 권한 오류 (규칙 문제)
   - `unavailable`: 네트워크 오류
   - `failed-precondition`: 인덱스 필요

### 4. Firebase API 키 확인

**문제**: API 키 제한이 설정되어 있을 수 있습니다.

**해결 방법**:
1. Google Cloud Console 접속: https://console.cloud.google.com/
2. 프로젝트 선택: `vex-todo`
3. **API 및 서비스** > **사용자 인증 정보**
4. API 키 확인 및 제한 설정 확인
5. Firestore API가 활성화되어 있는지 확인

### 5. CORS 및 승인된 도메인 확인

**문제**: 현재 도메인이 승인되지 않았을 수 있습니다.

**해결 방법**:
1. Firebase Console > Authentication > 설정
2. **승인된 도메인** 섹션 확인
3. 사용 중인 도메인 추가 (예: `seopw28.github.io`)

### 6. 네트워크 연결 확인

**문제**: 인터넷 연결 문제

**해결 방법**:
1. 네트워크 연결 상태 확인
2. 방화벽이나 VPN이 Firebase 도메인을 차단하지 않는지 확인
3. `https://firestore.googleapis.com` 접속 가능 여부 확인

### 7. 임시 해결책: 에러 로깅 강화

코드에 이미 자세한 에러 로깅을 추가했습니다. 브라우저 콘솔에서 정확한 오류 메시지를 확인할 수 있습니다.

## 일반적인 오류 코드

| 오류 코드 | 의미 | 해결 방법 |
|---------|------|---------|
| `permission-denied` | 권한 거부 | Firestore 규칙 확인 및 배포 |
| `unavailable` | 서비스 사용 불가 | 네트워크 확인 또는 Firebase 상태 확인 |
| `failed-precondition` | 전제 조건 실패 | 인덱스 생성 또는 규칙 수정 |
| `not-found` | 컬렉션 없음 | Firestore 데이터베이스 생성 확인 |
| `already-exists` | 이미 존재 | 일반적으로 문제 없음 |

## 빠른 확인 체크리스트

- [ ] Firestore 데이터베이스가 생성되었는가?
- [ ] Firestore 규칙이 배포되었는가? (`allow read, write: if true` 포함)
- [ ] Firebase 프로젝트가 활성화되어 있는가?
- [ ] 브라우저 콘솔에서 정확한 오류 메시지를 확인했는가?
- [ ] 네트워크 연결이 정상인가?

## 다음 단계

위 방법으로 해결되지 않으면:
1. 브라우저 콘솔의 정확한 오류 메시지를 캡처
2. Firebase Console > Firestore > 규칙 탭 스크린샷
3. 오류 발생 시점의 네트워크 탭 확인

