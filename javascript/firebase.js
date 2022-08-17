import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import { getFirestore, collection, getDocs, setDoc, doc, updateDoc} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCCeJLFYX8rj5KrTe5uyfxTtpr8prl8v5k",
    authDomain: "wardrobe-7bde3.firebaseapp.com",
    projectId: "wardrobe-7bde3",
    storageBucket: "wardrobe-7bde3.appspot.com",
    messagingSenderId: "437660575231",
    appId: "1:437660575231:web:e7cba51ecc0dd3299973ca",
    measurementId: "G-3XZC893GQ8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider(app);
export const db = getFirestore(app);
const usrs = collection(db, "users")
let users = {};

(async () => {
    const querySnapshot = await getDocs(usrs);
    querySnapshot.forEach((doc) => {
        users[doc.id] = doc.data();
    });
})()

async function addUser(email, newuser){
    await setDoc(doc(usrs, email), newuser);
}

async function addtoCart(displayName, price, img){
    const userid = getAuth().currentUser
    console.log(userid)
    if(!userid){
        document.getElementById("login").click();
        return;
    }
    
}

getAuth().onAuthStateChanged(function (user) {
    if (user) {
        if(!users[user.email]){
            const newuser = {
                email: user.email,
                name: user.displayName,
            }
            addUser(user.email, newuser)
            users[user.email] = newuser;
        }
        document.getElementById("login").style.display = "none"
        document.getElementById("logout").style.display = "block";
    }
    
    else {
        document.getElementById("login").style.display = "block"
        document.getElementById("logout").style.display = "none";
    }
});


function login() {
    signInWithPopup(auth, provider)
        .then((result) => {})
        .catch((error) => {});
}

function logout() {
    signOut(auth)
        .then(() => {})
        .catch((error) => {});
}

window.login = login
window.logout = logout
window.addtoCart = addtoCart
