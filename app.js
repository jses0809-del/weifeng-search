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

let isSignUp = false;

function openAuth() {
    isSignUp = false;
    document.getElementById('auth-overlay').style.display = 'flex';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('name-field').style.display = 'none';
    document.getElementById('auth-title').innerText = "登入";
}

function setRegisterMode() {
    isSignUp = true;
    document.getElementById('auth-title').innerText = "註冊";
    document.getElementById('name-field').style.display = 'block';
    document.getElementById('switch-reg-btn').style.display = 'none';
}

function closeAuth() {
    document.getElementById('auth-overlay').style.display = 'none';
}

function showStep2() {
    const id = document.getElementById('account-id').value;
    if(!id) return alert("請輸入帳號");
    document.getElementById('target-email').innerText = id + "@weifeng.tw";
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
}

async function finishAuth() {
    const id = document.getElementById('account-id').value;
    const pw = document.getElementById('user-pw').value;
    const name = document.getElementById('user-name').value;
    const email = id + "@weifeng.tw";

    try {
        if(isSignUp) {
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

function toggleMenu() {
    const m = document.getElementById('account-menu');
    m.style.display = m.style.display === 'block' ? 'none' : 'block';
}

async function changeAvatar() {
    const url = prompt("輸入圖片網址：");
    if(url) {
        await db.collection('users').doc(auth.currentUser.uid).update({avatar: url});
        location.reload();
    }
}

// 核心：登入狀態監聽
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('main-login-btn');
    const avatarBtn = document.getElementById('top-avatar');
    
    if(user) {
        loginBtn.style.display = 'none';
        avatarBtn.style.display = 'block';
        
        const doc = await db.collection('users').doc(user.uid).get();
        const data = doc.data() || { avatar: "https://cdn-icons-png.flaticon.com/512/149/149071.png", name: "User" };
        
        avatarBtn.src = data.avatar;
        document.getElementById('menu-avatar').src = data.avatar;
        document.getElementById('menu-name').innerText = data.name;
        document.getElementById('menu-email').innerText = user.email;
    } else {
        loginBtn.style.display = 'block';
        avatarBtn.style.display = 'none';
        document.getElementById('account-menu').style.display = 'none';
    }
});