if (!localStorage.getItem("contacts")) {
  localStorage.setItem("contacts", JSON.stringify([]));
}

if (!localStorage.getItem("groups")) {
  localStorage.setItem("groups", JSON.stringify([]));
}

contactsRenderHandler();
groupFieldsRenderHandler();

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

function contactsRenderHandler() {
  const contacts = JSON.parse(localStorage.getItem("contacts"));

  contacts.forEach((contact) => addContactHandler(contact));
}

function groupFieldsRenderHandler() {
  const groups = JSON.parse(localStorage.getItem("groups"));
  const groupForm = document.getElementById("addGroupForm").firstElementChild;
  groupForm.innerHTML = "";

  if (groups.length) {
    groups.forEach((group) => {
      const { type, title } = group;

      groupForm.insertAdjacentHTML(
        "beforeend",
        `
        <div class="d-flex mb-3">
          <input type="text" class="form-control me-2" placeholder="Введите название" value="${title}" />
          <button type="button" class="btn btn-outline-secondary p-2" data-delete="#">
            <div class="icon-container">
              <i class="fa-solid fa-trash"></i>
            </div>
          </button>
        </div>
        `
      );
    });
  } else {
    groupForm.insertAdjacentHTML("beforeend", `<p class="text-muted">Список групп пуст</p>`);
  }
}

document.getElementById("addGroupBtn").addEventListener("click", () => {
  const groupForm = document.getElementById("addGroupForm").firstElementChild;

  if (groupForm.firstElementChild.tagName === "P") {
    groupForm.innerHTML = "";
  }

  groupForm.insertAdjacentHTML(
    "beforeend",
    `
    <div class="d-flex mb-3">
      <input type="text" class="form-control me-2" placeholder="Введите название" />
      <button type="button" class="btn btn-outline-secondary p-2" data-delete="#">
        <div class="icon-container">
          <i class="fa-solid fa-trash"></i>
        </div>
      </button>
    </div>
    `
  );
});

function addContactHandler(contact) {
  const { fullName, telephone, groupType } = contact;

  document.getElementById(`group-${groupType}`).insertAdjacentHTML(
    "beforeend",
    `
    <div class="accordion-body">
      <div class="contacts__group-item">
        <h3 class="mb-0 text-muted fs-5 fw-normal">${fullName}</h3>
        <div class="contacts__group-item-right">
          <a href="tel:+79114211471" class="text-body fs-5 text-decoration-none">${telephone}</a>
          <div class="contacts__group-item-controls">
            <button type="button" class="btn btn-outline-secondary p-2" data-edit="#">
              <div class="icon-container">
                <i class="fa-regular fa-pen-to-square"></i>
              </div>
            </button>
            <button type="button" class="btn btn-outline-secondary p-2" data-delete="#">
              <div class="icon-container">
                <i class="fa-solid fa-trash"></i>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
    `
  );
}

document.getElementById("addContactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (validation(this, nameMask, telephoneMask)) {
    const formData = Object.fromEntries(new FormData(this));
    const contacts = JSON.parse(localStorage.getItem("contacts"));
    contacts.push(formData);
    addContactHandler(formData);
    localStorage.setItem("contacts", JSON.stringify(contacts));
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
