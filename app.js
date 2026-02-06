const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bBp8lWLJKlJbusO36tOimL8",
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045",
  measurementId: "G-DX7B5REPVJ"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isRegisterMode = false;

// 1. 介面控制
function openAuth(forceRegister = false) {
    document.getElementById('auth-overlay').style.display = 'flex';
    isRegisterMode = forceRegister;
    updateAuthUI();
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

function switchToRegister() {
    isRegisterMode = true;
    updateAuthUI();
}

function updateAuthUI() {
    document.getElementById('auth-title').innerText = isRegisterMode ? "建立帳號" : "登入";
    document.getElementById('register-only').style.display = isRegisterMode ? "block" : "none";
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
}

// 2. 登入/註冊流程
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
        let userCredential;
        if(isRegisterMode) {
            userCredential = await auth.createUserWithEmailAndPassword(email, pw);
            // 存入基本資料
            await db.collection('users').doc(userCredential.user.uid).set({
                name: name || id,
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            });
        } else {
            userCredential = await auth.signInWithEmailAndPassword(email, pw);
        }
        
        // 紀錄到本地多帳號清單
        saveToLocalAccounts(userCredential.user.email);
        closeAuth();
    } catch(e) { alert(e.message); }
}

// 3. 多帳號管理
function saveToLocalAccounts(email) {
    let accounts = JSON.parse(localStorage.getItem('wf_accounts') || '[]');
    if(!accounts.includes(email)) {
        accounts.push(email);
        localStorage.setItem('wf_accounts', JSON.stringify(accounts));
    }
}

function toggleMenu() {
    const menu = document.getElementById('account-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

async function changeAvatar() {
    const url = prompt("請貼上新的頭像圖片網址：");
    if(url) {
        await db.collection('users').doc(auth.currentUser.uid).update({ avatar: url });
        location.reload();
    }
}

function handleLogout() {
    auth.signOut().then(() => location.reload());
}

// 4. 監聽狀態與 UI 渲染
auth.onAuthStateChanged(async (user) => {
    if(user) {
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data() || { name: user.email.split('@')[0], avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
        
        document.getElementById('nav-login-btn').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        
        document.getElementById('top-avatar').src = data.avatar;
        document.getElementById('menu-avatar').src = data.avatar;
        document.getElementById('menu-name').innerText = data.name;
        document.getElementById('menu-email').innerText = user.email;

        renderOtherAccounts(user.email);
    } else {
        document.getElementById('nav-login-btn').style.display = 'block';
        document.getElementById('user-section').style.display = 'none';
    }
});

function renderOtherAccounts(currentEmail) {
    const accounts = JSON.parse(localStorage.getItem('wf_accounts') || '[]');
    const container = document.getElementById('other-accounts');
    container.innerHTML = "";
    accounts.filter(e => e !== currentEmail).forEach(email => {
        const item = document.createElement('div');
        item.className = "menu-item";
        item.innerText = "👥 " + email;
        item.onclick = () => { alert("切換帳號功能：請登出後使用新帳號登入。"); };
        container.appendChild(item);
    });
}