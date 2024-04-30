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