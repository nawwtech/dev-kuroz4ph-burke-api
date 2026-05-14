// public/assets/js/app.js

const searchInput =
  document.getElementById("searchInput")

searchInput.addEventListener("input", () => {

  const value =
    searchInput.value.toLowerCase()

  document
    .querySelectorAll(".api-card")
    .forEach(card => {

      const text =
        card.innerText.toLowerCase()

      card.style.display =
        text.includes(value)
        ? "block"
        : "none"

    })

})