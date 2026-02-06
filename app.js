// 根據你最後提供的代碼修正的金鑰配置
const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bBp8lWLJKlJbusO36tOimL8", 
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045",
  measurementId: "G-DX7B5REPVJ"
};

// 【重要】使用相容模式 (compat) 初始化，這才能對應 index.html 裡的 script
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

let isNewUser = false;

// 1. 打開與切換介面 (移除彈窗，純 UI 變換)
function openAuth() {
    isNewUser = false;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-title').innerText = "登入";
    document.getElementById('step-desc').innerText = "使用您的 Weifeng 帳號";
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

function toggleToRegister() {
    isNewUser = true;
    document.getElementById('step-title').innerText = "註冊";
    document.getElementById('step-desc').innerText = "建立您的微風帳號";
}

// 2. 下一步
function showPasswordStep() {
    const id = document.getElementById('account-id').value;
    if(!id) return alert("請輸入帳號");
    
    document.getElementById('target-email').innerText = id + "@weifeng.tw";
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// 3. 提交驗證
async function submitAuth() {
    const id = document.getElementById('account-id').value;
    const pw = document.getElementById('account-pw').value;
    const email = id + "@weifeng.tw";

    try {
        if(isNewUser) {
            await auth.createUserWithEmailAndPassword(email, pw);
            alert("註冊成功！");
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
            alert("登入成功！");
        }
        closeAuth();
    } catch(e) {
        // 如果 API Key 有問題，這裡會清楚顯示原因
        console.error("Firebase Error:", e);
        alert("錯誤: " + e.message);
    }
}

// 4. 監聽狀態
auth.onAuthStateChanged(user => {
    const loginBtn = document.getElementById('main-login-btn');
    const userInfo = document.getElementById('user-info');
    if(user) {
        loginBtn.innerText = "登出";
        loginBtn.onclick = () => auth.signOut();
        userInfo.innerText = user.email.split('@')[0];
    } else {
        loginBtn.innerText = "登入";
        loginBtn.onclick = openAuth;
        userInfo.innerText = "";
    }
});