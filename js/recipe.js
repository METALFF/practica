import { auth, db } from "./firebase.js";
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const recipeContainer = document.getElementById("recipe-container");
const reviewForm = document.getElementById("reviewForm");
const reviewText = document.getElementById("reviewText");
const reviewSubmit = document.getElementById("reviewSubmit");
const reviewGuestMessage = document.getElementById("reviewGuestMessage");
const reviewsContainer = document.getElementById("reviewsContainer");
const favoriteBtn = document.getElementById("favoriteBtn");
let currentFavoriteId = null;

const recipeId = new URLSearchParams(window.location.search).get("id");

let reviewAuthor = null;

async function loadRecipe() {
    if (!recipeId) {
        recipeContainer.textContent = "Рецепт не указан";
        return;
    }

    const recipeSnapshot = await getDoc(doc(db, "recipes", recipeId));

    if (!recipeSnapshot.exists()) {
        recipeContainer.textContent = "Рецепт не найден";
        return;
    }

    showRecipe(recipeSnapshot.data());
}
async function checkFavorite(userId) {
    const favQuery = query(
        collection(db, "favorites"),
        where("recipeId", "==", recipeId),
        where("userId", "==", userId)
    );

    const snapshot = await getDocs(favQuery);

    if (snapshot.empty) {
        currentFavoriteId = null;
        favoriteBtn.textContent = "В избранное";
        return;
    }

    currentFavoriteId = snapshot.docs[0].id;
    favoriteBtn.textContent = "Убрать из избранного";
}

favoriteBtn.addEventListener("click", async () => {
    if (!reviewAuthor) {
        return;
    }

    if (currentFavoriteId) {
        await deleteDoc(doc(db, "favorites", currentFavoriteId));
    } else {
        await addDoc(collection(db, "favorites"), {
            recipeId: recipeId,
            userId: reviewAuthor.userId,
            createdAt: serverTimestamp()
        });
    }

    await checkFavorite(reviewAuthor.userId);
});

function showRecipe(recipe) {
    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const embedUrl = getYoutubeEmbedUrl(recipe.video);
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(recipe.title + " рецепт")}`;

    const videoBlock = embedUrl
        ? `<h2>Видео</h2>
           <div class="video-wrap">
               <iframe src="${embedUrl}" title="${recipe.title}" allowfullscreen></iframe>
           </div>`
        : `<h2>Видео</h2>
           <a href="${searchUrl}" target="_blank" rel="noopener" class="video-search-link">Найти видео-рецепт на YouTube</a>`;

    recipeContainer.innerHTML = `
        <h1>${recipe.title}</h1>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p><strong>Категория:</strong> ${recipe.category}</p>

        <h2>Ингредиенты</h2>
        <ul>${ingredients.map((one) => `<li>${one}</li>`).join("")}</ul>

        <h2>Инструкции</h2>
        <p>${recipe.instructions}</p>

        ${videoBlock}
    `;

    document.title = recipe.title;
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        reviewAuthor = null;
        reviewForm.hidden = true;
        reviewGuestMessage.hidden = false;
        favoriteBtn.hidden = true;
        return;
    }

    const profileSnapshot = await getDoc(doc(db, "users", user.uid));

    reviewAuthor = {
        userId: user.uid,
        username: profileSnapshot.exists()
            ? profileSnapshot.data().username
            : "Пользователь"
    };

    reviewGuestMessage.hidden = true;
    reviewForm.hidden = false;
    favoriteBtn.hidden = false;
    checkFavorite(user.uid);
});

function loadReviews() {
    if (!recipeId) {
        return;
    }

    const reviewsQuery = query(
        collection(db, "comments"),
        where("recipeId", "==", recipeId),
        orderBy("createdAt", "desc")
    );

    onSnapshot(reviewsQuery, (snapshot) => {
        if (snapshot.empty) {
            reviewsContainer.textContent = "Отзывов пока нет. Будьте первым!";
            return;
        }

        reviewsContainer.innerHTML = "";

        snapshot.forEach((reviewDoc) => {
            reviewsContainer.appendChild(buildReviewItem(reviewDoc.data()));
        });
    });
}

function buildReviewItem(review) {
    const item = document.createElement("article");
    item.className = "review-item";

    const header = document.createElement("p");
    header.className = "review-header";
    header.textContent = `${review.username} — ${toReadableDate(review.createdAt)}`;

    const body = document.createElement("p");
    body.className = "review-body";
    body.textContent = review.text;

    item.append(header, body);
    return item;
}

function toReadableDate(createdAt) {
    if (!createdAt) {
        return "только что";
    }

    return createdAt.toDate().toLocaleString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const text = reviewText.value.trim();

    if (text === "") {
        reviewText.placeholder = "Отзыв не может быть пустым";
        return;
    }

    if (!reviewAuthor || !recipeId) {
        return;
    }

    reviewSubmit.disabled = true;

    try {
        await addDoc(collection(db, "comments"), {
            recipeId: recipeId,
            userId: reviewAuthor.userId,
            username: reviewAuthor.username,
            text: text,
            createdAt: serverTimestamp()
        });

        reviewForm.reset();
    } catch (error) {
        console.error("Не удалось сохранить отзыв:", error);
        reviewText.placeholder = "Ошибка при отправке. Попробуйте ещё раз";
    } finally {
        reviewSubmit.disabled = false;
    }
});

function getYoutubeEmbedUrl(url) {
    if (!url) {
        return "";
    }

    try {
        const parsed = new URL(url);
        let videoId = "";

        if (parsed.hostname === "youtu.be") {
            videoId = parsed.pathname.slice(1);
        } else if (parsed.hostname.endsWith("youtube.com")) {
            if (parsed.pathname === "/watch") {
                videoId = parsed.searchParams.get("v");
            } else if (parsed.pathname.startsWith("/embed/")) {
                videoId = parsed.pathname.split("/")[2];
            }
        }

        return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : "";
    } catch (error) {
        return "";
    }
}

loadRecipe();
loadReviews();
