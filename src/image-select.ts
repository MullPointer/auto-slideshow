import { isValidImgURL } from "./slide-data.js";


const imgSelectDialog = document.getElementById('image-select') as HTMLDialogElement;
const imgSelectURL = document.getElementById('image-select-URL') as HTMLInputElement;
const imgSelectURLErrorEl = document.getElementById('image-select-URL-error') as HTMLElement;

let onSelectionCallback: (selectedURL:string) => void;


export function openImgSelectDialog(initialURL:string, onSelection: (selectedURL:string) => void) {
    onSelectionCallback = onSelection;
    imgSelectURL.value = initialURL;
    setImgSelectError('');
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
      const url = imgSelectURL.value;
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