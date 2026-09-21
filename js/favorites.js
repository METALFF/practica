import { auth, db } from "./firebase.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const favoritesList = document.getElementById("favoritesList");

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "./login.html";
        return;
    }

    loadFavorites(user.uid);
});

async function loadFavorites(userId) {
    const favQuery = query(
        collection(db, "favorites"),
        where("userId", "==", userId)
    );

    const snapshot = await getDocs(favQuery);

    if (snapshot.empty) {
        favoritesList.textContent = "У вас пока нет избранных рецептов";
        return;
    }

    favoritesList.innerHTML = "";

    for (const favDoc of snapshot.docs) {
        const favData = favDoc.data();
        const recipeSnap = await getDoc(doc(db, "recipes", favData.recipeId));

        if (recipeSnap.exists()) {
            favoritesList.appendChild(
                buildFavoriteRow(favDoc.id, favData.recipeId, recipeSnap.data())
            );
        }
    }
}

function buildFavoriteRow(favoriteId, recipeId, recipe) {
    const row = document.createElement("div");
    row.className = "favorite-row";

    row.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <span>${recipe.title}</span>
        <a href="./recipe.html?id=${recipeId}">Открыть</a>
    `;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Убрать";
    removeBtn.className = "btn-secondary";
    removeBtn.addEventListener("click", async () => {
        await deleteDoc(doc(db, "favorites", favoriteId));
        row.remove();
    });

    row.appendChild(removeBtn);
    return row;
}