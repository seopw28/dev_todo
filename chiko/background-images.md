# 무료 배경 이미지 소스 가이드

## 1. Unsplash Source (추천 - 가장 간단)

**장점:**
- API 키 불필요
- 바로 사용 가능
- 고품질 이미지
- 상업적 사용 가능

**사용 방법:**
```
https://source.unsplash.com/1600x900/?{키워드}
```

**예시:**
- 연인: `https://source.unsplash.com/1600x900/?romantic,couple,love`
- 비서: `https://source.unsplash.com/1600x900/?office,business,professional`
- 의사: `https://source.unsplash.com/1600x900/?medical,doctor,hospital`
- 친구: `https://source.unsplash.com/1600x900/?friends,happy,fun`

## 2. CSS 그라데이션 (로딩 빠름)

**장점:**
- 이미지 로딩 없음
- 매우 빠름
- 인터넷 연결 불필요

**예시:**
```css
.bg-lover {
    background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
}
.bg-secretary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.bg-doctor {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}
.bg-friend {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
```

## 3. Pexels API (더 많은 제어)

**장점:**
- 풍부한 이미지 라이브러리
- API로 검색 가능
- 고품질

**단점:**
- API 키 필요 (무료)
- 약간의 설정 필요

**등록:**
1. https://www.pexels.com/api/ 접속
2. 무료 API 키 발급
3. 사용량 제한: 시간당 200회 요청

---

## 추천: Unsplash Source 사용

가장 간단하고 바로 사용 가능합니다!

