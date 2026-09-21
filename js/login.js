import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";



const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");


loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const loginEmailValue = loginEmail.value;
    const loginPasswordValue = loginPassword.value;
    let hasError = false;

    if(loginPasswordValue === "") {
        loginPassword.value = "";
        loginPassword.placeholder = "Пароль должен быть";
        hasError = true;
    }

    if(loginEmailValue === "") {
        loginEmail.value = "";
        loginEmail.placeholder = "Введите email";
        hasError = true;
    } else if (!loginEmail.checkValidity()) {
            loginEmail.value = "";
            loginEmail.placeholder = "Введите корректный email";
            hasError = true;
        }   

    if(hasError) {
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            loginEmailValue,
            loginPasswordValue
        )
        console.log("Вход успешен");
        window.location.href = "./profile.html";
    } catch (error) {
        if(error.code === "auth/invalid-email") {
            loginEmail.value = "";
            loginEmail.placeholder = "Неправильный email";
        } else  if(error.code === "auth/invalid-credential") {
                    loginEmail.value = "";
                    loginPassword.value = "";
                    loginEmail.placeholder = "Неправильный email";
                    loginPassword.placeholder = "Неправильный пароль";
                }
    }

})

resetPasswordBtn.addEventListener("click", async () => {
    const emailValue = loginEmail.value;

    if (emailValue === "" || !loginEmail.checkValidity()) {
        loginEmail.value = "";
        loginEmail.placeholder = "Введите email для восстановления";
        return;
    }

    try {
        await sendPasswordResetEmail(auth, emailValue);
        loginEmail.placeholder = "Письмо отправлено на почту";
    } catch (error) {
        loginEmail.placeholder = "Не удалось отправить письмо";
    }
})