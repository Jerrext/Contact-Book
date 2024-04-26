// INIT

if (!localStorage.getItem("contacts")) {
  localStorage.setItem("contacts", JSON.stringify([]));
}

if (!localStorage.getItem("groups")) {
  localStorage.setItem("groups", JSON.stringify([]));
}

// RENDER

groupAccordionsRenderHandler();
// contactsRenderHandler();
groupFieldsRenderHandler();
groupOptionsRenderHandler();

// MASKS

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

// LISTENERS

document.getElementById("addGroupForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (validation(this) && this.querySelectorAll(".form-item").length) {
    // const groups = JSON.parse(localStorage.getItem("groups"));
    const formData = new FormData(this);
    const data = new Set();

    [...formData.values()].forEach((value, index) => {
      data.add({ value: index, label: value });
    });

    localStorage.setItem("groups", JSON.stringify([...data]));

    groupOptionsRenderHandler(); // !!!

    // const groups = JSON.parse(localStorage.getItem("groups"));
    // groups.push(formData);
    // addContactHandler(formData);
  }
});

document.getElementById("addGroupBtn").addEventListener("click", () => {
  const groupForm = document.getElementById("addGroupForm").firstElementChild;

  // let groupFieldsLength = localStorage.getItem("groups").length;

  // console.log(groupFieldsLength);

  if (groupForm.firstElementChild.tagName === "P") {
    groupForm.innerHTML = "";
  }

  groupForm.insertAdjacentHTML(
    "beforeend",
    `
    <div class="mb-3">
      <div class="d-flex">
        <input type="text" class="form-control me-2 form-item" name="group" placeholder="Введите название" />
        <button type="button" class="btn btn-outline-secondary p-2" data-delete="#">
          <div class="icon-container">
            <i class="fa-solid fa-trash"></i>
          </div>
        </button>
      </div>
      <p class="text-danger mb-0 d-none"></p>
    </div>
    `
  );
});

document.getElementById("addContactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  if (validation(this, nameMask, telephoneMask)) {
    const formData = Object.fromEntries(new FormData(this));
    const contacts = JSON.parse(localStorage.getItem("contacts"));
    contacts.push(formData);
    localStorage.setItem("contacts", JSON.stringify(contacts));
    groupAccordionsRenderHandler();
  }
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("form-item")) {
    e.target.parentElement.nextElementSibling.classList.add("d-none");
    e.target.parentElement.nextElementSibling.textContent = "";
  }
});

// RENDER HANDLERS

function groupFieldsRenderHandler() {
  const groups = JSON.parse(localStorage.getItem("groups"));
  const groupForm = document.getElementById("addGroupForm").firstElementChild;
  groupForm.innerHTML = "";

  if (groups.length) {
    groups.forEach((group) => {
      groupForm.insertAdjacentHTML(
        "beforeend",
        `
        <div class="mb-3">
          <div class="d-flex">
            <input type="text" class="form-control me-2 form-item" name="group" placeholder="Введите название" value="${group.label}" />
            <button type="button" class="btn btn-outline-secondary p-2" data-delete="#">
              <div class="icon-container">
                <i class="fa-solid fa-trash"></i>
              </div>
            </button>
          </div>
          <p class="text-danger mb-0 d-none"></p>
        </div>
        `
      );
    });
  } else {
    groupForm.insertAdjacentHTML("beforeend", `<p class="text-muted">Список групп пуст</p>`);
  }
}

function groupOptionsRenderHandler() {
  const groups = JSON.parse(localStorage.getItem("groups"));
  const select = document.getElementById("selectGroup");
  select.innerHTML = "";
  select.insertAdjacentHTML("beforeend", `<option value="" selected disabled hidden>Выберите группу</option>`);

  if (groups.length) {
    groups.forEach((group) => {
      select.insertAdjacentHTML("beforeend", `<option value="${group.value}">${group.label}</option>`);
    });
  } else {
    select.insertAdjacentHTML("beforeend", `<option value="empty" disabled class="text-align-center">Список пуст</option>`);
  }
}

function groupAccordionsRenderHandler() {
  const groups = JSON.parse(localStorage.getItem("groups"));
  const contacts = JSON.parse(localStorage.getItem("contacts"));
  const contactsContainer = document.getElementById("contacts");
  contactsContainer.innerHTML = "";

  if (groups.length) {
    groups.forEach((group) => {
      const filteredContacts = contacts.filter((contact) => contact.groupType == group.value);

      if (filteredContacts.length) {
        contactsContainer.insertAdjacentHTML(
          "beforeend",
          `
          <div class="contacts__accordion-item shadow">
            <h2 class="accordion-header">
              <button class="accordion-button collapsed fw-bold p-4 fs-5" type="button" data-bs-toggle="collapse" data-bs-target="#group-${group.value}" aria-expanded="true" aria-controls="group-${group.value}">
                ${group.label}
              </button>
            </h2>
            <div id="group-${group.value}" class="accordion-collapse collapse">
              <div class="accordion-body">
                ${filteredContacts
                  .map(
                    (contact) => `
                      <div class="contacts__group-item">
                        <h3 class="mb-0 text-muted fs-5 fw-normal">${contact.fullName}</h3>
                        <div class="contacts__group-item-right">
                          <a href="tel:+${contact.telephone.replace(/\D+/g, "")}" class="text-body fs-5 text-decoration-none">${contact.telephone}</a>
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
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
          `
        );
      }
    });
  } else {
    contactsContainer.insertAdjacentHTML("beforeend", `<p class="text-muted empty-state-text">Список контактов пуст</p>`);
  }
}

// VALIDATION

function validation(form, ...masks) {
  let result = true;

  function setError(prevSibling, errText) {
    prevSibling.nextElementSibling.classList.remove("d-none");
    prevSibling.nextElementSibling.textContent = errText;
    result = false;
  }

  [].forEach.call(form.querySelectorAll(".form-item"), (input, index) => {
    const maskIsComplete = masks[index]?.masked.isComplete;

    if (input.value.length === 0) {
      setError(input.parentElement, "Поле не заполнено");
    } else if (maskIsComplete !== undefined && !maskIsComplete) {
      setError(input.parentElement, "Введите валидные данные");
    }
  });

  return result;
}
