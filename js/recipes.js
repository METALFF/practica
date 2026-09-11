import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const container = document.getElementById("recipes-list");

async function loadRecipes() {
    try {
        const recipesRef = collection(db, "recipes");
        const snapshot = await getDocs(recipesRef);

        console.log("Количество рецептов:", snapshot.size);

        if (snapshot.empty) {
            container.textContent = "Рецептов пока нет";
            return;
        }

        container.innerHTML = "";

        snapshot.forEach((docSnap) => {
            console.log(docSnap.id, docSnap.data());

            const recipe = docSnap.data();
            const card = renderCard(docSnap.id, recipe);
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Ошибка загрузки рецептов:", error);
    }
}

function renderCard(id, recipe) {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <p><strong>Категория:</strong> ${recipe.category}</p>
        <p>${getShortInfo(recipe)}</p>
        <a href="./recipe.html?id=${id}" class="open-recipe-btn">Открыть</a>
    `;

    return card;
}

function getShortInfo(recipe) {
    if (Array.isArray(recipe.ingredients)) {
        return `${recipe.ingredients.length} ингредиентов`;
    }
    return "";
}

loadRecipes();