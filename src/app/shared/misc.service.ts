import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MiscService {

  constructor() {
  }

  textToImages(text) {
    const result = [];
    const words = text.split(" ");
    let cont = 1;
    let color = 'w';
    words.forEach(word => {
      let image;
      word = word.toUpperCase();
      if (word == 'ONE') {
        cont = 1;
      } else if (word == 'TWO') {
        cont = 2;
      } else if (word == 'THREE') {
        image = '3.png';
        result.push(image);
        cont = 1;
      } else if (word == 'FOUR') {
        image = '4.png';
        result.push(image);
        cont = 1;
      } else if (word == 'FIVE') {
        image = '5.png';
        result.push(image);
        cont = 1;
      } else if (word == 'VS') {
        image = 'swords.png';
        result.push(image);
        color = 'b';
      } else if (word.lastIndexOf('KING', 0) === 0) {
        for (let x = cont; x > 0; x--) {
          image = color + 'K.png';
          result.push(image);
        }
        cont = 1;
      } else if (word.lastIndexOf('QUEEN', 0) === 0) {
        for (let x = cont; x > 0; x--) {
          image = color + 'Q.png';
          result.push(image);
        }
        cont = 1;
      } else if (word.lastIndexOf('ROOK', 0) === 0) {
        for (let x = cont; x > 0; x--) {
          image = color + 'R.png';
          result.push(image);
        }
        cont = 1;
      } else if (word.lastIndexOf('BISHOP', 0) === 0) {
        for (let x = cont; x > 0; x--) {
          image = color + 'B.png';
          result.push(image);
        }
        cont = 1;
      } else if (word.lastIndexOf('KNIGHT', 0) === 0) {
        for (let x = cont; x > 0; x--) {
          image = color + 'N.png';
          result.push(image);
        }
        cont = 1;
      } else if (word.lastIndexOf('PAWN', 0) === 0) {
        for (let x = cont; x > 0; x--) {
          image = color + 'P.png';
          result.push(image);
        }
        cont = 1;
      }
    });
    return result;
  };

  urlIcon(icon, pieceTheme) {
    if ('3.png' === icon || '4.png' === icon || '5.png' === icon || 'swords.png' === icon || 'elementary.png' === icon) {
      return '/assets/icon/' + icon.replace('.png', '.svg');
    }
    else
    {
      return `/assets/pieces/${pieceTheme}/${icon.replace('.png', '.svg')}`;
    }

  }
  
}
