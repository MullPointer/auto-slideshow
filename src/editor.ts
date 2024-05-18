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






import { SlideSection } from "./slide-section.js";
import { SlideProperties } from "./slide-data.js";
import { SerializableSlideshow } from "./serializer.js";
import { openImgSelectDialog } from "./image-select.js";
import { uploadXMLFile, downloadFile, makeFileName } from "./utility.js";



//INITIALIZATION

const slidesCol = document.getElementById('slides')!;
const slideSelector = 'slide-section';
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
document.addEventListener('click', (e:MouseEvent) => {
  const target = e.target as HTMLElement;
  if ( !target.closest('#main-menu') ) {
    closeMainMenu();
  }
});

document.getElementById('ctrl-slideshow-name')!.addEventListener('click', (e:MouseEvent) => {
  const nameButton = e.currentTarget as HTMLElement;
  const nameH = nameButton.querySelector('h1') as HTMLElement;
  const currentName = nameH.textContent!;

  console.log('changing name');
  
  const nameChanger = document.createElement('input');
  for (const c of nameH.classList) {
    nameChanger.classList.add(c);
  }
  nameChanger.value = currentName;

  nameH.classList.add('hidden');
  nameH.after(nameChanger);
  nameChanger.focus();
  nameChanger.select();

  nameChanger.addEventListener('blur', () => {
    nameH.textContent = nameChanger.value;
    nameH.classList.remove('hidden');
    nameChanger.remove();
  });

});

function getSlideshowName(): string {
  const nameH = document.querySelector('#ctrl-slideshow-name h1') as HTMLElement;
  return nameH.textContent!;
}

function setSlideshowName(name:string): void{
  const nameH = document.querySelector('#ctrl-slideshow-name h1') as HTMLElement;
  nameH.textContent = name;
}


document.getElementById('ctrl-watch')!.addEventListener('click', () => {
  const link = makeSlideshowLink();
  window.open(link, '_blank');
});

document.getElementById('ctrl-make-link')!.addEventListener('click', () => {
  const link = makeSlideshowLink();
  window.prompt('Shareable Link', link);
});


function makeSlideshowLink(): string {
  const xml = slideshowToXML();
  const urlPath = window.location.href.match(/^.+\//);
  if (urlPath) {
    return urlPath[0]
      + 'player.html?data=' 
      + encodeURIComponent(xml);
  }
  else {
    console.error('Could not find path from current page path', window.location.href);
    throw URIError('Could not find path from current page path');
  }
}

document.getElementById('ctrl-import')!.addEventListener('click', async () => {
  try {
    const input = await uploadXMLFile();
    console.log('loading file ', input);
    const ss = new SerializableSlideshow(input);
    clearSlides();
    ss.mapSlides((props:SlideProperties) => addSlide(null,props));
    if (ss.name) {
      setSlideshowName(ss.name);
    }
    else {
      setSlideshowName('Untitled');
    }
    
  }
  catch (e) {
    const message = (e instanceof Error)? e.message : e;
    console.error(`Failed to load file `, message);
    window.alert('Failed to load slideshow. Please confirm this is a valid slideshow file.');
  }
});


document.getElementById('ctrl-export')!.addEventListener('click', () => {
  const xml = slideshowToXML();
  const blob = new Blob([xml], {type:'application/xml'});
  const uri = URL.createObjectURL(blob);
  const fileName = makeFileName(getSlideshowName(),'slideshow');
  downloadFile(uri, fileName + '.xml');
  URL.revokeObjectURL(uri);
});

document.getElementById('ctrl-about')!.addEventListener('click', () => {
  const aboutDialog = document.getElementById('about')! as HTMLDialogElement;
  if (document.getElementById('license')!.textContent === '') {
    //asynchronously fetch license text if not already set
    setTimeout(async () => {
      const response = await fetch('LICENSE');
      if (response.ok) {
        const licenseText = await response.text();
        document.getElementById('license')!.textContent = licenseText;
      }
      else {
        console.error('Fetching license failed with response: ', response);
      }
    });
  }
  aboutDialog.showModal();
});

function slideshowToXML(): string {
  const ss = new SerializableSlideshow();
  ss.name = getSlideshowName();
  const slideEls = document.querySelectorAll(slideSelector);
  for (const slideNode of slideEls) {
    const slideEl = slideNode as SlideSection;
    ss.appendSlide(slideEl.slideProps);
  }
  return ss.serialize();
}







//SLIDE CONTROLS
//TODO - encapusulate more of these into slide-section component
document.getElementById('slides')!.addEventListener('click', (event: MouseEvent) => {
  const clickedButton = event.target as HTMLElement;
  const currentSlide = clickedButton.closest(slideSelector) as SlideSection;
  console.log('control event ', clickedButton.dataset.ctrl);
  let target: SlideSection | null;
  let nextSlide: SlideSection | null;
  switch(clickedButton.dataset.ctrl) {
    case 'img':
      openImgSelectDialog(currentSlide.imgURL, (selectedURL:string, altText:string) => {
          currentSlide.imgURL = selectedURL;
          currentSlide.imgAlt = 'Image - ' + altText;
        });
      break;
    case 'up':
      target = currentSlide.previousSlide();
      if (target) {
        slidesCol.insertBefore(currentSlide, target);
      }
      updateSlideNums();
      break;
    case 'down':
      nextSlide = currentSlide.nextSlide();
      target = nextSlide ? nextSlide.nextSlide() : null;
      slidesCol.insertBefore(currentSlide, target); 
      updateSlideNums();     
      break;
    case 'split':
      target = currentSlide.nextSlide();
      const currentText = currentSlide.slideText;
      const cursorPos = currentSlide.querySelector('textarea')!.selectionStart;
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
      updateSlideNums();
      break;
    case 'delete':
      currentSlide.remove();
      updateSlideNums();
      break;
  }
  
});

document.getElementById('ctrl-add-slide')!.addEventListener('click', () => {
  const newSlide = addSlide();
  const newTextArea = newSlide.querySelector('textarea') as HTMLTextAreaElement;
  newTextArea.focus();
});


function addSlide(slideBefore: (HTMLElement | null) = null, initial: SlideProperties = {text:"",imgURL:""}): SlideSection {
  const templateElement = document.querySelector('#template-slide-section') as HTMLTemplateElement;
  const slideTemplate = templateElement.content.children[0] as SlideSection;
  const newSlide = slideTemplate.cloneNode(true) as SlideSection;
  slideIDCounter++;
  newSlide.id = `slide-${slideIDCounter}`;
  slidesCol.insertBefore(newSlide, slideBefore);
  newSlide.slideProps = initial;
    //need to add element to DOM before it becomes custom element

  const slideLabel = newSlide.querySelector('h3') as HTMLHeadingElement;
  const labelID = `slide-label-${slideIDCounter}`;
  slideLabel.id = labelID;
  newSlide.setAttribute('aria-labelledby', labelID);
  updateSlideNums();

  const slideControls = newSlide.querySelectorAll('input, textarea, button');
  for(const control of slideControls ) {
    control.setAttribute('aria-describedby', labelID);
    //set describedby to the slide's label so that a screen reader user can tell which slide a control belongs to without backtracking to the region
  }

  return newSlide
}

function clearSlides() {
  const slideEls = document.querySelectorAll(slideSelector);
  for (const slideNode of slideEls) {
    slideNode.remove();
  }
}

function updateSlideNums() {
  const slideEls = document.querySelectorAll(slideSelector);
  let slideNum = 1;
  for (const slideNode of slideEls) {
    const slideLabel = slideNode.querySelector('h3') as HTMLHeadingElement;
    slideLabel.textContent = `Slide ${slideNum}`;
    slideNum++;
  }
}