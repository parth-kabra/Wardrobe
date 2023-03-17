import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/9.4.1/firebase-auth.js";
import { getDatabase, ref, set, get, child, remove} from "https://www.gstatic.com/firebasejs/9.4.1/firebase-database.js";

const firebaseConfig = {

};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(app);
const db = getDatabase();
let total = 0
const dbRef = ref(getDatabase());
Notiflix.Notify.Init({});

function createHash(username){
    var result = "";
    for(var i = 0; i < username.length;i++){
        if(username[i] == '.' || username[i] == '#' || username[i] == "$" || username[i] == "[" || username[i] == "]")
            continue;
        result += username[i]
    }
    return result
}

async function addtoCart(displayName, price, img){
    const userid = getAuth().currentUser;
    if(!userid){
        document.getElementById("login").click();
        return;
    }
    const d = new Date();
    const time = d.getTime().toString()
    const name = displayName.toUpperCase()
    const username = createHash(userid.email)
    const str = "/users/" + username + "/cart/" + time
    const obj = {
        displayName:name,
        price:price,
        img:img,
        time:time
    }
    set(ref(db, str), obj).then( () => {
        Notiflix.Notify.Success("Added to cart"); 
    }).catch( () => {
        Notiflix.Notify.Failure("Please try again")
    }) 
}

function removeItem(itemclass, price){
    total -= price;
    const username = createHash(getAuth().currentUser.email);
    document.getElementById(itemclass).style.display = "none"
    const str = "/users/" + username + "/cart/" + itemclass
    remove(ref(db, str))
}

function pay(){
    var options = {
        "key":"rzp_test_ZHpFbfhR3rcJD8",
        "amount":total * 100,
        "currency":"INR",
        "name": "Wardrobe",
        "description":"Checkout",
        "handler": function (response){
            if(typeof response.razorpay_payment_id == 'undefined' || response.razorpay_payment_id < 1){
                Notiflix.Notify.Failure("Payment failed"); 
            }
            else{
                const username = createHash(getAuth().currentUser.email)
                const str = "/users/" + username + "/cart/"
                remove(ref(db, str))
                Notiflix.Notify.Success("Payment successful"); 
                
            }
        },
        "prefill": {
            "name": "example",
            "email" : "example@example.com",
            "contact":+919900000000
        },
        "notes": {
            "address" : "note value"
        },
        "theme": {
            "color": "#040273"
        }
    }
    var pay = new Razorpay(options)
    pay.open()
}

async function loadCart(){
    const userid = getAuth().currentUser
    if(!userid){
        return;
    }
    const username = userid.email
    const div = document.getElementById("mySidebar")
    
    div.innerHTML = `<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">×</a>`
    get(child(dbRef, `users/${createHash(username)}/cart`)).then((snapshot) => {
        var items = []
        snapshot.forEach((i)=>{
            items.push(i.val())
        })
        if(!items.length){
            div.style.display = "block"
            div.innerHTML += `<a><h4 class="float1" id = "empty__cart">The Cart is empty</h4></a>`
        }
        else{
            total = 0
            div.insertAdjacentHTML("afterbegin", `<button onclick = "pay()" class="cart__product button" id = "proceed">Proceed</button>`)
            div.style.display = "flex"
            div.style.flexDirection = "column"
            div.style.alignItems = "center"
            items.forEach((item) => {
                div.insertAdjacentHTML("afterbegin",
                `
                <div class="product__product" id ="${item.time}">
                    <div class="product__box cart__product" style="height:350px">
                        <button onclick="removeItem(${item.time}, ${item.price})" class="button product__new" style="background-image: linear-gradient(to right, #e22d2d, #e00025);">Remove</button>
                        <img src="${item.img}" width=400  alt=""/>
                    </div>
                    <div class="product__data">
                        <h3 class="product__name">${item.displayName}</h3>
                        <span class="product__preci">$${item.price}</span>
                    </div>
                    
                </div>
                `
                )
                total += item.price
            })
            
        }
    })
}

getAuth().onAuthStateChanged(function (user) {
    if (user) {
        get(child(dbRef, `users/${createHash(user.email)}`)).then((snapshot) => {
            if(!snapshot.exists()){
                const obj = {
                    username:user.displayName,
                    email:user.email,
                    avatar:user.photoURL
                }
                set(ref(db, "users/"+createHash(user.email)), obj)
            }
        }).catch((error) => {
            console.error(error);
        });
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
        .then((result) => {
            location.reload()
        })
        .catch((error) => {});
}

function logout() {
    signOut(auth)
        .then(() => {
            location.reload()
        })
        .catch((error) => {});
    location.reload()
}

window.login = login
window.logout = logout
window.addtoCart = addtoCart
window.loadCart = loadCart
window.removeItem = removeItem
window.pay = pay
