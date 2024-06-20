

//WebComponent for single slide editor

import { SlideProperties } from "./slide-data.js";


export class SlideSection extends HTMLElement {
    protected _imgInput = this.querySelector('input[type=image]') as HTMLInputElement;
    private _imgURL = '';
  
    get slideText(): string {
      return this.querySelector('textarea')!.value;
    }
    set slideText(value) {
      this.querySelector('textarea')!.value = value;
    }
  
    get imgURL(): string {
      return this._imgURL;
    }
    set imgURL(value) {
      this._imgURL = value; //need to store separately as input element returns page URL if no src set
      this._imgInput.src = value;
    }

    //TODO make imgAlt part of properties that can be serialized
    get imgAlt(): string {
      return this._imgInput.alt;
    }
    set imgAlt(altText: string) {
      this._imgInput.alt = altText;
    }
  
    get slideProps(): SlideProperties {
      return {
        text: this.slideText,
        imgURL: this.imgURL
      };
    }
    set slideProps(props:SlideProperties) {
      this.slideText = props.text;
      this.imgURL = props.imgURL;
    }
  
    nextSlide() : SlideSection | null {
      let checkNode = this.nextElementSibling ;
      while (checkNode instanceof HTMLElement && checkNode)
      {
        if (checkNode instanceof SlideSection) { 
          return checkNode;
        }
        else {
          checkNode = checkNode.nextElementSibling;
        }
      }
      return null;
    }
  
    previousSlide() : SlideSection | null {
      let checkNode = this.previousElementSibling;
      while (checkNode instanceof HTMLElement && checkNode)
      {
        if (checkNode instanceof SlideSection) {
          return checkNode;
        }
        else {
          checkNode = checkNode.previousElementSibling;
        }
      }
      return null;
    }
  
}
  

window.customElements.define('slide-section', SlideSection);