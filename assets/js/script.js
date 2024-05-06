const products = [
    {
        sku: "54312",
        name: "Wasser",
        category: "Getränke",
        container: "Kasten",
    },
    {
        sku: "12345",
        name: "Apfel",
        category: "Obst",
        container: "Schale",
    },
    {
        sku: "67890",
        name: "Karotten",
        category: "Gemüse",
        container: "Bund",
    },
    {
        sku: "78901",
        name: "Schokolade",
        category: "Süßigkeiten",
        container: "Stück",
    },
    {
        sku: "13579",
        name: "Orangensaft",
        category: "Getränke",
        container: "Flasche",
    },
    {
        sku: "11223",
        name: "Baguette",
        category: "Backwaren",
        container: "Stück",
    },
    {
        sku: "99876",
        name: "Limonade",
        category: "Getränke",
        container: "Kasten",
    },
    {
        sku: "54321",
        name: "Lauchzwiebeln",
        category: "Gemüse",
        container: "Bund",
    },
    {
        sku: "11111",
        name: "Gummibärchen",
        category: "Süßigkeiten",
        container: "Stück",
    },
    {
        sku: "22222",
        name: "Croissant",
        category: "Backwaren",
        container: "Stück",
    },
    {
        sku: "33333",
        name: "Apfelsaft",
        category: "Getränke",
        container: "Flasche",
    },
    {
        sku: "55555",
        name: "Birne",
        category: "Obst",
        container: "Schale",
    },
    {
        sku: "32123",
        name: "Vollkornbrot",
        category: "Backwaren",
        container: "Stück",
    },
    {
        sku: "55554",
        name: "Radieschen",
        category: "Gemüse",
        container: "Bund",
    },
];

// ===============================================================
//                             utils
// ===============================================================

const getUniqueValues = (productsArray, key) => {
    return Array.from(
        productsArray.reduce((set, product) => set.add(product[key]), new Set())
    );
};

const removeOptions = (selectElement) => {
    selectElement.innerHTML = "";
};

const addDefaultOptionToSelect = (selectElement, innerText) => {
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.innerText = innerText;

    selectElement.insertBefore(defaultOption, selectElement.firstChild);
};

const createOption = (text) => {
    const option = document.createElement("option");
    option.value = text;
    option.id = text;
    option.innerText = text;
    return option;
};

const compareContainer = (currentContainer, container) => {
    return JSON.stringify(currentContainer) === JSON.stringify(container);
};

// ====================================================
//   Funktion erwartet ein Array das String-Werte oder Objects
//   enthält, um Option-Elemente zu generieren. Für
//   Objects wird das entsprechende Key erwartet.
// ====================================================
const createOptionsFromArray = (optionContentArray, key = null) => {
    const docFrag = document.createDocumentFragment();

    optionContentArray.forEach((element) => {
        if (key) element = element[key];
        const option = createOption(element);

        docFrag.appendChild(option);
    });

    return docFrag;
};

const addOptionsToSelect = (selectElement, options) => {
    selectElement.appendChild(options);
};
// =============================================================
//   optionContent kann entweder ein String sein
//   oder ein Array, das String-Werte oder Objects
//   enthält. So kann die Funktion an mehreren Stellen
//   für ein UI-Update aufgerufen werden.
// =============================================================
const updateFormSelect = (
    optionContent,
    selectElement,
    defaultOptionText,
    key
) => {
    if (selectElement.hasChildNodes()) removeOptions(selectElement);

    if (!Array.isArray(optionContent)) {
        const option = createOption(optionContent);
        addOptionsToSelect(selectElement, option);
        addDefaultOptionToSelect(selectElement, defaultOptionText);
    } else {
        const options = createOptionsFromArray(optionContent, key);
        addOptionsToSelect(selectElement, options);
        addDefaultOptionToSelect(selectElement, defaultOptionText);
    }
};

// ===============================================
//   Initial Auswahl der Produktkategorien
//   (basierend auf dem Produkt-Array):
// ===============================================

const productSelectForm = document.querySelector("form");
const categorySelect = document.getElementById("categorySelect");
const message = document.getElementById("message");
const categories = getUniqueValues(products, "category");

updateFormSelect(categories, categorySelect, "Kategorien...");
const productsByCategory = Object.groupBy(
    [...products],
    ({ category }) => category
);
const productsByName = Object.groupBy([...products], ({ name }) => name);

// ========================================================
//   Erzeugen von weiteren Formular Elementen
// ========================================================

const productNameSelect = document.createElement("select");
const productContainerSelect = document.createElement("select");
addDefaultOptionToSelect(productContainerSelect, "Verpackungseinheit...");
const productAmountInput = document.createElement("input");
productAmountInput.type = "number";
productAmountInput.placeholder = "Menge...";
const containerOption = document.createElement("option");
const submitButton = document.createElement("input");
submitButton.type = "submit";
submitButton.value = "In den Warenkob";
const cartContainer = document.getElementById("cartContainer");
const removeAllButton = document.createElement("button");
removeAllButton.innerText = "Alle entfernen";

// ========================================================
//   Formular um weitere Felder erweitern:
//   Dynamisches Aktualisieren von Selects
//   auf Basis des Produkt-Array nach Kategorie-Input
//   und FormData-Objekt mit Set aus Formular-Daten definieren
// ========================================================
const formData = new FormData();
const cartArray = [];

const resetFormData = () => {
    const currentFormData = Object.fromEntries(formData);

    for (value in currentFormData) {
        formData.delete(value);
    }
};

function handleCategorySelect() {
    const selectedCategory = this.value;

    resetFormData();

    productAmountInput.value = "";

    formData.set("category", selectedCategory);
    message.innerText = "";

    const products = productsByCategory[selectedCategory];

    productSelectForm.append(
        productNameSelect,
        productContainerSelect,
        productAmountInput,
        submitButton
    );

    updateFormSelect(products, productNameSelect, "Produkt...", "name");

    productAmountInput.disabled = true;
    productContainerSelect.disabled = true;
    productContainerSelect.firstChild.selected = true;
}

let currentContainer;

function handleProductSelect() {
    const selectedProduct = this.value;
    formData.set("name", selectedProduct);

    const [product] = productsByName[selectedProduct];
    const { container } = product;

    productAmountInput.disabled = false;
    productContainerSelect.disabled = false;
    if (!compareContainer(currentContainer, container)) {
        currentContainer = container;
        updateFormSelect(
            container,
            productContainerSelect,
            "Verpackungseinheit..."
        );
    }
}

function handleContainerSelect() {
    const container = this.value;

    formData.set("container", container);
    message.innerText = "";
}

function handleAmountInput() {
    const amount = Number(this.value);

    if (amount <= 0 || !Number.isInteger(amount)) {
        formData.delete("amount");
        message.innerText = "Bitte eine gültige Menge eingeben (z.B. 3).";
        return;
    }
    formData.set("amount", amount);
    message.innerText = "";
}

function handleRemoveItem() {
    const productIndex = Number(this.value);

    cartArray.splice(productIndex, 1);

    renderCartItems(cartArray);
}

function handleResetCart() {
    cartArray.length = 0;
    cartContainer.innerHTML = "";
    renderCartItems(cartArray);
}

// =========================================
//   Warenkorb aktualisieren und ausgeben
// =========================================

function renderCartItems(cartArray) {
    cartContainer.innerHTML = "";
    cartArray.forEach((item, index) => {
        const cartDisplay = document.createElement("div");
        const displayCategory = document.createElement("span");
        const displayProduct = document.createElement("span");
        const displayContainer = document.createElement("span");
        const displayAmount = document.createElement("span");
        const removeButton = document.createElement("button");
        removeButton.value = index;
        removeButton.innerText = "Entfernen";

        displayCategory.innerText = `Kategorie: "${item.category}" | `;
        displayProduct.innerText = `Produkt: "${item.name}" | `;
        displayContainer.innerText = `Verpackungseinheit: "${item.container}" | `;
        displayAmount.innerText = `Menge: ${item.amount} | `;

        removeButton.addEventListener("click", handleRemoveItem);
        removeAllButton.addEventListener("click", handleResetCart);
        cartDisplay.append(
            displayCategory,
            displayProduct,
            displayContainer,
            displayAmount,
            removeButton
        );
        cartContainer.appendChild(cartDisplay);
    });
    if (cartContainer.children.length >= 1) {
        cartContainer.appendChild(removeAllButton);
    }
}

const handleProductSubmit = (e) => {
    e.preventDefault();

    const name = formData.get("name");
    const container = formData.get("container");
    const amount = Number(formData.get("amount"));

    if (!name || !amount || !container) {
        message.innerText = "Bitte alle Felder ausfüllen.";
        return;
    }

    const selectedProduct = Object.fromEntries(formData);

    const foundProductIndex = cartArray.findIndex(
        (product) => product.name === name
    );
    if (foundProductIndex === -1) {
        cartArray.push(selectedProduct);
        renderCartItems(cartArray);
        console.log(cartArray);
        return;
    }

    cartArray[foundProductIndex].amount =
        Number(cartArray[foundProductIndex].amount) + amount;
    renderCartItems(cartArray);
    console.log(cartArray);
};
categorySelect.addEventListener("change", handleCategorySelect);
productNameSelect.addEventListener("change", handleProductSelect);
productContainerSelect.addEventListener("change", handleContainerSelect);
productAmountInput.addEventListener("input", handleAmountInput);
productSelectForm.addEventListener("submit", handleProductSubmit);
