

const slideTemplate = document.querySelector('.slide').cloneNode(true);



document.getElementById("ctrl-add-slide").addEventListener("click", () => {
  document.getElementById("slides").appendChild(slideTemplate.cloneNode(true));
});