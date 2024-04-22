import { googleDriveService } from '../services';
import '../styles/loader.scss';

const params = new URLSearchParams(window.location.search);
const theme = params.get('theme') || 'dark';
if ('dark' == theme) {
    document.body.style.backgroundColor = 'black';
}
googleDriveService.initTokenClient(params.get('renew') == 'true').then((token) => {
    if (token) localStorage.setItem("GOOGLE_ACCESS_TOKEN", token);
    else localStorage.setItem("GOOGLE_ACCESS_TOKEN_ERROR", 'ERROR');
    window.close();
});