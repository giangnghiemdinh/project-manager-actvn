export function hasMedia() {
    return !!(window && window.matchMedia);
}

export function loadStyle(path: string): Promise<any> {
    if (isStyleExisted(path)) return Promise.resolve({});
    const style = document.createElement('link');
    style.rel = 'stylesheet';
    style.href = path;
    return loadSource(style);
}

export function removeStyles(paths: string[], container = document.head): void {
    const rmElements = [];
    const styles = container.getElementsByTagName('link');

    for (let i = 0; i < styles.length; i++) {
        for (let path of paths) {
            if (styles[i].href.indexOf(path) > -1) {
                rmElements.push(styles[i]);
                break;
            }
        }
    }

    for (let element of rmElements) {
        element.remove && element.remove();
    }
}

function isStyleExisted(path: string): boolean {
    const styles = document.getElementsByTagName('link');
    for (let i = styles.length; i--;) {
        if (styles[i].href.indexOf(path) > -1) return true;
    }
    return false;
}

function loadSource(source: any): Promise<any> {
    return new Promise((resolve, reject) => {
        if (source.readyState) {  // IE
            source.onreadystatechange = () => {
                if (source.readyState === 'loaded' || source.readyState === 'loaded') {
                    source.onreadystatechange = null;
                    resolve({});
                }
            };
        } else {
            source.onload = () => resolve({});
        }
        source.onerror = (err: any) => reject(err);
        document.head.appendChild(source);
    });
}
