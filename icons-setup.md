# 아이콘 라이브러리 설정 가이드

## 추천: Font Awesome (CDN)

순수 HTML/JavaScript 프로젝트에서 가장 쉽게 사용할 수 있는 방법입니다.

### 설치
HTML `<head>`에 다음 줄을 추가하세요:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

### 사용 예시
```html
<!-- 이모지 대신 Font Awesome 아이콘 사용 -->
<i class="fas fa-clipboard-list"></i>  <!-- To Do -->
<i class="fas fa-heart"></i>            <!-- 치코 (하트) -->
<i class="fas fa-cloud-sun"></i>        <!-- 날씨 -->
<i class="fas fa-user"></i>            <!-- 사용자 -->
<i class="fas fa-cog"></i>             <!-- 설정 -->
```

### 장점
- CDN으로 바로 사용 가능 (설치 불필요)
- 방대한 아이콘 컬렉션 (1000+ 개)
- CSS로 크기/색상 제어 가능
- 다크모드 호환

---

## 대안 1: Lucide Icons (SVG 직접 사용)

### 장점
- 매우 현대적이고 깔끔한 디자인
- 선형 스타일로 다크모드에 완벽
- 무료 오픈소스

### 단점
- SVG 코드를 직접 삽입해야 함
- 각 아이콘마다 코드 복사 필요

### 사용 예시
```html
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 11l3 3L22 4"></path>
  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
</svg>
```

**아이콘 검색**: https://lucide.dev/icons/

---

## 대안 2: Heroicons

### 장점
- Tailwind Labs 제작 (품질 보장)
- outline/solid 두 가지 스타일 제공

### 사용 예시
```html
<!-- SVG 직접 삽입 -->
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h4.5c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
</svg>
```

**아이콘 검색**: https://heroicons.com/

---

## 추천 아이콘 매핑

| 현재 이모지 | Font Awesome 클래스 | Lucide 이름 | 설명 |
|------------|---------------------|-------------|------|
| 📝 | `fa-clipboard-list` | `clipboard-list` | To Do |
| 💖 | `fa-heart` | `heart` | 치코 (하트) |
| 🌤️ | `fa-cloud-sun` | `cloud-sun` | 날씨 |
| ⚙️ | `fa-cog` | `settings` | 설정 |
| 💕 | `fa-heart` | `heart` | 연인 |
| 📋 | `fa-clipboard` | `clipboard` | 비서 |
| 👨‍⚕️ | `fa-user-doctor` | `stethoscope` | 의사 |
| 🤝 | `fa-handshake` | `handshake` | 친구 |

---

## 구현 방법

### Font Awesome 사용 (추천)
1. 모든 HTML 파일의 `<head>`에 CDN 링크 추가
2. 이모지 `<span>📝</span>` → `<i class="fas fa-clipboard-list"></i>`로 변경
3. CSS에서 `.nav-icon` 스타일 조정

### Lucide Icons 사용 (고품질)
1. https://lucide.dev/icons/ 에서 아이콘 검색
2. "Copy SVG" 클릭하여 SVG 코드 복사
3. HTML에 직접 삽입하거나 별도 JS 파일로 관리

