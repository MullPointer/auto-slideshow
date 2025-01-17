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




import { SlideProperties } from "./slide-data.js";
import { SerializableSlideshow } from "./serializer.js";
import { preloadImage } from "./utility.js";



const slideTimeoutIfNoText = 5000;
const slideLingerAfterSpeaking = 1000;

const params = new URLSearchParams(window.location.search);
const slides:SlideProperties[] = new Array();
let currentUtterance:(SpeechSynthesisUtterance | null) = null;
let currentSlide = -1;





if (params.has('data')) {
    const data = params.get('data')!;
    console.log('loading slideshow ', data);

    const ss = new SerializableSlideshow();
    ss.deserialize(data);
    ss.mapSlides((props:SlideProperties) => slides.push(props));
    
    if (ss.name) {
        document.getElementById('slideshow-name')!.textContent = ss.name;
    }
}

for (const slide of slides) {
    preloadImage(slide.imgURL);
    //TODO - wait to load some images if many slides
}

function showPlayer() {
    document.getElementById('intro')!.classList.add('hidden');
    document.getElementById('about')!.classList.add('hidden');
    document.getElementById('player')!.classList.remove('hidden');
}

function showIntro() {
    document.getElementById('player')!.classList.add('hidden');
    document.getElementById('intro')!.classList.remove('hidden');
    document.getElementById('about')!.classList.remove('hidden');
    document.getElementById('ctrl-start-slideshow')!.focus();
}


async function speak(text:string): Promise<void> {
    return new Promise((resolve,reject) => {
        const synth = window.speechSynthesis;
        if (currentUtterance || synth.speaking || synth.pending) {
            //any speaking should have finished before we speak again so this is handling unexpected event
            console.warn('New speech synthesis started before previous complete');
            synth.cancel();
            currentUtterance = null;
        }

        console.log('speaking: ', text);
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 0.7;
        currentUtterance.onerror = (e) => {
            console.error('error in speech synthesis: ', e.error);
            currentUtterance = null;
            reject();
        };
        //TODO - add a timeout on speaking pending too long
        currentUtterance.onend = () => {
            currentUtterance = null;
            resolve();
        };
        synth.speak(currentUtterance);
    });
}

function showImage(url:string) {
    const img = document.getElementById('displayImg') as HTMLImageElement;
    if (!url || url === '') {
        img.classList.add('invisible');
    }
    else
    {
        img.classList.remove('invisible');
        img.src = url;
    }
}


async function advanceSlide() {
    if (slides.length <= 0) {
        return;
    }

    currentSlide++;

    if (currentSlide == 0) {
        showPlayer();
        console.log('slideshow begins on slide ', currentSlide, slides[currentSlide]);
    }
    else if (currentSlide >= slides.length) {
        currentSlide = -1;
        showIntro();
        console.log('slideshow ends');
    }
    else {
        console.log('slide advances to ', currentSlide, slides[currentSlide]);
    }

    if (currentSlide >= 0) {
        showImage(slides[currentSlide].imgURL);

        if (slides[currentSlide].text.trim() === '') {
            if (slides[currentSlide].imgURL === '') {
                setTimeout(advanceSlide); //advance immediately as showing nothing
            }
            else {
                setTimeout(advanceSlide, slideTimeoutIfNoText);
            }
        }
        else {
            await speak(slides[currentSlide].text)
                .then(() => setTimeout(advanceSlide, slideLingerAfterSpeaking), 
                    () => setTimeout(advanceSlide, slideTimeoutIfNoText));
                    //waiting full timeout may be a while if error occurred at end of speaking, but most likely happens at start
        }
    }
    
}


document.getElementById('ctrl-start-slideshow')!.addEventListener('click', async () => {
    advanceSlide();
});

document.getElementById('ctrl-about')!.addEventListener('click', (event: MouseEvent) => {
    //button toggles the visibility of an expanding element
    const clickedButton = event.currentTarget as HTMLElement;
    const controlledID = clickedButton.getAttribute('aria-controls');
    if (controlledID) {
        const elemControlled = document.getElementById(controlledID)!;
        if (clickedButton.ariaExpanded === 'true') {
            clickedButton.ariaExpanded = 'false'
            elemControlled.ariaHidden = 'true';
        }
        else {
            clickedButton.ariaExpanded = 'true'
            elemControlled.ariaHidden = 'false';
        }
    }
});
