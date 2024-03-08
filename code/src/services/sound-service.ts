import { Howl } from 'howler';

import { configurationService } from './configuration-service';
import { soundJson } from '../static';

type SOUND_ITEM = {
    key: string,
    audio: Howl
}

class SoundService {

    private sounds: SOUND_ITEM[] = [];

    public playAudio(sound: string) {
        if (configurationService.configuration.playSounds) {
            const soundToPlay = this.sounds.find((item) => { return item.key === sound; });
            if (soundToPlay && (sound !== 'fail' || !soundToPlay.audio.playing())) {
                soundToPlay.audio.play();
            }
        }
    }

    public init() {
        soundJson.sounds.forEach(item => this.sounds.push({ key: item.key, audio: new Howl({ src: [item.audio] }) }))
    }
}

export const soundService = new SoundService();
