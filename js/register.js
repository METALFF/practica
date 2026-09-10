import  { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const form = document.getElementById("registrationForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usernameValue = username.value;
    const emailValue = email.value;
    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;
    let hasError = false;


    if (usernameValue === "") {
        username.value = "";
        username.placeholder = "Введите имя";
        hasError = true;
    }

    if (emailValue === "") {
        email.value = "";
        email.placeholder = "Введите email";
        hasError = true;
    } else if(!email.checkValidity()) {
        email.value = "";
        email.placeholder = "Введите корректный email";
        hasError = true;
    }   

    if (passwordValue.length < 6) {
        password.value = "";
        password.placeholder = "Минимум 6 символов";
        hasError = true;
    }

    if (passwordValue !== confirmPasswordValue) {
        confirmPassword.value = "";
        confirmPassword.placeholder = "Пароли не совпадают";
        hasError = true;
    }

    if (hasError) {
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth, 
            emailValue,
            passwordValue
        );
        await setDoc(
            doc(db, "users", userCredential.user.uid), 
            {
                username: usernameValue,
                email: emailValue,
                role: "user"
            }
        );
        form.reset();
    } catch (error) {
        if(error.code === "auth/email-already-in-use") {
            email.value = "";
            email.placeholder = "Этот email уже зарегистрирован";
        }
        if(error.code === "auth/invalid-email") {
            email.value = "";
            email.placeholder = "Неправильный email";
        }
    }
});
