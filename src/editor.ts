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


document.getElementById('ctrl-make-link')!.addEventListener('click', () => {
  const xml = slideshowToXML();
  const urlPath = window.location.href.match(/^.+\//);
  if (urlPath) {
    const link = urlPath[0]
      + 'player.html?data=' 
      + encodeURIComponent(xml);
    window.prompt('Shareable Link', link);
  }
  else {
    console.error('Could not find path from current page path', window.location.href);
  }
});

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
      openImgSelectDialog(currentSlide.imgURL, (selectedURL:string) => {
          currentSlide.imgURL = selectedURL;
        });
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
      break;
    case 'delete':
      currentSlide.remove();
      break;
  }
  
});

document.getElementById('ctrl-add-slide')!.addEventListener('click', () => {
  addSlide();
});


function addSlide(slideBefore: (HTMLElement | null) = null, initial: SlideProperties = {text:"",imgURL:""}) {
  const templateElement = document.querySelector('#template-slide-section') as HTMLTemplateElement;
  const slideTemplate = templateElement.content.children[0] as SlideSection;
  const newSlide = slideTemplate.cloneNode(true) as SlideSection;
  slideIDCounter++;
  newSlide.id = "slide-" + slideIDCounter;
  slidesCol.insertBefore(newSlide, slideBefore);
  newSlide.slideProps = initial;
    //need to add element to DOM before it becomes custom element
}

function clearSlides() {
  const slideEls = document.querySelectorAll(slideSelector);
  for (const slideNode of slideEls) {
    slideNode.remove();
  }
}
