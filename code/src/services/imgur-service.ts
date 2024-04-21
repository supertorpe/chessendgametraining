import { fetchWithTimeout } from "../commons/fetch-timeout";

const URL = 'https://api.imgur.com/3/image';
const CLIENT_ID = import.meta.env.VITE_IMGUR_CLIENT_ID;
const IMAGE_SIZE = 350;

class ImgurService {

    public upload(dataUrl: string) : Promise<string> {
        return new Promise<string>(resolve => {
            const self = this;
            const img = new Image;
            img.onload = async function () {
                const newDataUri = self.resizeImage(img, IMAGE_SIZE, IMAGE_SIZE);
                const response = await fetch(URL, {
                    method: "POST",
                    headers: {
                        'Authorization': `Client-ID ' ${CLIENT_ID}`,
                        

                    },
                    body: JSON.stringify({
                        type: 'base64',
                        name: 'chessboard.png',
                        image: newDataUri.split(',')[1]
                      })
                });
                console.log(JSON.stringify(response));
                resolve('kkk');
            }
            img.src = dataUrl;
        });
    }

    private  resizeImage(img: CanvasImageSource, width: number, height: number) {
        const canvas = document.createElement('canvas'), ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL();
      }

}

export const imgurService = new ImgurService();
