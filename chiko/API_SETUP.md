# 치코 API 설정 가이드

## 🔑 API 키 설정 방법

### 1. Google AI Studio 접속
- https://aistudio.google.com/app/apikey 접속
- Google 계정으로 로그인

### 2. API 키 생성
1. 왼쪽 사이드바에서 **"API keys"** 클릭
2. 상단 우측의 **"API 키 만들기"** 버튼 클릭
3. 프로젝트 선택 (기본값으로 생성 가능)
4. 생성된 API 키를 복사

### 3. API 키 적용
1. `chiko/script.js` 파일을 엽니다
2. 파일 상단에 있는 다음 줄을 찾습니다:
   ```javascript
   const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
   ```
3. `YOUR_API_KEY_HERE`를 복사한 실제 API 키로 교체합니다:
   ```javascript
   const GEMINI_API_KEY = 'AIzaSy...실제_키...';
   ```
4. 파일을 저장합니다

## ⚠️ 주의사항

### 프로젝트 ID ≠ API 키
- `gen-lang-client-0979674775`는 **프로젝트 ID**입니다
- 실제 **API 키**는 `AIzaSy...`로 시작하는 긴 문자열입니다
- API 키는 보안상 중요하므로 공개 저장소에 올리지 마세요

### API 키 형식
- 올바른 API 키: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
- 길이: 보통 39자 정도
- 형식: `AIzaSy`로 시작

## 🛠️ 문제 해결

### "API 키가 유효하지 않습니다" 오류
1. API 키가 올바르게 복사되었는지 확인 (공백 제거)
2. Google AI Studio에서 API 키가 활성화되어 있는지 확인
3. 올바른 프로젝트의 API 키를 사용하고 있는지 확인

### "API 접근 권한이 없습니다" 오류
1. Google AI Studio에서 해당 프로젝트의 권한 확인
2. Gemini API가 활성화되어 있는지 확인

### "사용량 제한에 도달했습니다" 오류
1. 무료 등급의 경우 일일 사용량 제한이 있을 수 있습니다
2. 잠시 후 다시 시도하거나 결제 설정을 확인하세요

## 📝 체크리스트

- [ ] Google AI Studio에 로그인
- [ ] API 키 생성 완료
- [ ] `script.js` 파일에 API 키 입력
- [ ] 파일 저장 완료
- [ ] 브라우저 새로고침
- [ ] 채팅 테스트

## 🔒 보안 권장사항

API 키는 민감한 정보이므로:
- ✅ 로컬에서만 사용
- ✅ `.gitignore`에 추가 (이미 포함되어 있어야 함)
- ❌ 공개 저장소에 업로드 금지
- ❌ 화면 공유 시 키 노출 주의

