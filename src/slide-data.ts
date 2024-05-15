
export type SlideProperties = {text:string, imgURL:string};


export function isValidImgURL(imgURL:string): boolean {
    return imgURL === '' || !(imgURL.match(/images\/[\w\-\.]+/) === null)
    //overly stringent requirement to be extended
}