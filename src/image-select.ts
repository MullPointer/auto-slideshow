import { isValidImgURL } from "./slide-data.js";


const imgSelectDialog = document.getElementById('image-select') as HTMLDialogElement;
const imgSelectDialogForm = document.querySelector('#image-select form') as HTMLFormElement;
const imgSelectGallery = document.getElementById('image-select-gallery') as HTMLFieldSetElement;
const imgSelectURLErrorEl = document.getElementById('image-select-URL-error') as HTMLElement;
const imgGalleryURL = 'images/image-index.json';
let imgGalleryRecords = null;

(async () => { //initialization
  const response = await fetch(imgGalleryURL);
  if (response.ok) {
    imgGalleryRecords = await response.json();
  }
  else {
    console.error('Fetching image gallery failed with response: ', response);
  }
})();

let onSelectionCallback: (selectedURL:string) => void;


export function openImgSelectDialog(initialURL:string, onSelection: (selectedURL:string) => void) {
    onSelectionCallback = onSelection;

    imgSelectGallery.innerHTML = ''; //clear existing children

    if (imgGalleryRecords) {
      for (const galRecord of imgGalleryRecords) {
        console.log('Image gallery item', galRecord);
        const inputEl = document.createElement('input');
        const imgEl = document.createElement('img');
        const labelEl = document.createElement('label');
        labelEl.className = imgSelectGallery.dataset.classForLabel;
        inputEl.type = 'radio';
        inputEl.name = 'imageGallerySelect';
        inputEl.value = galRecord['URL'];
        inputEl.className = 'sr-only';
        imgEl.title = galRecord['Creator'] + '\n' + galRecord['Original Link'];
        imgEl.src = galRecord['URL'];
        imgEl.className = imgSelectGallery.dataset.classForImg;
        labelEl.appendChild(inputEl);
        labelEl.appendChild(imgEl);
        imgSelectGallery.appendChild(labelEl);

        if (galRecord['URL'] === initialURL) {
          inputEl.checked = true;
        }
      }

      setImgSelectError('');
    }
    else {
      setImgSelectError('Image gallery not loaded. Please try again.');
    }

    


    imgSelectDialog.showModal();
  };


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


document.getElementById('image-select').addEventListener('click', (
  event: PointerEvent & { target: HTMLDialogElement}
  ) => {
  
  switch(event.target.dataset.ctrl) {
    case 'ok':
      const url = imgSelectDialogForm.imageGallerySelect.value;
      if (isValidImgURL(url)) {
        onSelectionCallback(url);
        onSelectionCallback = null;
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