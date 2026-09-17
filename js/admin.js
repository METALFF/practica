import { auth, db } from "./firebase.js";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

const accessDenied = document.getElementById("accessDenied");
const adminPanel = document.getElementById("adminPanel");

const recipeForm = document.getElementById("recipeForm");
const recipeDocId = document.getElementById("recipeDocId");
const recipeTitle = document.getElementById("recipeTitle");
const recipeCategory = document.getElementById("recipeCategory");
const recipeImage = document.getElementById("recipeImage");
const recipeIngredients = document.getElementById("recipeIngredients");
const recipeInstructions = document.getElementById("recipeInstructions");
const formTitle = document.getElementById("formTitle");
const recipeSubmitBtn = document.getElementById("recipeSubmitBtn");
const recipeCancelBtn = document.getElementById("recipeCancelBtn");

const adminRecipesList = document.getElementById("adminRecipesList");
const adminUsersList = document.getElementById("adminUsersList");


onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "./login.html";
        return;
    }

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const role = userSnap.exists() ? userSnap.data().role : "user";

    if (role !== "admin") {
        accessDenied.hidden = false;
        return;
    }

    adminPanel.hidden = false;
    loadRecipes();
    loadUsers();
});

async function loadRecipes() {
    const snapshot = await getDocs(collection(db, "recipes"));

    if (snapshot.empty) {
        adminRecipesList.textContent = "Рецептов пока нет";
        return;
    }

    adminRecipesList.innerHTML = "";

    snapshot.forEach((docSnap) => {
        adminRecipesList.appendChild(buildRecipeRow(docSnap.id, docSnap.data()));
    });
}

function buildRecipeRow(id, recipe) {
    const row = document.createElement("div");
    row.className = "admin-row";

    const info = document.createElement("span");
    info.textContent = `${recipe.title} (${recipe.category})`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Редактировать";
    editBtn.addEventListener("click", () => fillFormForEdit(id, recipe));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Удалить";
    deleteBtn.addEventListener("click", () => removeRecipe(id));

    row.append(info, editBtn, deleteBtn);
    return row;
}

function fillFormForEdit(id, recipe) {
    recipeDocId.value = id;
    recipeTitle.value = recipe.title;
    recipeCategory.value = recipe.category;
    recipeImage.value = recipe.image;
    recipeIngredients.value = Array.isArray(recipe.ingredients)
        ? recipe.ingredients.join("\n")
        : "";
    recipeInstructions.value = recipe.instructions;

    formTitle.textContent = "Редактировать рецепт";
    recipeSubmitBtn.textContent = "Сохранить";
    recipeCancelBtn.hidden = false;
}

function resetForm() {
    recipeForm.reset();
    recipeDocId.value = "";
    formTitle.textContent = "Добавить рецепт";
    recipeSubmitBtn.textContent = "Добавить";
    recipeCancelBtn.hidden = true;
}

recipeCancelBtn.addEventListener("click", resetForm);

recipeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = {
        title: recipeTitle.value.trim(),
        category: recipeCategory.value,
        image: recipeImage.value.trim(),
        ingredients: recipeIngredients.value
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== ""),
        instructions: recipeInstructions.value.trim()
    };

    const editingId = recipeDocId.value;

    if (editingId) {
        await updateDoc(doc(db, "recipes", editingId), data);
    } else {
        await addDoc(collection(db, "recipes"), data);
    }

    resetForm();
    await loadRecipes();
});

async function removeRecipe(id) {
    const confirmed = window.confirm("Удалить этот рецепт?");
    if (!confirmed) return;

    await deleteDoc(doc(db, "recipes", id));
    await loadRecipes();
}

async function loadUsers() {
    const snapshot = await getDocs(collection(db, "users"));

    if (snapshot.empty) {
        adminUsersList.textContent = "Пользователей пока нет";
        return;
    }

    adminUsersList.innerHTML = "";

    snapshot.forEach((docSnap) => {
        adminUsersList.appendChild(buildUserRow(docSnap.id, docSnap.data()));
    });
}

function buildUserRow(uid, userData) {
    const row = document.createElement("div");
    row.className = "admin-row";

    const info = document.createElement("span");
    info.textContent = `${userData.username || "—"} (${userData.email || "—"}) — ${userData.role || "user"}`;

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = userData.role === "admin" ? "Снять admin" : "Сделать admin";
    toggleBtn.addEventListener("click", () => toggleRole(uid, userData.role));

    row.append(info, toggleBtn);
    return row;
}

async function toggleRole(uid, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", uid), { role: newRole });
    await loadUsers();
}