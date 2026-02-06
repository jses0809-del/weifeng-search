// Firebase 配置 (根據你提供的最新金鑰)
const firebaseConfig = {
  apiKey: "AIzaSyBroLWbh0y7bBp8lWLJKlJbusO36tOimL8",
  authDomain: "weifeng-ai-search.firebaseapp.com",
  projectId: "weifeng-ai-search",
  storageBucket: "weifeng-ai-search.firebasestorage.app",
  messagingSenderId: "508132498464",
  appId: "1:508132498464:web:af31188c836d408d86b045"
};

// 初始化 Firebase (相容模式)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

let isRegisterMode = false;

// --- 1. 登入視窗 UI 控制 ---

// 開啟登入視窗
function openAuth(forceRegister = false) {
    isRegisterMode = forceRegister;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    
    // 根據模式切換文字
    document.getElementById('auth-title').innerText = isRegisterMode ? "建立帳號" : "登入";
    document.getElementById('reg-fields').style.display = isRegisterMode ? "block" : "none";
    document.getElementById('switch-text').style.display = isRegisterMode ? "none" : "block";
}

// 關閉視窗
function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
    // 清空輸入框
    document.getElementById('acc-id').value = "";
    document.getElementById('acc-pw').value = "";
    document.getElementById('reg-name').value = "";
}

// 切換到註冊模式
function switchToRegister() {
    isRegisterMode = true;
    openAuth(true);
}

// 前往密碼輸入步驟 (下一步)
function goToStep2() {
    const id = document.getElementById('acc-id').value;
    if (!id) return alert("請輸入帳號");
    
    document.getElementById('display-email').innerText = id + "@weifeng.tw";
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// --- 2. 核心驗證邏輯 (註冊與登入) ---

async function processAuth() {
    const id = document.getElementById('acc-id').value;
    const pw = document.getElementById('acc-pw').value;
    const name = document.getElementById('reg-name').value;
    const email = id + "@weifeng.tw";

    try {
        if (isRegisterMode) {
            // 執行註冊
            const res = await auth.createUserWithEmailAndPassword(email, pw);
            // 儲存個人基本資料到 Firestore
            await db.collection('users').doc(res.user.uid).set({
                name: name || id,
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // 預設頭像
                email: email
            });
        } else {
            // 執行登入
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
    } catch (e) {
        alert("驗證失敗: " + e.message);
    }
}

// --- 3. 搜尋引擎功能 ---

// 處理按下 Enter
function handleSearch(event) {
    if (event.key === "Enter") {
        executeSearch();
    }
}

// 執行搜尋
async function executeSearch() {
    const query = document.getElementById('search-input').value;
    if (!query.trim()) return;

    // 如果使用者已登入，儲存搜尋紀錄
    const user = auth.currentUser;
    if (user) {
        try {
            await db.collection('history').add({
                uid: user.uid,
                text: query,
                time: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.error("紀錄儲存失敗", e);
        }
    }

    // 跳轉到「自己的」搜尋結果頁面
    window.location.href = `results.html?q=${encodeURIComponent(query)}`;
}

// 載入搜尋紀錄 UI
async function loadHistory(uid) {
    const section = document.getElementById('history-section');
    const list = document.getElementById('history-list');
    
    try {
        const snap = await db.collection('history')
            .where('uid', '==', uid)
            .orderBy('time', 'desc')
            .limit(5)
            .get();

        if (snap.empty) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        list.innerHTML = "";
        snap.forEach(doc => {
            const div = document.createElement('div');
            div.className = "history-item";
            div.innerHTML = `🕒 <span style="margin-left:10px;">${doc.data().text}</span>`;
            div.onclick = () => {
                document.getElementById('search-input').value = doc.data().text;
                executeSearch();
            };
            list.appendChild(div);
        });
    } catch (e) {
        console.warn("無法載入紀錄，請檢查 Firestore Rules。");
    }
}

// --- 4. 使用者選單與狀態監聽 ---

function toggleMenu() {
    const menu = document.getElementById('account-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// 更換頭像
async function changeAvatar() {
    const url = prompt("請輸入您的頭像圖片網址：");
    if (url && url.trim() !== "") {
        try {
            await db.collection('users').doc(auth.currentUser.uid).update({
                avatar: url
            });
            location.reload(); // 重新整理以套用新頭像
        } catch (e) {
            alert("更新失敗");
        }
    }
}

// 監聽登入狀態切換 UI
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const userSec = document.getElementById('user-section');
    const avatarImg = document.getElementById('top-avatar');

    if (user) {
        // 已登入狀態
        loginBtn.style.display = 'none';
        userSec.style.display = 'block';
        avatarImg.style.display = 'block';

        // 從 Firestore 抓取最新姓名與頭像
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data() || { 
            name: user.email.split('@')[0], 
            avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" 
        };

        avatarImg.src = userData.avatar;
        document.getElementById('menu-avatar').src = userData.avatar;
        document.getElementById('menu-name').innerText = userData.name;
        document.getElementById('menu-email').innerText = user.email;

        // 載入搜尋紀錄
        loadHistory(user.uid);
    } else {
        // 未登入狀態
        loginBtn.style.display = 'block';
        userSec.style.display = 'none';
        avatarImg.style.display = 'none';
        document.getElementById('history-section').style.display = 'none';
    }
});