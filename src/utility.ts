

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

export async function uploadXMLFile() : Promise<string>{
    return new Promise((resolve,reject) => {
        let input: HTMLInputElement = document.createElement('input');
        input.type = 'file';
        input.multiple = false;
        input.accept = '.xml,application/xml';
        input.onchange = () => {
        let file: File = input.files[0];
        console.log('file selected to load ', file);
        if (file) {
            resolve(file);
        }
        else {
            reject('No file selected');
        }
        };
        input.click();
    }).then((file: File) => file.text());
}

export function downloadFile(uri: string, downloadName: string) {
    let anchor = document.createElement('a');
    anchor.href = uri;
    anchor.download = downloadName;
    anchor.click();
    //seems to work even though not attached to DOM - watch for platforms where it fails
}