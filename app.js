// 請務必再次確認 apiKey 沒有填錯或漏掉
const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bBp8lWLJKlJbusO36tOimL8", 
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isRegisterMode = false;

// UI 切換
function openAuth(reg) {
    isRegisterMode = reg;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('auth-title').innerText = isRegisterMode ? "建立 Weifeng 帳號" : "登入";
    document.getElementById('reg-fields').style.display = isRegisterMode ? "block" : "none";
}
function closeAuth() { document.getElementById('auth-overlay').style.display = 'none'; }
function switchToRegister() { openAuth(true); }

function goToStep2() {
    const id = document.getElementById('acc-id').value;
    if(!id) return alert("請輸入帳號");
    document.getElementById('display-email').innerText = id + "@weifeng.tw";
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

async function processAuth() {
    const id = document.getElementById('acc-id').value;
    const pw = document.getElementById('acc-pw').value;
    const name = document.getElementById('reg-name').value;
    const email = id + "@weifeng.tw";
    try {
        if(isRegisterMode) {
            const res = await auth.createUserWithEmailAndPassword(email, pw);
            await db.collection('users').doc(res.user.uid).set({
                name: name || id,
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            });
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
    } catch(e) { alert("錯誤: " + e.message); }
}

// 搜尋跳轉
function handleSearch(e) { if(e.key === 'Enter') executeSearch(); }
function executeSearch() {
    const val = document.getElementById('search-input').value;
    if(val.trim()) window.location.href = `results.html?q=${encodeURIComponent(val)}`;
}

// 狀態監聽
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const userSec = document.getElementById('user-section');
    if(user) {
        loginBtn.style.display = 'none';
        userSec.style.display = 'block';
        document.getElementById('top-avatar').style.display = 'block';
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data() || { name: "使用者", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
        document.getElementById('top-avatar').src = data.avatar;
        document.getElementById('menu-avatar').src = data.avatar;
        document.getElementById('menu-name').innerText = data.name;
        document.getElementById('menu-email').innerText = user.email;
    } else {
        loginBtn.style.display = 'block';
        userSec.style.display = 'none';
    }
});

function toggleMenu() {
    const m = document.getElementById('account-menu');
    m.style.display = (m.style.display === 'block') ? 'none' : 'block';
}

async function changeAvatar() {
    const url = prompt("請貼上新的頭像網址：");
    if(url) {
        await db.collection('users').doc(auth.currentUser.uid).update({avatar: url});
        location.reload();
    }
}