// Firebase 配置 (沿用你截圖中的資訊)
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

let isSignUp = false; // 追蹤是登入還是註冊

// 1. 打開登入介面
function openAuth() {
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

// 2. 切換到密碼介面 (第一步結束)
function toStep2() {
    const user = document.getElementById('acc-name').value;
    if(!user) return alert("請輸入帳號");
    
    document.getElementById('display-email').innerText = `${user}@weifeng.tw`;
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// 3. 完成驗證
async function finishAuth() {
    const user = document.getElementById('acc-name').value;
    const pw = document.getElementById('acc-pw').value;
    const email = `${user}@weifeng.tw`;

    try {
        if(isSignUp) {
            await auth.createUserWithEmailAndPassword(email, pw);
            alert("帳號建立成功");
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
        updateUI(email);
    } catch(e) {
        // 如果登入時找不到帳號，自動切換為詢問註冊
        if(e.code === 'auth/user-not-found') {
            if(confirm("找不到帳號，要直接註冊嗎？")) {
                isSignUp = true;
                finishAuth();
            }
        } else {
            alert(e.message);
        }
    }
}

// 4. 更新主頁 UI (顯示登入帳號)
function updateUI(email) {
    document.getElementById('nav-login-btn').style.display = 'none';
    const display = document.getElementById('user-display');
    display.style.display = 'block';
    display.innerText = "👋 " + email.split('@')[0];
    loadHistory();
}

// 監聽搜尋並儲存
document.getElementById('main-q').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        const q = this.value;
        const user = auth.currentUser;
        if(user) {
            db.collection('history').add({
                uid: user.uid,
                q: q,
                time: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => loadHistory());
        }
        alert("執行搜尋: " + q);
    }
});

async function loadHistory() {
    const user = auth.currentUser;
    if(!user) return;
    const snap = await db.collection('history').where('uid', '==', user.uid).orderBy('time', 'desc').limit(5).get();
    let h = "<b>最近搜尋:</b><br>";
    snap.forEach(doc => h += `<div>🕒 ${doc.data().q}</div>`);
    document.getElementById('history-box').innerHTML = h;
}