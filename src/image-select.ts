/*
 * auto-slideshow
 * Copyright (C) 2024  R Bunch
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { isValidImgURL } from "./slide-data.js";


const imgSelectDialog = document.getElementById('image-select')! as HTMLDialogElement;
const imgSelectDialogForm = document.querySelector('#image-select form')! as HTMLFormElement;
const imgSelectGallery = document.getElementById('image-select-gallery')! as HTMLFieldSetElement;
const imgSelectURLErrorEl = document.getElementById('image-select-URL-error')! as HTMLElement;
const imgSelectCreditEl = document.getElementById('image-select-credit')! as HTMLElement;
const imgGalleryURL = 'images/image-index.json';
let imgGalleryRecords:[]|null = null;

(async () => { //initialization
  const response = await fetch(imgGalleryURL);
  if (response.ok) {
    imgGalleryRecords = await response.json();
  }
  else {
    console.error('Fetching image gallery failed with response: ', response);
  }
})();

let onSelectionCallback: (((selectedURL:string) => void) | null) = null;


export function openImgSelectDialog(initialURL:string, onSelection: (selectedURL:string) => void) {
    onSelectionCallback = onSelection;

    imgSelectGallery.innerHTML = ''; //clear existing children
    setImgCredit(null);

    if (imgGalleryRecords) {
      for (const galRecord of imgGalleryRecords) {
        const inputEl = document.createElement('input');
        const imgEl = document.createElement('img');
        const labelEl = document.createElement('label');
        labelEl.className = imgSelectGallery.dataset.classForLabel || '';
        inputEl.type = 'radio';
        inputEl.name = 'imageGallerySelect';
        inputEl.value = galRecord['URL'];
        inputEl.className = 'sr-only';
        imgEl.title = galRecord['Creator'] + '\n' + galRecord['Original Link'];
        imgEl.src = galRecord['Thumbnail'];
        imgEl.alt = galRecord['Alt'];
        imgEl.className = imgSelectGallery.dataset.classForImg || '';
        labelEl.appendChild(inputEl);
        labelEl.appendChild(imgEl);
        imgSelectGallery.appendChild(labelEl);
        
        if (galRecord['URL'] === initialURL) {
          inputEl.checked = true;
          setImgCredit(galRecord['URL']);
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

function setImgCredit(imgURL: string | null) {
  let galRecord = null;
  if (imgGalleryRecords) {
    galRecord = imgGalleryRecords.find((r) => r['URL'] === imgURL);
  }
  
  if (galRecord) {
    imgSelectCreditEl.classList.remove('hidden');
    imgSelectCreditEl.innerHTML = `Selected image by <a href="${galRecord['Original Link']}" target='_blank' class='underline'>${galRecord['Creator']}</a>`
  }
  else
  {
    imgSelectCreditEl.classList.add('hidden');
    imgSelectCreditEl.innerHTML = '';
  }
}



document.getElementById('image-select')!.addEventListener('click', (
  event: MouseEvent
  ) => {
  const target = event.target as HTMLDialogElement;
  switch(target.dataset.ctrl) {
    case 'ok':
      const url = imgSelectDialogForm.imageGallerySelect.value;
      if (isValidImgURL(url)) {
        if (onSelectionCallback) {
          onSelectionCallback(url);
          onSelectionCallback = null;
        }
        imgSelectDialog.close();
      }
      else {
        setImgSelectError('Image link not valid.');
      };
      break;
    case 'cancel':
      imgSelectDialog.close();
      break;
  }
});

document.getElementById('image-select')!.addEventListener('change', () => {
  setImgCredit(imgSelectDialogForm.imageGallerySelect.value);
});