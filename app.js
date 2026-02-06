// 請再次確認這部分的 Config 與你 Firebase 後台顯示的完全一致
const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bbp8lWLJKLJbusO36tOimL8", // 結尾確認為 8
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045",
  measurementId: "G-DX7B5REPVJ"
};

// 初始化
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isNewUser = false;

// 打開登入視窗
function openAuth() {
    isNewUser = false;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-title').innerText = "登入";
}

// 關閉視窗
function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

// 切換到註冊模式 (拿掉了彈窗提示)
function toggleToRegister() {
    isNewUser = true;
    document.getElementById('step-title').innerText = "建立您的微風帳號";
    document.getElementById('step-desc').innerText = "請輸入您想使用的帳號";
    // 這裡不跳 alert，直接讓使用者感覺 UI 變化
}

// 切換到密碼步驟
function showPasswordStep() {
    const id = document.getElementById('account-id').value;
    if(!id) {
        alert("請輸入帳號");
        return;
    }
    
    document.getElementById('target-email').innerText = id + "@weifeng.tw";
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// 執行最後的驗證
async function submitAuth() {
    const id = document.getElementById('account-id').value;
    const pw = document.getElementById('account-pw').value;
    const email = id + "@weifeng.tw";

    if (pw.length < 6) {
        alert("密碼長度至少需要 6 位數喔！");
        return;
    }

    try {
        if(isNewUser) {
            await auth.createUserWithEmailAndPassword(email, pw);
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
        // 登入後不需要重新整理，由監聽器處理 UI
    } catch(e) {
        // 如果是 API Key 錯誤，這裡會噴出訊息
        console.error(e);
        alert("發生錯誤: " + e.message);
    }
}

// 監聽登入狀態切換 UI
auth.onAuthStateChanged(user => {
    const loginBtn = document.getElementById('main-login-btn');
    const userInfo = document.getElementById('user-info');
    if(user) {
        loginBtn.innerText = "登出";
        loginBtn.onclick = () => auth.signOut();
        userInfo.innerText = user.email.split('@')[0]; // 只顯示 000 部分
        loadHistory(user.uid);
    } else {
        loginBtn.innerText = "登入";
        loginBtn.onclick = openAuth;
        userInfo.innerText = "";
        document.getElementById('history-display').innerHTML = "";
    }
});

// 搜尋儲存與顯示功能 (保持不變)
async function loadHistory(uid) {
    const snap = await db.collection('history').where('uid', '==', uid).orderBy('time', 'desc').limit(5).get();
    let html = "<b>最近搜尋紀錄</b>";
    snap.forEach(doc => {
        html += `<div style="padding:5px 0;">🕒 ${doc.data().text}</div>`;
    });
    document.getElementById('history-display').innerHTML = html;
}