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

//-------------------------------------------Carrito principal
let cart = [];

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
        console.log(buttons);
    }
}
//Local storage
class Storage {
    // Guardando productos para la lista del carrito
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }
}

// Cargando los productos desde json
document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();
    const products = new Products();
    // Obteniendo todos los productos del json
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
    });
});