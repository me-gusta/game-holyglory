const localStorageKey = 'hogl-player_avatar';

async function fetchAndStoreImage(url, key) {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            if (typeof base64data === "string") {
                localStorage.setItem(key, base64data);
            }
            resolve(base64data);
        };
        reader.readAsDataURL(blob);
    });
}

export default async (url: string) => {
    if (url && !localStorage.getItem(localStorageKey)) await fetchAndStoreImage(url, localStorageKey)
}