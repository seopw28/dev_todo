// Firebase 설정 파일
// Firebase Console에서 프로젝트 설정 > 일반 > 앱 추가 > 웹 앱 에서 얻은 설정값을 여기에 입력하세요

const firebaseConfig = {
    apiKey: "AIzaSyD1lEadwt9EnTgtTJzWTKVh2RXihXHaeGE",
    authDomain: "vex-todo.firebaseapp.com",
    projectId: "vex-todo",
    storageBucket: "vex-todo.firebasestorage.app",
    messagingSenderId: "34091297756",
    appId: "1:34091297756:web:5b09568c8a6221530dbd19",
    measurementId: "G-6F3GVSJ5GX"
};

// Firebase 초기화
const app = firebase.initializeApp(firebaseConfig);

// Firestore 인스턴스
const db = firebase.firestore();

// Analytics 초기화 (measurementId가 있는 경우)
let analytics = null;
if (firebaseConfig.measurementId && typeof firebase.analytics !== 'undefined') {
    try {
        analytics = firebase.analytics();
        console.log('Analytics 초기화 완료');
    } catch (error) {
        console.warn('Analytics 초기화 실패:', error);
    }
}

// 인증 사용 여부 설정
// true: 인증 필요, false: 인증 없이 사용 (firestore.rules에서 allow read, write: if true로 설정 필요)
const useAuth = false; // 개발 중에는 false로 설정, 프로덕션에서는 true 권장

// 인증 (선택사항 - 익명 인증 또는 이메일 인증)
// 익명 인증 예시:
// firebase.auth().signInAnonymously()
//     .then(() => {
//         console.log('익명 인증 완료');
//     })
//     .catch((error) => {
//         console.error('인증 오류:', error);
//     });

