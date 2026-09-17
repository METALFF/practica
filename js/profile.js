import { logout } from "./auth.js";
import { auth, db } from "./firebase.js";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    orderBy,
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js"
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js"

const logoutButton = document.getElementById("logoutButton");
const adminLink = document.getElementById("adminLink");
const profileForm = document.getElementById("profileForm");
const profileUsername = document.getElementById("profileUsername");
const profileEmail = document.getElementById("profileEmail");
const myReviewsList = document.getElementById("myReviewsList");

let currentUid = null;

logoutButton.addEventListener("click", async () => {
    await logout();
    window.location.href = "./index.html";
})

onAuthStateChanged(auth, async (user) => {
    if(user) {
        currentUid = user.uid;

        const userDoc = doc(db, "users", user.uid);
        const userData = await getDoc(userDoc)

        profileUsername.value = userData.data().username || "";
        profileEmail.value = userData.data().email || "";

        if(userData.data().role === "admin") {
            adminLink.hidden = false;
        }

        loadMyReviews();
    } else {
        window.location.href = "./login.html";
    }
})

profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await updateDoc(doc(db, "users", currentUid), {
        username: profileUsername.value.trim()
    });
})

async function loadMyReviews() {
    const reviewsQuery = query(
        collection(db, "comments"),
        where("userId", "==", currentUid),
        orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(reviewsQuery);

    if (snapshot.empty) {
        myReviewsList.textContent = "Вы пока не оставляли отзывов";
        return;
    }

    myReviewsList.innerHTML = "";

    snapshot.forEach((docSnap) => {
        myReviewsList.appendChild(buildReviewRow(docSnap.id, docSnap.data()));
    });
}

function buildReviewRow(id, review) {
    const row = document.createElement("div");
    row.className = "my-review-row";

    const textArea = document.createElement("textarea");
    textArea.value = review.text;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Сохранить";
    saveBtn.addEventListener("click", async () => {
        await updateDoc(doc(db, "comments", id), {
            text: textArea.value.trim()
        });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", async () => {
        const confirmed = window.confirm("Удалить этот отзыв?");
        if (!confirmed) return;

        await deleteDoc(doc(db, "comments", id));
        await loadMyReviews();
    });

    row.append(textArea, saveBtn, deleteBtn);
    return row;
}