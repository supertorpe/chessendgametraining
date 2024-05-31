export const textToImages = (text: string) => {
    const result: string[] = [];
    const words = text.split(" ");
    let cont = 1;
    let themeColor = document.querySelector('html')?.classList.contains('ion-palette-dark') ? 'w' : 'b';
    let color = 'w';
    words.forEach(word => {
        let image;
        word = word.toUpperCase();
        if (word == 'ONE') {
            cont = 1;
        } else if (word == 'TWO') {
            cont = 2;
        } else if (word == 'THREE') {
            image = `${themeColor}3.svg`;
            result.push(image);
            cont = 1;
        } else if (word == 'FOUR') {
            image = `${themeColor}4.svg`;
            result.push(image);
            cont = 1;
        } else if (word == 'FIVE') {
            image = `${themeColor}5.svg`;
            result.push(image);
            cont = 1;
        } else if (word == 'VS') {
            image = `${themeColor}swords.svg`;
            result.push(image);
            color = 'b';
        } else if (word.lastIndexOf('KING', 0) === 0) {
            for (let x = cont; x > 0; x--) {
                image = `${color}K.svg`
                result.push(image);
            }
            cont = 1;
        } else if (word.lastIndexOf('QUEEN', 0) === 0) {
            for (let x = cont; x > 0; x--) {
                image = `${color}Q.svg`
                result.push(image);
            }
            cont = 1;
        } else if (word.lastIndexOf('ROOK', 0) === 0) {
            for (let x = cont; x > 0; x--) {
                image = `${color}R.svg`
                result.push(image);
            }
            cont = 1;
        } else if (word.lastIndexOf('BISHOP', 0) === 0) {
            for (let x = cont; x > 0; x--) {
                image = `${color}B.svg`
                result.push(image);
            }
            cont = 1;
        } else if (word.lastIndexOf('KNIGHT', 0) === 0) {
            for (let x = cont; x > 0; x--) {
                image = `${color}N.svg`
                result.push(image);
            }
            cont = 1;
        } else if (word.lastIndexOf('PAWN', 0) === 0) {
            for (let x = cont; x > 0; x--) {
                image = `${color}P.svg`
                result.push(image);
            }
            cont = 1;
        }
    });
    return result;
};

export const urlIcon = (icon: string, pieceTheme: string) => {
    if (icon.includes('3.svg') || icon.includes('4.svg') || icon.includes('5.svg') || icon.includes('swords.svg') || icon.includes('elementary.svg')) {
        return `assets/icons/${icon}`;
    }
    else {
        return `assets/pieces/${pieceTheme}/${icon}`;
    }
};

export const ariaDescriptionFromIcon = (icon: string) => {
    if (icon.endsWith('3.svg')) return 'three';
    else if (icon.endsWith('4.svg')) return 'four';
    else if (icon.endsWith('5.svg')) return 'five';
    else if (icon.endsWith('elementary.svg')) return 'elementary';
    else if (icon.endsWith('swords.svg')) return 'against';
    else if (icon.endsWith('B.svg')) return 'bishop';
    else if (icon.endsWith('K.svg')) return 'king';
    else if (icon.endsWith('N.svg')) return 'knight';
    else if (icon.endsWith('P.svg')) return 'pawn';
    else if (icon.endsWith('Q.svg')) return 'queen';
    else if (icon.endsWith('R.svg')) return 'rook';
    else return 'unknown';
};

export const clone = (object: any) => {
    return JSON.parse(JSON.stringify(object));
};

const setTitle = (newTitle: string) => {
    window.document.title = newTitle;
};

const setMeta = (name: string, newValue: string) => {
    (window.document.getElementsByName(name)[0] as HTMLMetaElement).content = newValue;
};

export const setupSEO = (template: string, params: any) => {
    const page = template.replace('.html', '').replace('page-', '');
    setTitle(window.AlpineI18n.t(`${page}.seo.title`, params));
    setMeta('description', window.AlpineI18n.t(`${page}.seo.meta_description`, params));
};

export const pieceTotalCount = (fen: string) => {
    return fen.substring(0, fen.indexOf(" ")).replace(/\d/g, "").replace(/\//g, "").length;
};

export const pieceCount = (fen: string): { [key: string]: number } => {
    const pieceCount: { [key: string]: number } = {
        'P': 0, // White pawn
        'N': 0, // White knight
        'B': 0, // White bishop
        'R': 0, // White rook
        'Q': 0, // White queen
        'K': 0, // White king
        'p': 0, // Black pawn
        'n': 0, // Black knight
        'b': 0, // Black bishop
        'r': 0, // Black rook
        'q': 0, // Black queen
        'k': 0  // Black king
    };

    const rows = fen.split(' ')[0].split('/'); // Split FEN into rows
    rows.forEach((row) => {
        let file = 0;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (!isNaN(parseInt(char))) {
                file += parseInt(char); // If it's a number, skip that many files
            } else {
                pieceCount[char]++; // Increment count for the piece
                file++; // Move to the next file
            }
        }
    });

    return pieceCount;
}

export const isBot = (): boolean => {
    return navigator.userAgent.toLowerCase().includes('bot');
};

export const queryParam = (param: string) : string | null => {
    return new URLSearchParams(new URL(window.location.href).search).get(param);
};

export const randomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

