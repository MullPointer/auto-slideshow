
class SlideElement extends HTMLElement {
  get slideText() {
    return this.querySelector('textarea').value;
  }
  set slideText(value) {
    this.querySelector('textarea').value = value;
  }

  get imgURL() {
    return this.dataset._imageURL;
  }
  set imgURL(value) {
    this.dataset._imageURL = value;
    const img = this.querySelector('input[type=image]') as HTMLInputElement;
      //TODO - something more efficient than querying for these each time
    img.src = value;
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

customElements.define("slide-section", SlideElement, { extends: "section" });

const slideSelector = 'section[is=slide-section]';
const slideTemplate = (()=>{
  const initSlide = document.querySelector(slideSelector) as HTMLElement;
  let template = initSlide.cloneNode(true) as SlideElement;
  template.classList.remove('invisible'); //template kept invisible so cannot be altered before load complete
  initSlide.remove(); //remove template
  return template;
})();
let slideIDCounter = 0;


function addSlide(slideBefore: HTMLElement = null, initial: {text: string, imageURL: string} = {text:"",imageURL:""}) {
  const slidesCol = document.getElementById('slides');
  const newSlide = slideTemplate.cloneNode(true) as SlideElement;
  newSlide.slideText = initial.text;
  slideIDCounter++;
  newSlide.id = "slide-" + slideIDCounter;
  newSlide.imgURL = initial.imageURL;
  slidesCol.insertBefore(newSlide, slideBefore);
}


document.getElementById('ctrl-add-slide').addEventListener('click', () => {
  addSlide();
});





document.getElementById('slides').addEventListener('click', (
  event: PointerEvent & { target: HTMLInputElement , currentTarget: HTMLInputElement }
  ) => {
  const slidesCol = event.currentTarget;
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
        imageURL:currentSlide.imgURL
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




//TODO - these functions should probably be methods added to the dialog
function setImgSelectError(errorMessage: string) {
  const imgSelectURLErrorEl = document.getElementById('image-select-URL-error') as HTMLElement;
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
  const imgSelectDialog = document.getElementById('image-select') as HTMLDialogElement;
  const imgSelectURL = document.getElementById('image-select-URL') as HTMLInputElement;
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
  const imgSelectDialog = event.currentTarget as HTMLDialogElement;
  const imgSelectURL = document.getElementById('image-select-URL') as HTMLInputElement;
  
  const slidesCol = document.getElementById('slides');
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