const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bBp8lWLJKlJbusO36tOimL8",
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045"
};

// 初始化 Firebase
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isRegisterMode = false;

// UI 切換邏輯
function openAuth(reg) {
    isRegisterMode = reg;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('auth-title').innerText = reg ? "建立 Weifeng 帳號" : "登入 Weifeng";
    document.getElementById('reg-fields').style.display = reg ? "block" : "none";
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('acc-id').value = ""; 
}

function closeAuth() { document.getElementById('auth-overlay').style.display = 'none'; }
function switchToRegister() { openAuth(true); }

// 下一步：驗證並強制使用 weifeng.tw
function goToStep2() {
    const idInput = document.getElementById('acc-id').value.trim();
    
    // 規定 1：不允許輸入 @ 符號，確保使用者只輸入帳號前綴
    if (idInput.includes('@')) {
        return alert("請僅輸入帳號名稱，不須包含 @ 符號，系統將自動為您加上 @weifeng.tw");
    }
    
    if(!idInput) return alert("請輸入帳號名稱");
    
    // 規定 2：強制後置網域
    const finalEmail = idInput + "@weifeng.tw";
    
    document.getElementById('display-email').innerText = finalEmail;
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// 登入/註冊核心
async function processAuth() {
    const idInput = document.getElementById('acc-id').value.trim();
    const pw = document.getElementById('acc-pw').value;
    
    // 再次確保格式正確
    const email = idInput + "@weifeng.tw";
    const name = document.getElementById('reg-name').value || idInput;

    try {
        if(isRegisterMode) {
            const res = await auth.createUserWithEmailAndPassword(email, pw);
            await db.collection('users').doc(res.user.uid).set({
                name: name,
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            });
        } else {
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
    } catch(e) {
        alert("驗證失敗: " + e.message);
    }
}

// 搜尋執行
function handleSearch(e) { if(e.key === "Enter") executeSearch(); }
function executeSearch() {
    const q = document.getElementById('search-input').value;
    if(q.trim()) window.location.href = `results.html?q=${encodeURIComponent(q)}`;
}

// 監聽登入狀態
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const userSec = document.getElementById('user-section');
    if(user) {
        loginBtn.style.display = 'none';
        userSec.style.display = 'block';
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data() || { name: "使用者", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
        document.getElementById('top-avatar').src = data.avatar;
        document.getElementById('top-avatar').style.display = 'block';
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