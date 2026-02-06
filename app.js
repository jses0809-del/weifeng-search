// Firebase 配置
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

// --- 登入控制邏輯 ---

function openAuth(reg) {
    isRegisterMode = reg;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('auth-title').innerText = reg ? "建立您的 Weifeng 帳號" : "登入";
    document.getElementById('reg-fields').style.display = reg ? "block" : "none";
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('acc-id').value = ""; // 清空輸入
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

function switchToRegister() {
    openAuth(true);
}

// 關鍵功能：禁止輸入 @ 並進入下一步
function goToStep2() {
    let idInput = document.getElementById('acc-id').value.trim();
    
    // 如果偵測到 @，直接幫使用者過濾掉並警告
    if (idInput.includes('@')) {
        alert("帳號名稱不需要輸入 @weifeng.tw，系統已自動為您處理。");
        idInput = idInput.split('@')[0]; // 只取 @ 之前的文字
        document.getElementById('acc-id').value = idInput;
    }
    
    if (!idInput) {
        return alert("請輸入帳號名稱");
    }
    
    // 組合最終 Email 顯示給使用者確認
    const finalEmail = idInput + "@weifeng.tw";
    document.getElementById('display-email').innerText = finalEmail;
    
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

// 執行 註冊 或 登入
async function processAuth() {
    const idInput = document.getElementById('acc-id').value.trim();
    const pw = document.getElementById('acc-pw').value;
    const email = idInput + "@weifeng.tw";
    const name = document.getElementById('reg-name').value || idInput;

    if (!pw || pw.length < 6) {
        return alert("密碼長度至少需要 6 位數");
    }

    try {
        if (isRegisterMode) {
            // 建立帳號
            const res = await auth.createUserWithEmailAndPassword(email, pw);
            // 存入用戶資料到 Firestore
            await db.collection('users').doc(res.user.uid).set({
                name: name,
                avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // 預設頭像
                createdAt: new Date()
            });
        } else {
            // 登入
            await auth.signInWithEmailAndPassword(email, pw);
        }
        closeAuth();
    } catch (error) {
        console.error("Auth Error:", error);
        alert("驗證失敗: " + error.message);
    }
}

// --- 搜尋功能邏輯 ---

function handleSearch(event) {
    if (event.key === "Enter") {
        executeSearch();
    }
}

function executeSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (query) {
        // 跳轉到結果頁並帶上參數
        window.location.href = `results.html?q=${encodeURIComponent(query)}`;
    }
}

// --- 帳戶狀態監聽 ---

auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('nav-login-btn');
    const userSec = document.getElementById('user-section');
    const topAvatar = document.getElementById('top-avatar');
    const menuAvatar = document.getElementById('menu-avatar');
    const menuName = document.getElementById('menu-name');
    const menuEmail = document.getElementById('menu-email');

    if (user) {
        // 已登入
        loginBtn.style.display = 'none';
        userSec.style.display = 'block';
        
        // 抓取 Firestore 資料
        const doc = await db.collection('users').doc(user.uid).get();
        const userData = doc.data() || { name: "使用者", avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };
        
        topAvatar.src = userData.avatar;
        topAvatar.style.display = 'block';
        menuAvatar.src = userData.avatar;
        menuName.innerText = userData.name;
        menuEmail.innerText = user.email;
    } else {
        // 未登入
        loginBtn.style.display = 'block';
        userSec.style.display = 'none';
        topAvatar.style.display = 'none';
    }
});

// 切換帳戶選單顯示
function toggleMenu() {
    const menu = document.getElementById('account-menu');
    menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
}

// 點擊頁面其他地方關閉選單
window.onclick = function(event) {
    if (!event.target.matches('.user-avatar-btn')) {
        const menu = document.getElementById('account-menu');
        if (menu && menu.style.display === 'block') {
            menu.style.display = 'none';
        }
    }
}

// 更換頭像功能 (點擊選單頭像觸發)
async function changeAvatar() {
    const newUrl = prompt("請輸入您的頭像圖片網址：");
    if (newUrl && auth.currentUser) {
        try {
            await db.collection('users').doc(auth.currentUser.uid).update({
                avatar: newUrl
            });
            location.reload(); // 重新整理頁面更新顯示
        } catch (e) {
            alert("更新頭像失敗");
        }
    }
}