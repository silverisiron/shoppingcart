document.addEventListener("DOMContentLoaded", async function () {
  const productInfoContainer = document.getElementById("product-info");
  const totalPriceElement = document.getElementById("total-price");
  const loadData = async function () {
    try {
      const productsResponse = await fetch("./../products.json");
      const products = await productsResponse.json();
      const selectedProducts = JSON.parse(localStorage.getItem("selectedProducts"));
      if (selectedProducts) {
        displayCartItems(selectedProducts, products);
      }
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const displayCartItems = (cartItems) => {
    let totalAmount = 0;
    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item) => {
        const itemPrice = parseInt(item.price.replace(/[^0-9]/g, '')) * item.quantity;
        totalAmount += itemPrice;
        const productDiv = document.createElement("div");
        productDiv.classList.add("product-item");
        productDiv.innerHTML = `
          <p>${item.title} x${item.quantity} - ₩${itemPrice.toLocaleString()}</p>
        `;
        productInfoContainer.appendChild(productDiv);
      });
      totalPriceElement.querySelector("strong").textContent = `총 가격: ₩${totalAmount.toLocaleString()}`;
    }
  };

  await loadData();
  document.querySelector(".btn").addEventListener("click", function () {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const card = document.getElementById("card").value;
    const exp = document.getElementById("exp").value;
    const cvv = document.getElementById("cvv").value;
    const address = document.getElementById("address").value;
    const detailAddress = document.getElementById("detail-address").value;
    const addressCode = document.getElementById("address-code").value;
    if (!name || !email || !card || !exp || !cvv || !address || !addressCode) {
      alert("모든 결제 정보를 입력해주세요.");
      return;
    }
    const paymentInfo = {
      name,
      email,
      card,
      exp,
      cvv,
      address,
      detailAddress,
      addressCode,
      cart: cartItems,
    };
    console.log("결제 정보:", paymentInfo);
    alert("결제가 완료되었습니다.");
    window.location.href = "./../index.html";
  });
});
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