document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      {
        id: 1,
        name: "Coffee Robusta",
        image: "1.jpg",
        price: 25000,
      },
      {
        id: 2,
        name: "Coffee Arabica",
        image: "1.jpg",
        price: 30000,
      },
    ],
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,
    add(product) {
      // cek apakah product sudah ada di cart
      const cartItem = this.items.find((item) => item.id === product.id);

      // jika belum ada
      if (!cartItem) {
        this.items.push({ ...product, quantity: 1, total: product.price });
        this.quantity++;
        this.total += product.price;
      } else {
        this.items = this.items.map((item) => {
          if (item.id !== product.id) {
            return item;
          } else {
            // jika barang sudah ada
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
      console.log(this.total);
    },
    remove(id) {
      // cari data yang akan dihapus
      const item = this.items.find((item) => item.id === id);
      //   jika lebih dari 1
      if (item.quantity > 1) {
        this.items = this.items.map((item) => {
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (item.quantity === 1) {
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= item.price;
      }
    },
  });
});

// konveris ke rupiah
const rupiah = (price) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

// button hidden
const checkoutButton = document.querySelector(".checkout-button");
const form = document.querySelector("#checkoutForm");

// form validation
checkoutButton.disabled = true;

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }
  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim data ketika tombol add to cart di klik
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  console.log(objData);
  // const message = formatMessage(objData);
  // window.open(
  //   `http://wa.me/6282233505516?text=${encodeURIComponent(message)}`,
  //   "_blank"
  // );

  // // minta transaksi token ke snap
  try {
    const response = await fetch("php/orderSnap.php", {
      method: "POST",
      body: data,
    });
    const token = await response.text();
    console.log(token);

    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// format message WA
const formatMessage = (obj) => {
  return `Data Customer
  Nama: ${obj.name}
  Email: ${obj.email}
  No. HP: ${obj.phone}
Data Pesanan: 
${JSON.parse(obj.items).map(
  (item) => `${item.name} (${item.quantity} x ${rupiah(item.total)}) \n`
)}
Total: ${rupiah(obj.total)}`;
};
