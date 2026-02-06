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

let isRegister = false;

// --- 登入流程控制 ---
function openAuth(forceReg) {
    isRegister = forceReg;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('auth-title').innerText = isRegister ? "註冊" : "登入";
    document.getElementById('reg-fields').style.display = isRegister ? "block" : "none";
}

function closeAuth() { document.getElementById('auth-overlay').style.display = 'none'; }
function switchToRegister() { isRegister = true; openAuth(true); }

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
        if(isRegister) {
            const res = await auth.createUserWithEmailAndPassword(email, pw);
            await db.collection('users').doc(res.user.uid).set({
                name: name || id,
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            });
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
    } catch(e) { alert(e.message); }
}

// --- 搜尋引擎功能 ---
function handleSearch(e) { if(e.key === "Enter") executeSearch(); }

async function executeSearch() {
    const q = document.getElementById('search-input').value;
    if(!q.trim()) return;

    if(auth.currentUser) {
        await db.collection('history').add({
            uid: auth.currentUser.uid,
            text: q,
            time: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    // 跳轉至結果 (範例跳轉到 Google)
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

async function loadHistory(uid) {
    const section = document.getElementById('history-section');
    const list = document.getElementById('history-list');
    const snap = await db.collection('history').where('uid', '==', uid).orderBy('time', 'desc').limit(5).get();
    
    if(snap.empty) { section.style.display = 'none'; return; }
    
    section.style.display = 'block';
    list.innerHTML = "";
    snap.forEach(doc => {
        const div = document.createElement('div');
        div.className = "history-item";
        div.innerHTML = `🕒 <span style="margin-left:10px;">${doc.data().text}</span>`;
        div.onclick = () => { document.getElementById('search-input').value = doc.data().text; executeSearch(); };
        list.appendChild(div);
    });
}

// --- 使用者狀態與 UI ---
function toggleMenu() {
    const m = document.getElementById('account-menu');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

async function changeAvatar() {
    const url = prompt("請貼上新的圖片網址：");
    if(url) {
        await db.collection('users').doc(auth.currentUser.uid).update({avatar: url});
        location.reload();
    }
}

auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const userSec = document.getElementById('user-section');
    if(user) {
        loginBtn.style.display = 'none';
        userSec.style.display = 'block';
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data() || { name: "User", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
        document.getElementById('top-avatar').src = data.avatar;
        document.getElementById('menu-avatar').src = data.avatar;
        document.getElementById('menu-name').innerText = data.name;
        document.getElementById('menu-email').innerText = user.email;
        loadHistory(user.uid);
    } else {
        loginBtn.style.display = 'block';
        userSec.style.display = 'none';
        document.getElementById('history-section').style.display = 'none';
    }
});