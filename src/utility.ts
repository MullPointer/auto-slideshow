

//from https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
export function isValidHttpUrl(s: string) {
    let url;
    
    try {
      url = new URL(s);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
}

export function makeFileName(s:string, defaultName:string): string {
    //referring to https://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
    s = s.replace(/\<\>\:\"\/\\\|\?\*/g,''); //characters not allowed on Windows
    s = s.replace(/[\x00-\x1F]/g, ''); //non-printing characters
    s = s.replace(/[\W\.]+$/g, ''); //trailing dots and spaces
    s = s.replace(/ /g, '-');
    s = s.replace(/(^CON$)|(^PRN$)|(^AUX$)|(^NUL$)|(^COM[1-9]$)|(^LPT[1-9]$)/i, ''); //full names disallowed on Windows
    s = s.toLocaleLowerCase();
    if (s === '') {
        return defaultName;
    }
    else {
        return s;
    }
}




export async function uploadXMLFile() : Promise<string>{
    return new Promise((resolve:((value: File) => void),reject:((value: string) => void)) => {
        let input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.multiple = false;
        input.accept = '.xml,application/xml';
        input.onchange = () => {
        let file: File = input.files![0];
        console.log('file selected to load ', file);
        if (file) {
            resolve(file);
        }
        else {
            reject('No file selected');
        }
        };
        input.click();
    }).then((value: File) => value.text());
}

export function downloadFile(uri: string, downloadName: string) {
    let anchor = document.createElement('a');
    anchor.href = uri;
    anchor.download = downloadName;
    anchor.click();
    //seems to work even though not attached to DOM - watch for platforms where it fails
}

//from https://webdesign.tutsplus.com/best-ways-to-preload-images-using-javascript-css-and-html--cms-41329t
export function preloadImage(imageURL: string) {
    let img = new Image();
    img.src = imageURL;
}