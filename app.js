// ============================ 데이터 관리 ============================
// 데이터 불러오기
const loadData = async function () {
  let resArr = await Promise.all([
    fetch("./loginUser.json"),
    fetch("./products.json"),
  ]);
  let objArr = await Promise.all(resArr.map((res) => res.json()));
  console.log(objArr);
  const loginUser = objArr[0];
  const products = objArr[1];
  let res3 = await fetch(`./${loginUser["user_id"]}Baskets.json`);
  let baskets = await res3.json();
  console.log(baskets);
  // ProductManager에 데이터 전달
  productManager.setProducts(products);
  // UserManager에 데이터 전달
  userManager.setUser(loginUser);
  // ShoppingCart에 데이터 전달
  shoppingCart.setCart(baskets.baskets);
};
loadData();
// ============================ 데이터 설정 ============================
// products 설정
class ProductManager {
  constructor() {
    this.products = [];
  }
  setProducts(products) {
    this.products = products.map(
      item =>
        new Product(
          item.key,
          item.name,
          `₩${item.price}`,
          `./img/${item.image}`
        )
    );
    this.displayProducts(this.products);
  }
  // 상품 표시
  displayProducts(products) {
    const productContainer = document.getElementById("product-container");
    productContainer.innerHTML = "";
    products.forEach(product => {
      const productDiv = this.createProductElement(product);
      productContainer.appendChild(productDiv);
    });
  }
  // HTML 생성
  createProductElement(product) {
    // div
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");
    // img
    const productImg = document.createElement("img");
    productImg.src = product.image;
    productImg.alt = product.name;
    // form
    const form = document.createElement("form");
    form.classList.add("basketForm");
    // apply
    const productContainerDiv = this.createProductContainer(product);
    form.appendChild(productContainerDiv);
    productDiv.appendChild(productImg);
    productDiv.appendChild(form);
    // 상세 페이지 이벤트
    const productName = productDiv.querySelector(".product-name");
    productName.addEventListener("click", () => {
      const productUrl = `./shop/productDetail.html?&id=${encodeURIComponent(
        product.id
      )}`;
      window.location.href = productUrl;
    });
    return productDiv;
  }
  // 상품 컨테이너 설정
  createProductContainer(product) {
    const productContainerDiv = document.createElement("div");
    productContainerDiv.classList.add("productContainer");
    // 컨테이너 내 HTML 요소
    const elements = [
      { tag: "h2", className: "product-name", textContent: product.name },
      { tag: "p", textContent: product.price },
      {
        tag: "div",
        className: "buttonContainer",
        children: this.createButtonContainer(product),
      },
    ];
    // 컨테이너 내 HTML 생성
    elements.forEach((element) => {
      const el = document.createElement(element.tag);
      if (element.className) el.classList.add(element.className);
      if (element.textContent) el.textContent = element.textContent;
      if (element.children)
        element.children.forEach((child) => el.appendChild(child));
      productContainerDiv.appendChild(el);
    });
    return productContainerDiv;
  }
  // 버튼 컨테이너
  createButtonContainer(product) {
    return [
      this.createQuantitySelect(),
      this.createHiddenInput("title", product.name),
      this.createHiddenInput("price", product.price),
      this.createCartButton(product),
      this.createBuyButton(product),
    ];
  }
  // 수량 인풋 설정
  createQuantitySelect() {
    const select = document.createElement("select");
    select.classList.add("quantity");
    for (let i = 1; i <= 20; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      select.appendChild(option);
    }
    return select;
  }
  // 상품 정보 인풋 설정
  createHiddenInput(name, value) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.className = name;
    input.value = value;
    return input;
  }
  // 장바구니 버튼 설정
  createCartButton(product) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("buy-btn", "add-to-cart");
    button.textContent = "장바구니";
    button.addEventListener("click", () => {
      const quantitySelect = button.closest("form").querySelector(".quantity");
      const quantity = parseInt(quantitySelect.value, 10);
      shoppingCart.addItem(product, quantity);
      alertBox.showAlert();
    });
    return button;
  }
  // 구매하기 버튼 설정
  createBuyButton(product) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("buy-btn");
    button.textContent = "구매하기";
    button.addEventListener("click", () => {
      const quantitySelect = button.closest("form").querySelector(".quantity");
      const quantity = parseInt(quantitySelect.value, 10);
      shoppingCart.addItem(product, quantity);
      purchaseForm.submitForm();
    });
    return button;
  }
}
const productManager = new ProductManager();
// user 설정
class UserManager {
  constructor() {
    this.user = null;
  }
  // 유저 데이터 설정
  setUser(userData) {
    this.user = userData;
    this.displayUserProfile();
  }
  // 유저 프로필 표시
  displayUserProfile() {
    const userProfile = document.getElementById("user-profile");
    if (this.user) {
      userProfile.textContent = this.user.name;
    }else{
      userProfile.textContent = "로그인"
    }
  }
}
const userManager = new UserManager();
// ============================ 장바구니 및 결제 관리 ============================
// 상품 객체
class Product {
  constructor(id, name, price, image) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
  }
}
// 장바구니 객체
class CartItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }
}
// 장바구니 설정
class ShoppingCart {
  constructor() {
    this.cart = [];
  }
  setCart(baskets) {
    baskets.forEach((basket) => {
      const product = new Product(
        basket.num,
        basket.title,
        `₩${basket.price}`,
        `./img/${basket.title}.jpg`
      );
      this.cart.push(new CartItem(product, basket.cnt));
    });
    this.updateCartUI();
  }
  // 장바구니에 상품 추가 함수
  addItemToBasket(basket) {
    const product = new Product(
      basket.num,
      basket.title,
      `₩${basket.price}`,
      `./img/${basket.title}.jpg`
    );
    this.addItem(product, basket.cnt);
  }
  // 상품 추가
  addItem(product, quantity) {
    const existingItem = this.cart.find(
      (item) => item.product.name === product.name
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push(new CartItem(product, quantity));
    }
    this.updateCartUI();
    this.updateLocalStorage();
  }
  // 상품 제거
  removeItem(index) {
    if (this.cart[index].quantity > 1) {
      this.cart[index].quantity -= 1;
    } else {
      this.cart.splice(index, 1);
    }
    this.updateCartUI();
    this.updateLocalStorage();
  }
  // 장바구니 업데이트
  updateCartUI() {
    const cartContainer = document.getElementById("cart-container");
    cartContainer.innerHTML = "";
    this.cart.forEach((item, index) => {
      // div
      const cartItemDiv = document.createElement("div");
      cartItemDiv.classList.add("cart-item");
      // p
      const itemInfo = document.createElement("p");
      const itemPrice =
        parseInt(item.product.price.replace(/[^\d]/g, ""), 10) * item.quantity;
      itemInfo.textContent = `${item.product.name} x${item.quantity} - ₩${itemPrice}`;
      // button
      const delButton = document.createElement("button");
      delButton.classList.add("del-btn");
      delButton.textContent = "삭제";
      delButton.onclick = () => shoppingCart.removeItem(index);

      cartItemDiv.appendChild(itemInfo);
      cartItemDiv.appendChild(delButton);
      cartContainer.appendChild(cartItemDiv);
    });
    this.updateTotalPrice();
  }
  // 합계 계산
  updateTotalPrice() {
    const totalPrice = this.cart.reduce((total, item) => {
      return (
        total +
        parseInt(item.product.price.replace(/[^\d]/g, ""), 10) * item.quantity
      );
    }, 0);
    document.getElementById(
      "total-price"
    ).textContent = `₩${totalPrice.toLocaleString()}`;
  }
  // 장바구니 상품 객체
  getSelectedProductsArray() {
    return this.cart.map((item) => ({
      title: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
  }
  // localstorage에 저장
  updateLocalStorage() {
    const cartData = this.cart.map(item => ({
      title: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
    localStorage.setItem('selectedProducts', JSON.stringify(cartData));
  }
}
// 결제하기 설정
class PurchaseForm {
  constructor() {
    this.form = document.getElementById("purchase-form");
  }
  submitForm() {
    const selectedProductsArray = shoppingCart.getSelectedProductsArray();
    localStorage.setItem("selectedProducts",JSON.stringify(selectedProductsArray));
    this.form.submit();
  }
}
const shoppingCart = new ShoppingCart();
const purchaseForm = new PurchaseForm();
// ============================ 기타 이벤트 관리 ============================
// 장바구니 Alert 이벤트
class AlertBox {
  constructor() {
    this.alertBox = document.querySelector(".alert-box");
  }
  showAlert() {
    if (!this.alertBox.classList.contains("show")) {
      this.alertBox.classList.add("show");
      setTimeout(() => {
        this.alertBox.classList.remove("show");
      }, 3000);
    }
  }
}
const alertBox = new AlertBox();
// 장바구니 확장 이벤트
document.querySelectorAll(".expand-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(".cart").classList.toggle("show");
  });
});
// 카테고리 버튼 이벤트
document.querySelector(".category-btn").addEventListener("click", () => {
  const category = document.getElementById("category");
  category.classList.toggle("show");
});
// 검색 이벤트
document.getElementById("search-form").addEventListener("submit", function (event) {
  event.preventDefault();
  const searchInput = document.getElementById("search-input").value.toLowerCase();
  const products = productManager.products;
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchInput)
  );
  productManager.displayProducts(filteredProducts);
});
// slide 설정
let slideIndex = 1;
function showSlides() {
  const slides = document.querySelector('.slide-wrapper');
  if (slideIndex == 1) {
    slides.style.marginLeft = '0%';
    slideIndex++;
  } else if (slideIndex == 2) {
    slides.style.marginLeft = '-100%';
    slideIndex++;
  } else if (slideIndex == 3) {
    slides.style.marginLeft = '-200%';
    slideIndex = 1;
  }
}
setInterval(showSlides, 5000);