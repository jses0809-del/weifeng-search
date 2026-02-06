// 這裡是你截圖中的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bbp8lWLJKLJbusO36tOimL8",
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045",
  measurementId: "G-DX7B5REPVJ"
};

// 初始化 Firebase (使用相容模式腳本)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// 核心功能：處理登入與註冊
async function handleAuth(mode) {
    const userId = document.getElementById('account-input').value; // 假設使用者打 000
    const password = document.getElementById('password-input').value;

    if (!userId || !password) return alert("請輸入帳號和密碼");

    // 關鍵步驟：把 000 變成 000@weifeng.tw
    const fullEmail = userId.includes('@') ? userId : `${userId}@weifeng.tw`;

    try {
        if (mode === 'signup') {
            await auth.createUserWithEmailAndPassword(fullEmail, password);
            alert("註冊成功！歡迎使用微風搜尋。");
        } else {
            await auth.signInWithEmailAndPassword(fullEmail, password);
            alert("登入成功！");
        }
        // 登入後隱藏登入區，顯示搜尋區 (這部分我們下一段補齊 UI)
        document.getElementById('auth-zone').style.display = 'none';
        document.getElementById('search-zone').style.display = 'block';
    } catch (error) {
        alert("失敗: " + error.message);
    }
}