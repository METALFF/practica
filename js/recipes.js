import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const container = document.getElementById("recipes-list");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const loadMoreBtn = document.getElementById("load-more-btn");

let allRecipes = [];

const PAGE_SIZE = 10;
let currentList = [];
let visibleCount = PAGE_SIZE;

async function loadRecipes() {
    try {
        const recipesRef = collection(db, "recipes");
        const snapshot = await getDocs(recipesRef);

        allRecipes = [];

        snapshot.forEach((docSnap) => {
            allRecipes.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        applyFilters();
    } catch (error) {
        console.error("Ошибка загрузки рецептов:", error);
    }
}

function renderRecipesList(recipes) {
    container.innerHTML = "";

    if (recipes.length === 0) {
        container.textContent = "Рецепты не найдены";
        return;
    }

    recipes.forEach((recipe) => {
        const card = renderCard(recipe.id, recipe);
        container.appendChild(card);
    });
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

function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;

    const filtered = allRecipes.filter((recipe) => {
        const matchesTitle =
            query === "" ||
            (recipe.title && recipe.title.toLowerCase().includes(query));

        const matchesCategory =
            category === "Все" ||
            recipe.category === category;

        return matchesTitle && matchesCategory;
    });

    currentList = sortRecipes(filtered);
    visibleCount = PAGE_SIZE;

    renderPage();
}

function sortRecipes(recipes) {
    const sortBy = sortSelect.value;
    const sorted = [...recipes];

    const getTime = (recipe) => {
        if (!recipe.createdAt) {
            return 0;
        }

        if (typeof recipe.createdAt.toMillis === "function") {
            return recipe.createdAt.toMillis();
        }

        return new Date(recipe.createdAt).getTime();
    };

    switch (sortBy) {
        case "newest":
            sorted.sort((a, b) => getTime(b) - getTime(a));
            break;

        case "oldest":
            sorted.sort((a, b) => getTime(a) - getTime(b));
            break;

        case "title-asc":
            sorted.sort((a, b) =>
                (a.title || "").localeCompare(b.title || "")
            );
            break;

        case "title-desc":
            sorted.sort((a, b) =>
                (b.title || "").localeCompare(a.title || "")
            );
            break;
    }

    return sorted;
}

function renderPage() {
    const pageItems = currentList.slice(0, visibleCount);

    renderRecipesList(pageItems);

    loadMoreBtn.style.display =
        visibleCount < currentList.length ? "block" : "none";
}

searchBtn.addEventListener("click", applyFilters);

categoryFilter.addEventListener("change", applyFilters);

sortSelect.addEventListener("change", applyFilters);

loadMoreBtn.addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    renderPage();
});

loadRecipes();