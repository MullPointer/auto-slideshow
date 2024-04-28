export type SlideProperties = {text:string, imgURL:string};

export class SerializableSlideshow {
    protected dom: XMLDocument;

    constructor() {
        this.dom = document.implementation.createDocument(null, 'slideshow');
    }


    appendSlide(slide: SlideProperties) {
        const slideshowNode = this.dom.documentElement;
        const slideNode = document.createElementNS(null, "slide");

        const imgAttribute = document.createAttributeNS(null, "image");
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
            const imgURL = slide.getAttribute('image');
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


    //returns null on success or an error message if fails
    //TODO not sure this the most idomatic interface design
    deserialize(input: string): string {
        let parser = new DOMParser();
        let inputDOM = parser.parseFromString(input, "application/xml");
        const errorNode = inputDOM.querySelector("parsererror");
        if (errorNode) {
            return errorNode.textContent;
        }
        else if (inputDOM.documentElement.tagName !== 'slideshow') {
            return 'Not a slideshow XML file';
        }
        else {
            this.dom = inputDOM;
            return null;
        }
    }

}