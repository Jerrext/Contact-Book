// INIT

if (!localStorage.getItem("contacts")) {
  localStorage.setItem("contacts", JSON.stringify([]));
}

if (!localStorage.getItem("groups")) {
  localStorage.setItem("groups", JSON.stringify([]));
}

function getGroups() {
  return JSON.parse(localStorage.getItem("groups"));
}

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts"));
}

function setGroups(value) {
  localStorage.setItem("groups", JSON.stringify(value));
}

function setContacts(value) {
  localStorage.setItem("contacts", JSON.stringify(value));
}

// RENDER

document.addEventListener("DOMContentLoaded", () => {
  groupAccordionsRenderHandler();
  groupFieldsRenderHandler();
  groupOptionsRenderHandler();
});

// MASKS

const telephoneMask = IMask(document.getElementById("input-phone"), {
  mask: "+{7}(000)000-00-00",
});

const nameMask = IMask(document.getElementById("input-name"), {
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

const addContactFormWindow = new bootstrap.Offcanvas(addContact);
const addGroupFormWindow = new bootstrap.Offcanvas(addGroup);

const addGroupForm = document.getElementById("addGroupForm");
const addContactForm = document.getElementById("addContactForm");

addGroupForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (validation(this)) {
    const groups = getGroups();
    const contacts = getContacts();

    const formInputs = [...this.querySelectorAll(".form-item")];

    let newContactsData = contacts;
    const oldGroupData = new Map(groups.map((item) => [item.value, item.label]));
    const newGroupData = new Map();

    formInputs.forEach((input) => {
      newGroupData.set(input.dataset.targetDelete, input.value);
    });

    for (let key of oldGroupData.keys()) {
      if (!newGroupData.has(key)) {
        newContactsData = newContactsData.filter((item) => item.groupType !== key);
      }
    }

    const dataTransformed = Object.entries(Object.fromEntries(newGroupData)).map((item) => ({ value: item[0], label: item[1] }));

    setGroups(dataTransformed);
    setContacts(newContactsData);

    groupOptionsRenderHandler();
    groupFieldsRenderHandler();
    groupAccordionsRenderHandler();
    addGroupFormWindow.hide();
  }
});

document.getElementById("addGroupBtn").addEventListener("click", () => {
  const groupForm = document.getElementById("addGroupForm").firstElementChild;

  if (groupForm.firstElementChild && groupForm.firstElementChild.tagName === "P") {
    groupForm.innerHTML = "";
  }

  const randomId = Math.trunc(Math.random() * 100000);

  groupForm.insertAdjacentHTML(
    "beforeend",
    `
    <div class="mb-3">
      <div class="d-flex">
        <input type="text" class="form-control me-2 form-item" data-target-delete="${randomId}" name="group" placeholder="Введите название" />
        <button type="button" class="btn btn-outline-secondary p-2" data-delete="${randomId}">
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

addContactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (validation(this, nameMask, telephoneMask)) {
    const formData = new FormData(this);
    const contacts = getContacts();

    switch (this.dataset.action) {
      case "edit":
        contacts.forEach((contact, index) => {
          if (contact.id === this.dataset.current) {
            formData.append("id", contact.id);
            contacts.splice(index, 1, Object.fromEntries(formData));
          }
        });
        break;
      case "add":
        formData.append("id", Math.trunc(Math.random() * 100000).toString());
        contacts.push(Object.fromEntries(formData));
        break;
      default:
        return;
    }

    setContacts(contacts);
    contactListRender([formData.get("groupType"), this.dataset.prevType]);
    addContactFormWindow.hide();
  }
});

document.getElementById("addContactBtn").addEventListener("click", () => {
  addContactForm.dataset.action = "add";
  addContactForm.dataset.current = "null";
});

addGroupForm.addEventListener("click", function (e) {
  const buttonTarget = e.target.closest("[data-delete]");
  if (buttonTarget) {
    buttonTarget.parentElement.parentElement.remove();
  }
});

document.getElementById("addContact").addEventListener("hide.bs.offcanvas", function () {
  addContactForm.reset();

  const formInputs = [...document.querySelectorAll(".form-item")];

  formInputs.forEach((input) => clearError(input));
});

document.getElementById("addGroup").addEventListener("hide.bs.offcanvas", function () {
  groupFieldsRenderHandler();
});

document.addEventListener("input", (e) => {
  if (e.target.classList.contains("form-item")) {
    clearError(e.target);
  }
});

document.getElementById("contacts").addEventListener("click", function (e) {
  const contacts = getContacts();
  const buttonDeleteTarget = e.target.closest("[data-delete]");
  const buttonEditTarget = e.target.closest("[data-edit]");

  if (buttonDeleteTarget) {
    const conactTarget = buttonDeleteTarget.parentElement.parentElement;
    const currentGroupId = conactTarget.parentElement.parentElement.id.split("-")[1];
    conactTarget.remove();

    contacts.forEach((contact, index) => {
      if (contact.id == buttonDeleteTarget.dataset.delete) {
        contacts.splice(index, 1);
      }
    });

    setContacts(contacts);
    contactListRender([currentGroupId]);
  } else if (buttonEditTarget) {
    const inputs = [...addContactForm.querySelectorAll(".form-item")];
    const currentContact = contacts.find((contact) => contact.id == buttonEditTarget.dataset.edit);
    addContactFormWindow.show();
    addContactForm.dataset.action = "edit";
    addContactForm.dataset.current = buttonEditTarget.dataset.edit;
    addContactForm.dataset.prevType = currentContact.groupType;
    inputs[0].value = currentContact.fullName;
    nameMask.updateValue();
    inputs[1].value = currentContact.telephone;
    telephoneMask.updateValue();
    inputs[2].value = currentContact.groupType;
  }
});

// RENDER HANDLERS

function groupFieldsRenderHandler() {
  const groups = getGroups();
  const groupForm = document.getElementById("addGroupForm").firstElementChild;
  groupForm.innerHTML = "";

  if (groups.length) {
    groups.forEach((group) => {
      groupForm.insertAdjacentHTML(
        "beforeend",
        `
        <div class="mb-3">
          <div class="d-flex">
            <input type="text" class="form-control me-2 form-item" data-target-delete="${group.value}" name="group" placeholder="Введите название" value="${group.label}" />
            <button type="button" class="btn btn-outline-secondary p-2" data-delete="${group.value}">
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
  const groups = getGroups();
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
  const groups = getGroups();
  const contacts = getContacts();
  const contactsContainer = document.getElementById("contacts");
  contactsContainer.innerHTML = "";

  if (contacts.length) {
    groups.forEach((group) => {
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
              <div class="accordion-body"></div>
            </div>
          </div>
          `
      );
    });
    contactListRender(groups.map((group) => group.value));
  } else {
    contactsContainer.insertAdjacentHTML("beforeend", `<p class="text-muted empty-state-text">Список контактов пуст</p>`);
  }
}

function contactListRender(currentGroupValueArr) {
  const contacts = getContacts();

  currentGroupValueArr.forEach((item) => {
    const filteredContacts = contacts.filter((contact) => contact.groupType == item);
    const contactListHtml = filteredContacts.map((contact) => contactRender(contact)).join("");
    const currentNode = document.getElementById(`group-${item}`);
    currentNode.firstElementChild.innerHTML = "";

    if (filteredContacts.length) {
      currentNode.firstElementChild.insertAdjacentHTML("beforeend", contactListHtml);
    } else {
      currentNode.firstElementChild.insertAdjacentHTML("beforeend", "<p class='text-muted'>Список пуст</p");
    }
  });
}

function contactRender(contact) {
  return `
  <div class="contacts__group-item align-items-center">
    <div class="d-flex justify-content-between flex-fill me-3 flex-column flex-sm-row ">
      <h3 class="mb-0 text-muted fs-5 fw-normal mb-2 mb-sm-0">${contact.fullName}</h3>
      <a href="tel:+${contact.telephone.replace(/\D+/g, "")}" class="text-body fs-5 text-decoration-none">${contact.telephone}</a>
    </div>
    <div class="contacts__group-item-controls flex-column flex-sm-row">
      <button type="button" class="btn btn-outline-secondary p-2" data-edit="${contact.id}">
        <div class="icon-container">
          <i class="fa-regular fa-pen-to-square"></i>
        </div>
      </button>
      <button type="button" class="btn btn-outline-secondary p-2" data-delete="${contact.id}">
        <div class="icon-container">
          <i class="fa-solid fa-trash"></i>
        </div>
      </button>
    </div>
  </div>
  `;
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

function clearError(input) {
  input.parentElement.nextElementSibling.classList.add("d-none");
  input.parentElement.nextElementSibling.textContent = "";
}
