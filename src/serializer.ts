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
import { isValidImgURL } from "./slide-data.js";

export class SerializableSlideshow {
    protected dom: XMLDocument;

    constructor(xml:string = '') {
        this.dom = document.implementation.createDocument(null, 'slideshow');
        if (xml !== '') {
            this.deserialize(xml);
        }
    }

    get name():string {
        const slideshowNode = this.dom.documentElement;
        return slideshowNode.getAttribute('name') || '';
    }

    set name(newName:string) {
        const slideshowNode = this.dom.documentElement;
        const nameAttribute = document.createAttributeNS(null, "name");
        nameAttribute.value = newName;
        slideshowNode.attributes.setNamedItemNS(nameAttribute);
    }

    //throws URIError if not valid
    validateImgURL(imgURL:string):void {
        if (!isValidImgURL(imgURL)) {
            const message = 'Unapproved URL used for image ' + imgURL;
            console.error(message);
            throw URIError(message);
        }
    }

    appendSlide(slide: SlideProperties) {
        const slideshowNode = this.dom.documentElement;
        const slideNode = document.createElementNS(null, "slide");

        const imgAttribute = document.createAttributeNS(null, "image");
        this.validateImgURL(slide.imgURL);
        imgAttribute.value = slide.imgURL;
        slideNode.attributes.setNamedItemNS(imgAttribute);
        
        const textNode = document.createTextNode(slide.text);

        slideNode.appendChild(textNode);
        slideshowNode.appendChild(slideNode);
    }


    mapSlides(slideMappingCallback: (slideProperties:SlideProperties) => void) {
        const slides = this.dom.documentElement.children;
        for (const slide of slides) {
            const text = slide.textContent;
            const imgURL = slide.getAttribute('image') || '';
            this.validateImgURL(imgURL);
            slideMappingCallback({
                text: (text || ''),
                imgURL: (imgURL || '')
            });
        }

    }


    serialize():string {
        const s = new XMLSerializer();

        return s.serializeToString(this.dom);
    }


    //throws SyntaxError on failure to parse file
    deserialize(input: string) {
        let parser = new DOMParser();
        let inputDOM = parser.parseFromString(input, "application/xml");
        const errorNode = inputDOM.querySelector("parsererror");
            //on Chrome just want to select the div under parsererror but not sure that applies to all browsers
        if (errorNode) {
            const errorMessage = errorNode.innerHTML;
            throw new SyntaxError(errorMessage);
        }
        else if (inputDOM.documentElement.tagName !== 'slideshow') {
            throw new SyntaxError('Not a slideshow XML file');
        }
        else {
            this.dom = inputDOM;
        }
    }

}