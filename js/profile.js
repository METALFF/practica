import { logout } from "./auth.js";
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"

const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", async () => {
    await logout();
    window.location.href = "./index.html";
})

onAuthStateChanged(auth, async (user) => {
    if(user) {
        const uid = user.uid;
        const userDoc = doc(db, "users", uid);
        const userData = await getDoc(userDoc)
        console.log(userData.data());
    } else {
        window.location.href = "./login.html";
    }
})