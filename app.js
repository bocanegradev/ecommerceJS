//---------------------------------------------------Variables
// Obteniéndolas por medio de selectores de CSS
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const orderNowBtn = document.querySelector(".banner-btn-order");
let totalCartPrice;
//-------------------------------------------Carrito principal
let cart = [];
//--------------------------------------------Botones principales
let buttonsDOM = [];

//-----------------------------------------------------Clases
// Obteniendo los productos
// JSON - diccionarios
class Products {
    async getProducts() {
        try {
            let result = await fetch("products.json");
            let data = await result.json();
            // return data; -> Para ver la infomación by console
            let products = data.items;
            products = products.map(item => {
                const { title, price, } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}
// Mostrando productos
// Most of the methods
class UI {
    displayProducts(products) {
        let result = "";
        products.forEach(product => {
            result += `
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="Producto" class="product-img" />
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        Agregar al carrito
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>COP ${product.price}</h4>
            </article>`;
        });
        productsDOM.innerHTML = result;
    }

    getBagButtons() {
        const buttons = [...document.querySelectorAll(".bag-btn")];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "Producto agregado";
                button.disabled = true;
            }
            // else {
            button.addEventListener("click", event => {
                event.target.innerText = "Producto agregado";
                event.target.disabled = true;
                //-------- Obteniendo producto desde los productos
                // (...) Convierte lo que obtiene en un objeto (?)
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                // console.log(cartItem);
                //-------- Agregando producto al carrito
                // Toma lo que tiene el carrito, y agrega un ítem al array
                cart = [...cart, cartItem];
                // console.log(cart);
                //-------- Guardando carrito en local storage para acceder a él, incluso refrescando la página
                Storage.saveCart(cart);
                //-------- Cambiando valores carrito
                this.setCartValues(cart);
                //-------- Mostrando ítem en el carrito
                this.addCartItem(cartItem);
                //-------- Mostrando el carrito
                this.showCart();
            });
            // }
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        // Acumulando valores del precio total
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        totalCartPrice = parseFloat(tempTotal.toFixed(2));
        cartTotal.innerText = totalCartPrice;
        // cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        // console.log(cartTotal, cartItems);
    }
    // Agregando productos a la liste de ítems
    addCartItem(item) {
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src=${item.image} alt="Producto agregado" />
            <div>
                <h4>${item.title}</h4>
                <h5>COP ${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Eliminar</span>
            </div>
            <div>
                <!-- <i class="fas fa-chevron-up"></i> -->
                <i class="fas fa-plus-square" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fas fa-minus-square" data-id=${item.id}></i>
            </div>`;
        cartContent.appendChild(div);
        // console.log(cartContent);
    }
    // Mostrando el carrito
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
    }
    // set up application
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
        orderNowBtn.addEventListener("click", this.orderNow);
    }
    orderNow() {
        // console.log(cart[1].amount);
        let ms = `--Test message--%0A%0A`;
        cart.forEach(product => {
            ms += `* ${product.title} x ${product.amount} unidades -> *apx* ${product.price * product.amount}.%0A`;
        });
        ms += `%0ATOTAL APX*: ${totalCartPrice}`;
        alert(ms);
        ms = ms.split(" ").join("%20");
        window.open("https://api.whatsapp.com/send?phone=+573506854921&text=%20" + ms);
        // return console.log('https://api.whatsapp.com/send?phone=' + number + '&text=%20' + message)
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic() {
        // Se hace de esta forma (=>) para poder acceder a los métodos de la clase
        clearCartBtn.addEventListener("click", () => this.clearCart());
        // Cart functionality
        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            // Clase de los íconos para aumentar o disminuir cantidad de producto
            else if (event.target.classList.contains("fa-plus-square")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                // Actualizando el carrito en el almacenamiento local
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains("fa-minus-square")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    // Actualizando el carrito en el almacenamiento local
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }

    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    // Eliminar el producto del carrito
    removeItem(id) {
        //Actualizando el carrito
        cart = cart.filter(item => item.id !== id);
        // Actualizando los totales
        this.setCartValues(cart);
        Storage.saveCart(cart);
        // Actualizando los botones de productos agregados
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `
        <i class="fas fa-shopping-cart"></i>Agregar al carrito`;
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//Local storage
class Storage {
    // Guardando productos para la lista del carrito
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id);
    }
    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }
}

// Cargando los productos desde json
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // SetUPP application
    ui.setupAPP();
    // Obteniendo todos los productos del json
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});