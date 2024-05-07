import {  toastController } from '@ionic/core';

export const showToast = (message: string, position: "top" | "bottom" | "middle", color: string, duration: number) => {
    try {
        toastController.create({
            message: window.AlpineI18n.t(message),
            position: position,
            color: color,
            duration: duration
        }).then(toast => toast.present())
    } catch (error) {
        console.log(error);
    }
}

