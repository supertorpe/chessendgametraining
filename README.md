[Chess Endgame Training](https://github.com/supertorpe/chessendgametraining)
<a style="margin-bottom: 0;" href='https://play.google.com/store/apps/details?id=com.supertorpe.chessendgametraining'><img alt='Get it on Google Play' src='https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png' height="80px"/></a>
--------------------

Chess Endgame Training is an [ionic](https://ionicframework.com/) / [cordova](https://cordova.apache.org/) application. It is written
in [TypeScript](http://www.typescriptlang.org/) and [Angular](https://angular.io/).

It is distributed in both [Android App](https://play.google.com/store/apps/details?id=com.supertorpe.chessendgametraining) and [Progressive Web App](https://chess-endgame-trainer.web.app). The Web App allows to open an arbitrary position from a FEN string indicating the objective to achieve (checkmate or draw) : https://chess-endgame-trainer.web.app/fen/FEN_STRING/TARGET

TARGET is checkmate by default. Examples:

[https://chess-endgame-trainer.web.app/fen/8/4p1p1/8/7k/2qN3B/4P1P1/2B4K/8 w - - 0 1](https://chess-endgame-trainer.web.app/fen/8/4p1p1/8/7k/2qN3B/4P1P1/2B4K/8%20w%20-%20-%200%201)
[https://chess-endgame-trainer.web.app/fen/8/5qpB/5P2/4B2N/8/p7/P2k4/K7 w - - 0 1/draw](https://chess-endgame-trainer.web.app/fen/8/5qpB/5P2/4B2N/8/p7/P2k4/K7%20w%20-%20-%200%201/draw)

## Screenshots
<div style="display:flex;" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/01_home-dark.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/03_menu-dark.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/04_list-dark.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/05_position-dark.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/06_config-dark.png" width="19%" >
</div>
<div style="display:flex;" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/01_home-light.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/03_menu-light.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/04_list-light.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/05_position-light.png" width="19%" >
<img style="margin-left:10px;" src="resources/screenshots/phone/en/06_config-light.png" width="19%" >
</div>
Following software and resources has been used:

* [chess.js](https://github.com/jhlywa/chess.js): A Javascript chess library for chess move generation/validation, piece placement/movement, and check/checkmate/draw detection
* [chessboard.js](http://chessboardjs.com): A Javascript chess board
* [stockfish.js](https://github.com/niklasf/stockfish.js): The strong open source chess engine Stockfish compiled to JavaScript and WebAssembly using Emscripten
* [Lichess Syzygy endgame tablebases API](https://github.com/niklasf/lila-tablebase): Online database with information for all endgame positions with up to 7 pieces
* [ECO Chess Opening Codes Endgame database](http://ecochessopeningcodes.blogspot.com.es/2016/01/play-chess-endgame-positions-with.html): Database of chess endgames
* Free Icons by Smashicons from Flaticon, Inipagi from Iconfinder and Cburnett from Wikimedia Commons 
