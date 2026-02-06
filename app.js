// 請確保這裡的 Config 是從你的 Firebase 專案複製過來的
const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bbp8lWLJKLJbusO36tOimL8",
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isNewUser = false;

// 1. 控制登入視窗
function openAuth() {
    isNewUser = false;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-title').innerText = "登入";
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

function toggleToRegister() {
    isNewUser = true;
    document.getElementById('step-title').innerText = "註冊";
    alert("模式已切換為：建立新帳號");
}

// 2. 切換到密碼步驟
function showPasswordStep() {
    const id = document.getElementById('account-id').value;
    if(!id) return alert("請輸入帳號");
    
    document.getElementById('target-email').innerText = id + "@weifeng.tw";
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// 3. 執行 Firebase 驗證
async function submitAuth() {
    const id = document.getElementById('account-id').value;
    const pw = document.getElementById('account-pw').value;
    const email = id + "@weifeng.tw";

    try {
        if(isNewUser) {
            await auth.createUserWithEmailAndPassword(email, pw);
            alert("帳號註冊成功！");
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
            alert("歡迎回來！");
        }
        closeAuth();
        location.reload(); // 登入後重新整理以顯示狀態
    } catch(e) {
        alert("錯誤: " + e.message);
    }
}

// 4. 監聽登入狀態與紀錄
auth.onAuthStateChanged(user => {
    if(user) {
        document.getElementById('main-login-btn').innerText = "登出";
        document.getElementById('main-login-btn').onclick = () => auth.signOut().then(()=>location.reload());
        document.getElementById('user-info').innerText = user.email;
        loadHistory(user.uid);
    }
});

// 搜尋儲存邏輯
document.getElementById('main-search').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const val = e.target.value;
        const user = auth.currentUser;
        if(user && val) {
            await db.collection('history').add({
                uid: user.uid,
                text: val,
                time: firebase.firestore.FieldValue.serverTimestamp()
            });
            loadHistory(user.uid);
        }
        alert("搜尋中: " + val);
    }
});

async function loadHistory(uid) {
    const snap = await db.collection('history').where('uid', '==', uid).orderBy('time', 'desc').limit(5).get();
    let html = "<b>最近搜尋紀錄</b>";
    snap.forEach(doc => {
        html += `<div style="padding:5px 0;">🕒 ${doc.data().text}</div>`;
    });
    document.getElementById('history-display').innerHTML = html;
}