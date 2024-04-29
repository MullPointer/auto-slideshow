
import { SerializableSlideshow, SlideProperties } from "./serializer.js";

class SlideElement extends HTMLElement {
  protected _imgInput = this.querySelector('input[type=image]') as HTMLInputElement;
  private _imgURL = "";

  get slideText() {
    return this.querySelector('textarea').value;
  }
  set slideText(value) {
    this.querySelector('textarea').value = value;
  }

  get imgURL() {
    return this._imgURL;
  }
  set imgURL(value) {
    this._imgURL = value; //need to store separately as input element returns page URL if no src set
    this._imgInput.src = value;
  }

  get slideProps(): SlideProperties {
    return {
      text: this.slideText,
      imgURL: this.imgURL
    };
  }
  set slideProps(props:SlideProperties) {
    this.slideText = props.text;
    this.imgURL = props.imgURL;
  }

  nextSlide() : SlideElement {
    let checkNode = this.nextElementSibling ;
    while (checkNode instanceof HTMLElement && checkNode)
    {
      if (checkNode instanceof SlideElement) { 
        return checkNode;
      }
      else {
        checkNode = checkNode.nextElementSibling;
      }
    }
    return null;
  }

  previousSlide() : SlideElement {
    let checkNode = this.previousElementSibling;
    while (checkNode instanceof HTMLElement && checkNode)
    {
      if (checkNode instanceof SlideElement) {
        return checkNode;
      }
      else {
        checkNode = checkNode.previousElementSibling;
      }
    }
    return null;
  }

}




//INITIALIZATION

customElements.define("slide-section", SlideElement, { extends: "section" });

const slidesCol = document.getElementById('slides');
const slideSelector = 'section[is=slide-section]';
const slideTemplate = (()=>{
  const initSlide = document.querySelector(slideSelector) as HTMLElement;
  let template = initSlide.cloneNode(true) as SlideElement;
  template.classList.remove('invisible'); //template kept invisible so cannot be altered before load complete
  initSlide.remove(); //remove template
  return template;
})();
let slideIDCounter = 0;






//MAIN MENU


const mainMenu = document.getElementById('main-menu') as HTMLElement;
const mainMenuList = document.getElementById('main-menu-list') as HTMLElement;
const menuButton = document.getElementById('ctrl-menu') as HTMLElement;

function openMainMenu() {
  mainMenuList.ariaHidden = 'false';
  menuButton.ariaExpanded = 'true';
}

function closeMainMenu() {
  mainMenuList.ariaHidden = 'true';
  menuButton.ariaExpanded = 'false';
}

menuButton.addEventListener('click', () => {
  if (menuButton.ariaExpanded === 'true') {
    closeMainMenu();
  }
  else {
    openMainMenu();
  }
});

//close menu if press escape
mainMenu.addEventListener('keyup', (e:KeyboardEvent) => {
  if(menuButton.ariaExpanded === 'true' && e.key === 'Escape') {
    closeMainMenu();
  }
});

//close menu if click outside of nav
document.addEventListener('click', (
  e:PointerEvent & { target: HTMLElement}
  ) => {
  if ( !e.target.closest('#main-menu') ) {
    closeMainMenu();
  }
});

document.getElementById('ctrl-slideshow-name').addEventListener('click', () => {
});

document.getElementById('ctrl-make-link').addEventListener('click', () => {
});

document.getElementById('ctrl-import').addEventListener('click', () => {
  const input = window.prompt('input XML');
  const ss = new SerializableSlideshow();
  const errorMessage = ss.deserialize(input);
  if (errorMessage) {
    window.alert('Failed to import ' + errorMessage);
  }
  else {
    clearSlides();
    ss.mapSlides((props:SlideProperties) => addSlide(null,props));
  }
});

document.getElementById('ctrl-export').addEventListener('click', () => {
  const ss = new SerializableSlideshow();
  const slideEls = document.querySelectorAll(slideSelector);
  for (const slideNode of slideEls) {
    const slideEl = slideNode as SlideElement;
    ss.appendSlide(slideEl.slideProps);
  }
  const output = ss.serialize();
  window.prompt("result", output);
});







//SLIDE CONTROLS

document.getElementById('slides').addEventListener('click', (
  event: PointerEvent & { target: HTMLInputElement }
  ) => {
  const currentSlide = event.target.closest(slideSelector) as SlideElement;
  console.log('control event ',event.target.dataset.ctrl);
  let target: SlideElement;
  let nextSlide: SlideElement;
  switch(event.target.dataset.ctrl) {
    case 'img':
      openImgSelectDialog(currentSlide.id);
      break;
    case 'up':
      target = currentSlide.previousSlide();
      if (target) {
        slidesCol.insertBefore(currentSlide, target);
      }
      break;
    case 'down':
      nextSlide = currentSlide.nextSlide();
      target = nextSlide ? nextSlide.nextSlide() : null;
      slidesCol.insertBefore(currentSlide, target);      
      break;
    case 'split':
      target = currentSlide.nextSlide();
      const currentText = currentSlide.slideText;
      const cursorPos = currentSlide.querySelector('textarea').selectionStart;
      currentSlide.slideText = currentText.substring(0,cursorPos);
      const newText = currentText.substring(cursorPos);
      addSlide(target, {
        text:newText,
        imgURL:currentSlide.imgURL
        });
      break;
    case 'combine':
      target = currentSlide.previousSlide();
      if (target) {
        target.slideText += '\n' + currentSlide.slideText;
        currentSlide.remove();
      }
      break;
    case 'delete':
      currentSlide.remove();
      break;
  }
  
});

document.getElementById('ctrl-add-slide').addEventListener('click', () => {
  addSlide();
});



function addSlide(slideBefore: HTMLElement = null, initial: SlideProperties = {text:"",imgURL:""}) {
  const newSlide = slideTemplate.cloneNode(true) as SlideElement;
  newSlide.slideProps = initial;
  slideIDCounter++;
  newSlide.id = "slide-" + slideIDCounter;
  slidesCol.insertBefore(newSlide, slideBefore);
}

function clearSlides() {
  const slideEls = document.querySelectorAll(slideSelector);
  for (const slideNode of slideEls) {
    slideNode.remove();
  }
}



//IMAGE SELECTION

const imgSelectDialog = document.getElementById('image-select') as HTMLDialogElement;
const imgSelectURL = document.getElementById('image-select-URL') as HTMLInputElement;
const imgSelectURLErrorEl = document.getElementById('image-select-URL-error') as HTMLElement;

//TODO - these functions should maybe be methods added to the dialog
function setImgSelectError(errorMessage: string) {
  imgSelectURLErrorEl.innerText = errorMessage;
  if (errorMessage === '') {
    imgSelectURLErrorEl.classList.add('hidden');
  }
  else
  {
    imgSelectURLErrorEl.classList.remove('hidden');
  }
}

function openImgSelectDialog(slideID: string) {
  const targetSlide = document.getElementById(slideID) as SlideElement;
  imgSelectDialog.dataset.targetSlide = slideID;
  const imgURL = targetSlide.imgURL;
  imgSelectURL.value = targetSlide.imgURL;
  setImgSelectError('');
  imgSelectDialog.showModal();
};

//from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function isValidHttpUrl(s: string) {
  let url;
  
  try {
    url = new URL(s);
  } catch (_) {
    return false;  
  }

  return url.protocol === "http:" || url.protocol === "https:";
}


document.getElementById('image-select').addEventListener('click', (
  event: PointerEvent & { target: HTMLDialogElement}
  ) => {
  
  switch(event.target.dataset.ctrl) {
    case 'ok':
      const url = imgSelectURL.value;
      if (isValidHttpUrl(url)) {
        const targetSlide = document.getElementById(imgSelectDialog.dataset.targetSlide) as SlideElement;
        targetSlide.imgURL = url;
        imgSelectDialog.dataset.targetSlide = null;
        imgSelectDialog.close();
      }
      else {
        setImgSelectError('Image link not valid.');
      };
      break;
    case 'cancel':
      imgSelectDialog.dataset.targetSlide = null;
      imgSelectDialog.close();
      break;
  }
});