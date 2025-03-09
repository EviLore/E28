const menu = {
    hotdog: 4.00,
    fries: 3.50,
    soda: 1.50,
    sauerkraut: 1.00
};

const cart = {};
Object.keys(menu).forEach(item => cart[item] = 0); // Initialize cart with 0 quantities

document.addEventListener("DOMContentLoaded", () => {
    displayMenu();
    document.getElementById("cart").textContent = "Your cart is empty.";
});

function displayMenu() {
    const menuList = document.getElementById("menu-list");
    Object.entries(menu).forEach(([item, price]) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${capitalize(item)} - $${price.toFixed(2)}`;
        menuList.appendChild(listItem);
    });
}

function addToCart() {
    const itemNameInput = document.getElementById("item-name").value.trim().toLowerCase();

    if (menu.hasOwnProperty(itemNameInput)) {
        cart[itemNameInput]++;
        updateCart();
    } else {
        alert("Invalid item. Please enter a valid menu item.");
    }

    document.getElementById("item-name").value = ""; // Clear input field
}

function updateCart() {
    const cartDiv = document.getElementById("cart");
    cartDiv.innerHTML = "";
    let hasItems = false;

    Object.entries(cart).forEach(([item, quantity]) => {
        if (quantity > 0) {
            hasItems = true;
            const cartItem = document.createElement("p");
            cartItem.textContent = `${capitalize(item)}: ${quantity}`;
            cartDiv.appendChild(cartItem);
        }
    });

    if (!hasItems) {
        cartDiv.textContent = "Your cart is empty.";
    }
}

function checkout() {
    let total = 0;
    let orderSummary = "Order Summary:\n";

    Object.entries(cart).forEach(([item, quantity]) => {
        if (quantity > 0) {
            const itemTotal = menu[item] * quantity;
            orderSummary += `${capitalize(item)} x${quantity} - $${itemTotal.toFixed(2)}\n`;
            total += itemTotal;
        }
    });

    if (total > 0) {
        orderSummary += `\nTotal: $${total.toFixed(2)}\n\nThank you for your order!`;
        alert(orderSummary);

        // Clear cart after checkout
        Object.keys(cart).forEach(item => cart[item] = 0);
        updateCart();
    } else {
        alert("Your cart is empty. Add items before checking out.");
    }
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}