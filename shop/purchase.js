document.addEventListener("DOMContentLoaded", async function () {
  const productInfoContainer = document.getElementById("product-info");
  const totalPriceElement = document.getElementById("total-price");

  const loadData = async function () {
    try {
      let resArr = await Promise.all([
        fetch("./../loginUser.json"),
        fetch("./../products.json"),
      ]);
      let objArr = await Promise.all(resArr.map((res) => res.json()));
      const loginUser = objArr[0];
      const products = objArr[1];

      let res3 = await fetch(`./../${loginUser["user_id"]}Baskets.json`);
      let baskets = await res3.json();

      displayCartItems(baskets.baskets);
    } catch (error) {
      console.error("데이터를 불러오는 중 오류가 발생했습니다:", error);
    }
  };

  const displayCartItems = (cartItems) => {
    let totalAmount = 0;

    if (cartItems && cartItems.length > 0) {
      cartItems.forEach((item) => {
        const itemPrice = item.price * item.cnt;
        totalAmount += itemPrice;

        const productDiv = document.createElement("div");
        productDiv.classList.add("product-item");
        productDiv.innerHTML = `
          <p>${item.title} x${item.cnt} - ₩${itemPrice.toLocaleString()}</p>
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
