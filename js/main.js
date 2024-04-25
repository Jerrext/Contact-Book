if (!localStorage.getItem("contacts")) {
  localStorage.setItem("contacts", JSON.stringify([]));
}

if (!localStorage.getItem("groups")) {
  localStorage.setItem("groups", JSON.stringify([]));
}

const telephoneInput = document.getElementById("input-phone");
const nameInput = document.getElementById("input-name");

const telephoneMask = IMask(telephoneInput, {
  mask: "+{7}(000)000-00-00",
});

const nameMask = IMask(nameInput, {
  mask: "name#name#name",
  lazy: false,
  blocks: {
    name: {
      mask: /^[A-Za-zА-ЯЁа-яё-]+$/,
    },
  },
  definitions: {
    "#": /\s/,
  },
});

function validation(form, ...masks) {
  let result = true;

  function setError(input, errText) {
    input.nextElementSibling.classList.remove("d-none");
    input.nextElementSibling.textContent = errText;
    result = false;
  }

  [].forEach.call(form.querySelectorAll(".form-item"), (input, index) => {
    if (input.value.length === 0) {
      setError(input, "Поле не заполнено");
    } else if (masks[index]?.masked.isComplete !== undefined && !masks[index]?.masked.isComplete) {
      setError(input, "Введите валидные данные");
    }
  });

  return result;
}

document.getElementById("addContactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (validation(this, nameMask, telephoneMask)) {
    console.log(true);
  } else {
    console.log(false);
  }
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("form-item")) {
    e.target.nextElementSibling.classList.add("d-none");
    e.target.nextElementSibling.textContent = "";
  }
});

document.getElementById("addGroupForm").addEventListener("submit", (e) => {
  e.preventDefault();
});
