

import { SlideProperties } from "./slide-data.js";
import { SerializableSlideshow } from "./serializer.js";
import { preloadImage } from "./utility.js";




const params = new URLSearchParams(window.location.search);
const slides:SlideProperties[] = new Array();
let currentSlide = -1;

if (params.has('data')) {
    const data = params.get('data');
    console.log('loading slideshow ', data);

    const ss = new SerializableSlideshow();
    ss.deserialize(data);
    ss.mapSlides((props:SlideProperties) => slides.push(props));
}

for (const slide of slides) {
    preloadImage(slide.imgURL);
    //TODO - wait to load some images if many slides
}


document.getElementById('ctrl-start-slideshow').addEventListener('click', (
    event: PointerEvent & { target: HTMLInputElement }
    ) => {
    

});
